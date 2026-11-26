"use strict";

/**
 * Validates the app's `layout` config (ui-src/api/contract.ts, layoutSchema)
 * without the TS contract: the same rules, so api/plugin-layout.test.ts holds
 * both to one set of fixtures. Returns every problem as "<path>: <reason>".
 */

const { pduSocketKey } = require("./topology");

const isMapping = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isName = (v) => typeof v === "string" && v.length > 0;
const isUnset = (v) => v === undefined || v === null;

function validateLayout(layout) {
  const errors = [];
  const fail = (path, reason) => errors.push(`${path}: ${reason}`);

  if (!isMapping(layout)) return ["layout: must be a mapping"];
  if (!Array.isArray(layout.containers)) return ["layout.containers: must be a list"];

  const containerIds = new Set();
  // Checked once every miner and meter is known: an env device may be shared
  // by several containers (a site sensor) but may not be a miner or a meter.
  const envDevices = [];
  // Likewise checked at the end; one container device per container.
  const containerDevices = [];
  const containerDeviceIds = new Set();
  const rackIds = new Set();
  const deviceIds = new Set();
  const device = (path, id) => {
    if (deviceIds.has(id)) fail(path, `duplicate device id "${id}"`);
    deviceIds.add(id);
  };

  if (layout.siteMeterDeviceId !== undefined && layout.siteMeterDeviceId !== null) {
    if (!isName(layout.siteMeterDeviceId))
      fail("layout.siteMeterDeviceId", "must be a non-empty string or null");
    else device("layout.siteMeterDeviceId", layout.siteMeterDeviceId);
  }

  layout.containers.forEach((container, ci) => {
    const cp = `layout.containers[${ci}]`;
    if (!isMapping(container)) {
      fail(cp, "must be a mapping");
      return;
    }
    if (!isName(container.id)) fail(`${cp}.id`, "must be a non-empty string");
    else if (containerIds.has(container.id))
      fail(`${cp}.id`, `duplicate container id "${container.id}"`);
    containerIds.add(container.id);
    if (!isName(container.name)) fail(`${cp}.name`, "must be a non-empty string");
    if (!isName(container.model)) fail(`${cp}.model`, "must be a non-empty string");
    if (typeof container.nominalHashrateThs !== "number" || !(container.nominalHashrateThs >= 0)) {
      fail(`${cp}.nominalHashrateThs`, "must be a number >= 0");
    }
    if (container.meterDeviceId !== null) {
      if (!isName(container.meterDeviceId))
        fail(`${cp}.meterDeviceId`, "must be a non-empty string or null");
      else device(`${cp}.meterDeviceId`, container.meterDeviceId);
    }
    if (container.envDeviceId !== undefined && container.envDeviceId !== null) {
      if (!isName(container.envDeviceId))
        fail(`${cp}.envDeviceId`, "must be a non-empty string or null");
      else envDevices.push([`${cp}.envDeviceId`, container.envDeviceId]);
    }
    const hasContainerDevice = !isUnset(container.containerDeviceId);
    if (hasContainerDevice) {
      if (!isName(container.containerDeviceId))
        fail(`${cp}.containerDeviceId`, "must be a non-empty string or null");
      else if (containerDeviceIds.has(container.containerDeviceId))
        fail(
          `${cp}.containerDeviceId`,
          `duplicate container device "${container.containerDeviceId}"`,
        );
      else {
        containerDeviceIds.add(container.containerDeviceId);
        containerDevices.push([`${cp}.containerDeviceId`, container.containerDeviceId]);
      }
    }
    const pduSockets = new Set();
    if (!Array.isArray(container.racks)) {
      fail(`${cp}.racks`, "must be a list");
      return;
    }

    container.racks.forEach((rack, ri) => {
      const rp = `${cp}.racks[${ri}]`;
      if (!isMapping(rack)) {
        fail(rp, "must be a mapping");
        return;
      }
      if (!isName(rack.id)) fail(`${rp}.id`, "must be a non-empty string");
      else if (rackIds.has(rack.id)) fail(`${rp}.id`, `duplicate rack id "${rack.id}"`);
      rackIds.add(rack.id);
      if (!isName(rack.name)) fail(`${rp}.name`, "must be a non-empty string");
      if (!Array.isArray(rack.sockets)) {
        fail(`${rp}.sockets`, "must be a list");
        return;
      }

      const positions = new Set();
      rack.sockets.forEach((socket, si) => {
        const sp = `${rp}.sockets[${si}]`;
        if (!isMapping(socket)) {
          fail(sp, "must be a mapping");
          return;
        }
        if (!isName(socket.position)) fail(`${sp}.position`, "must be a non-empty string");
        else if (positions.has(socket.position))
          fail(`${sp}.position`, `duplicate socket position "${socket.position}"`);
        positions.add(socket.position);
        if (socket.deviceId !== null) {
          if (!isName(socket.deviceId))
            fail(`${sp}.deviceId`, "must be a non-empty string or null");
          else device(`${sp}.deviceId`, socket.deviceId);
        }
        if (isUnset(socket.pdu) !== isUnset(socket.socket)) {
          fail(sp, "pdu and socket go together");
        } else if (!isUnset(socket.pdu)) {
          if (!isName(socket.pdu) || !isName(socket.socket)) {
            fail(sp, "pdu and socket must be non-empty strings or null");
            return;
          }
          if (!hasContainerDevice) fail(sp, "a PDU socket needs the container's containerDeviceId");
          const key = pduSocketKey(socket.pdu, socket.socket);
          if (pduSockets.has(key)) fail(sp, `duplicate PDU socket "${key}"`);
          pduSockets.add(key);
        }
      });
    });
  });

  for (const [path, id] of envDevices) {
    if (deviceIds.has(id)) fail(path, `env device "${id}" is also a miner or a meter`);
  }
  for (const [path, id] of containerDevices) {
    if (deviceIds.has(id)) fail(path, `container device "${id}" is also a miner or a meter`);
  }

  return errors;
}

module.exports = { validateLayout };
