"use strict";

/**
 * Validates the app's `layout` config (ui-src/api/contract.ts, layoutSchema)
 * without the TS contract: the same rules, so api/plugin-layout.test.ts holds
 * both to one set of fixtures. Returns every problem as "<path>: <reason>".
 */

const isMapping = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isName = (v) => typeof v === "string" && v.length > 0;

function validateLayout(layout) {
  const errors = [];
  const fail = (path, reason) => errors.push(`${path}: ${reason}`);

  if (!isMapping(layout)) return ["layout: must be a mapping"];
  if (!Array.isArray(layout.containers)) return ["layout.containers: must be a list"];

  const containerIds = new Set();
  const rackIds = new Set();
  const deviceIds = new Set();
  const device = (path, id) => {
    if (deviceIds.has(id)) fail(path, `duplicate device id "${id}"`);
    deviceIds.add(id);
  };

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
      });
    });
  });

  return errors;
}

module.exports = { validateLayout };
