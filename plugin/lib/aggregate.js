"use strict";

const {
  MINERS_DEFAULT_PAGE_SIZE,
  MINERS_MAX_PAGE_SIZE,
  POWER_MODES,
} = require("./contract-limits");

/**
 * The contract's read bodies from a topology (./topology.js) and a snapshot:
 * `{ ts, miners: Map<deviceId, Miner>, meters: Map<deviceId, { powerW }> }`.
 * Pure: the worker site and the mock site both go through here, so their
 * totals, counts and shared values agree.
 */

function emptyStatusCounts() {
  return { offline: 0, error: 0, sleep: 0, low: 0, normal: 0, high: 0, empty: 0 };
}

/** The one value every item shares, or null when they differ or there are none. */
function sharedValue(values) {
  if (values.length === 0) return null;
  return values.every((value) => value === values[0]) ? values[0] : null;
}

/** Power modes every miner of the set accepts, in contract order. */
function commonPowerModes(miners) {
  if (miners.length === 0) return [];
  return POWER_MODES.filter((mode) => miners.every((m) => m.supportedPowerModes.includes(mode)));
}

function minersOf(snapshot, ids) {
  const miners = [];
  for (const id of ids) {
    const miner = snapshot.miners.get(id);
    if (miner !== undefined) miners.push(miner);
  }
  return miners;
}

function totals(miners) {
  const minerStatus = emptyStatusCounts();
  let hashrateThs = 0;
  let powerW = 0;
  for (const miner of miners) {
    hashrateThs += miner.hashrateThs;
    powerW += miner.powerW;
    minerStatus[miner.status] += 1;
  }
  return { hashrateThs, powerW, minerStatus };
}

function rackSummary(topology, snapshot, rack) {
  const result = totals(minersOf(snapshot, topology.minerIdsIn({ rackId: rack.id })));
  result.minerStatus.empty = rack.sockets.filter((socket) => socket.deviceId === null).length;
  return { id: rack.id, name: rack.name, containerId: rack.containerId, ...result };
}

function containerSummary(topology, snapshot, container) {
  const miners = minersOf(snapshot, container.minerIds);
  const racks = container.racks.map((rack) => rackSummary(topology, snapshot, rack));
  const result = totals(miners);
  result.minerStatus.empty = racks.reduce((sum, rack) => sum + rack.minerStatus.empty, 0);
  return {
    id: container.id,
    name: container.name,
    model: container.model,
    ...result,
    powerMode: sharedValue(miners.map((m) => m.powerMode)),
    powerPct: sharedValue(miners.map((m) => m.powerPct)),
    supportedPowerModes: commonPowerModes(miners),
    racks,
  };
}

function siteSummary(topology, snapshot) {
  const miners = minersOf(snapshot, topology.minerIds);
  const result = totals(miners);
  const { offline, error } = result.minerStatus;
  return {
    miners: { total: miners.length, online: miners.length - offline - error, error, offline },
    hashrateThs: result.hashrateThs,
    powerW: result.powerW,
  };
}

function containers(topology, snapshot) {
  return { containers: topology.containers.map((c) => containerSummary(topology, snapshot, c)) };
}

/** Null when the container does not exist. */
function containerLayout(topology, snapshot, id) {
  const container = topology.containerById.get(id);
  if (container === undefined) return null;
  const summary = containerSummary(topology, snapshot, container);
  return {
    container: {
      id: summary.id,
      name: summary.name,
      model: summary.model,
      hashrateThs: summary.hashrateThs,
      powerW: summary.powerW,
    },
    racks: container.racks.map((rack) => ({
      id: rack.id,
      name: rack.name,
      sockets: rack.sockets.map((socket) => ({
        position: socket.position,
        miner: socket.deviceId === null ? null : (snapshot.miners.get(socket.deviceId) ?? null),
      })),
    })),
  };
}

function powerMeters(topology, snapshot) {
  const meters = [];
  for (const container of topology.containers) {
    if (container.meterDeviceId === null) continue;
    const miners = minersOf(snapshot, container.minerIds);
    const reading = snapshot.meters.get(container.meterDeviceId);
    meters.push({
      id: container.meterDeviceId,
      name: container.meterDeviceId,
      containerId: container.id,
      powerW: reading === undefined ? 0 : reading.powerW,
      hashrateThs: totals(miners).hashrateThs,
      miners: miners.length,
    });
  }
  const site = totals(minersOf(snapshot, topology.minerIds));
  return {
    siteMeterPowerW: meters.reduce((sum, meter) => sum + meter.powerW, 0),
    minersPowerW: site.powerW,
    hashrateThs: site.hashrateThs,
    meters,
  };
}

/** One page of miners, in layout order, narrowed by container and a search over id, serial, IP and position. */
function miners(topology, snapshot, query) {
  const page = Math.max(query.page ?? 1, 1);
  const pageSize = Math.min(
    Math.max(query.pageSize ?? MINERS_DEFAULT_PAGE_SIZE, 1),
    MINERS_MAX_PAGE_SIZE,
  );
  const search = (query.search ?? "").trim().toLowerCase();
  const matches = minersOf(
    snapshot,
    topology.minerIdsIn({ containerId: query.containerId }),
  ).filter(
    (m) =>
      search === "" ||
      [m.id, m.serial, m.ip, m.position].some((field) => field.toLowerCase().includes(search)),
  );
  return {
    items: matches.slice((page - 1) * pageSize, page * pageSize),
    total: matches.length,
    page,
    pageSize,
  };
}

module.exports = {
  commonPowerModes,
  containerLayout,
  containerSummary,
  containers,
  emptyStatusCounts,
  miners,
  minersOf,
  powerMeters,
  sharedValue,
  siteSummary,
  totals,
};
