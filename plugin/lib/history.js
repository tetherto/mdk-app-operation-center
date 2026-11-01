"use strict";

const { INTERVAL_MS, bucketStarts } = require("./history-window");

const scopeOf = (query) => {
  if (query.rackId !== undefined) return `rack:${query.rackId}`;
  if (query.containerId !== undefined) return `container:${query.containerId}`;
  return "site";
};

/**
 * A history series from the store: one point per bucket of the resolved
 * query (./history-window.js), each the average of the samples in it. A
 * bucket with no sample is left out rather than zero-filled, so a gap
 * (restart, Kernel down) shows as a gap. `nominal` is the sum of the layout's
 * nominal hashrate over the scope's occupied sockets.
 */
function historySeries({ topology, store, query, now = Date.now() }) {
  const scope = scopeOf(query);
  const step = INTERVAL_MS[query.interval];
  const field = query.metric === "hashrate" ? "hashrateThs" : "powerW";
  const points = [];
  for (const ts of bucketStarts(query, now)) {
    const samples = store.query(scope, ts, ts + step);
    if (samples.length === 0) continue;
    const sum = samples.reduce((total, sample) => total + sample[field], 0);
    points.push({ ts, value: sum / samples.length });
  }
  if (query.metric === "power") {
    return { metric: "power", interval: query.interval, unit: "W", points };
  }
  return {
    metric: "hashrate",
    interval: query.interval,
    unit: "TH/s",
    points,
    nominal: nominalOf(topology, query),
  };
}

/** The layout's nominal hashrate summed over the scope's occupied sockets. */
function nominalOf(topology, { containerId, rackId }) {
  let nominal = 0;
  for (const id of topology.minerIdsIn({ containerId, rackId })) {
    const { containerId: owner } = topology.deviceById.get(id);
    nominal += topology.containerById.get(owner).nominalHashrateThs;
  }
  return nominal;
}

module.exports = { historySeries, nominalOf, scopeOf };
