"use strict";

/**
 * Indexes over a validated layout (see ./layout.js): what sits where. Built
 * once at boot; pure lookups, no I/O. Device order is the layout's order
 * (container, rack, socket), which is the order the miners list uses.
 */
function createTopology(layout) {
  const containers = [];
  const containerById = new Map();
  const rackById = new Map();
  const deviceById = new Map();
  const minerIds = [];
  const meterIds = [];

  for (const container of layout.containers) {
    const racks = [];
    for (const rack of container.racks) {
      const sockets = rack.sockets.map((socket) => ({
        position: socket.position,
        deviceId: socket.deviceId,
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
      racks,
      minerIds: racks.flatMap((rack) =>
        rack.sockets.flatMap((socket) => (socket.deviceId === null ? [] : [socket.deviceId])),
      ),
    };
    if (container.meterDeviceId !== null) {
      deviceById.set(container.meterDeviceId, { kind: "meter", containerId: container.id });
      meterIds.push(container.meterDeviceId);
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

module.exports = { createTopology };
