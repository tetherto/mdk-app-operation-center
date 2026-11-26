"use strict";

const { INTERVAL_MS, bucketStarts } = require("./history-window");

const scopeOf = (query) => {
  if (query.rackId !== undefined) return `rack:${query.rackId}`;
  if (query.containerId !== undefined) return `container:${query.containerId}`;
  return "site";
};

/**
 * A history series from the app's own samples: one point per bucket of the
 * resolved query (./history-window.js), each the average of the samples in
 * it. The whole window is one range read, grouped by bucket. A bucket
 * with no sample is left out rather than zero-filled, so a gap
 * (restart, Kernel down) shows as a gap.
 */
async function historySeries({ topology, store, query, now = Date.now() }) {
  const scope = scopeOf(query);
  const step = INTERVAL_MS[query.interval];
  const field = query.metric === "hashrate" ? "hashrateThs" : "powerW";
  const starts = bucketStarts(query, now);
  const samples = await store.query(scope, starts[0], starts[starts.length - 1] + step);
  const points = [];
  for (const sample of samples) {
    const ts = Math.floor(sample.ts / step) * step;
    let point = points[points.length - 1];
    if (point === undefined || point.ts !== ts) {
      point = { ts, sum: 0, count: 0 };
      points.push(point);
    }
    point.sum += sample[field];
    point.count += 1;
  }
  return shapeSeries(
    topology,
    query,
    points.map(({ ts, sum, count }) => ({ ts, value: sum / count })),
  );
}

/**
 * The contract's History body around a series of `{ ts, value }` points.
 * `nominal` is the sum of the layout's nominal hashrate over the scope's
 * occupied sockets.
 */
function shapeSeries(topology, query, points) {
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

module.exports = { historySeries, nominalOf, scopeOf, shapeSeries };
