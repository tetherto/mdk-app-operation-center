"use strict";

/**
 * Indexes over a validated layout (see ./layout.js): what sits where. Built
 * once at boot; pure lookups, no I/O. Device order is the layout's order
 * (container, rack, socket), which is the order the miners list uses.
 * `meterIds` holds every meter to read: the site meter, if any, then the
 * containers' meters. `envIds` holds every env device to read, once each:
 * containers may share one (a site sensor).
 */
/** One PDU socket of a container, as layout sockets and PDU readings are matched. */
const pduSocketKey = (pdu, socket) => `${pdu} / ${socket}`;

function createTopology(layout) {
  const containers = [];
  const containerById = new Map();
  const rackById = new Map();
  const deviceById = new Map();
  const minerIds = [];
  const meterIds = [];
  const envIds = new Set();
  const siteMeterDeviceId = layout.siteMeterDeviceId ?? null;
  if (siteMeterDeviceId !== null) {
    deviceById.set(siteMeterDeviceId, { kind: "meter", containerId: null });
    meterIds.push(siteMeterDeviceId);
  }

  for (const container of layout.containers) {
    const racks = [];
    for (const rack of container.racks) {
      const sockets = rack.sockets.map((socket) => ({
        position: socket.position,
        deviceId: socket.deviceId,
        // The PDU socket feeding it on the container's device; both null when unmapped.
        pdu: socket.pdu ?? null,
        socket: socket.socket ?? null,
      }));
      const entry = { id: rack.id, name: rack.name, containerId: container.id, sockets };
      rackById.set(rack.id, entry);
      racks.push(entry);
      for (const socket of sockets) {
        if (socket.deviceId === null) continue;
        deviceById.set(socket.deviceId, {
          kind: "miner",
          containerId: container.id,
          rackId: rack.id,
          position: socket.position,
        });
        minerIds.push(socket.deviceId);
      }
    }
    const entry = {
      id: container.id,
      name: container.name,
      model: container.model,
      nominalHashrateThs: container.nominalHashrateThs,
      meterDeviceId: container.meterDeviceId,
      envDeviceId: container.envDeviceId ?? null,
      containerDeviceId: container.containerDeviceId ?? null,
      racks,
      minerIds: racks.flatMap((rack) =>
        rack.sockets.flatMap((socket) => (socket.deviceId === null ? [] : [socket.deviceId])),
      ),
    };
    if (container.meterDeviceId !== null) {
      deviceById.set(container.meterDeviceId, { kind: "meter", containerId: container.id });
      meterIds.push(container.meterDeviceId);
    }
    if (entry.envDeviceId !== null) {
      // No containerId: several containers may share the device.
      deviceById.set(entry.envDeviceId, { kind: "env" });
      envIds.add(entry.envDeviceId);
    }
    // May be the env device too; either way it is read, never a miner or meter.
    if (entry.containerDeviceId !== null) {
      deviceById.set(entry.containerDeviceId, { kind: "container", containerId: container.id });
    }
    containerById.set(container.id, entry);
    containers.push(entry);
  }

  return {
    containers,
    containerById,
    rackById,
    deviceById,
    minerIds,
    meterIds,
    envIds: [...envIds],
    /** The meter of the whole site (cooling included); null when the layout names none. */
    siteMeterDeviceId,
    /** Miner device ids of one container or rack; every miner when neither is given. */
    minerIdsIn({ containerId, rackId } = {}) {
      if (rackId !== undefined) {
        const rack = rackById.get(rackId);
        return rack === undefined
          ? []
          : rack.sockets.flatMap((s) => (s.deviceId === null ? [] : [s.deviceId]));
      }
      if (containerId !== undefined) return containerById.get(containerId)?.minerIds ?? [];
      return minerIds;
    },
  };
}

module.exports = { createTopology, pduSocketKey };
