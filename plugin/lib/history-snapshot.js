"use strict";

const { GONE_WORKER_STATES } = require("./fleet");
const { shapeSeries } = require("./history");
const { INTERVAL_MS, bucketStarts } = require("./history-window");

/** The Workers' telemetry names behind each history metric; the first a miner has readings for is used. */
const CHANNELS = { hashrate: ["hashrate_rt", "hashrate_avg"], power: ["power"] };

const number = (value) => (typeof value === "number" && Number.isFinite(value) ? value : null);

/**
 * /api/history from the Workers' own telemetry stores, through the Kernel's
 * snapshot read (`pullSnapshot` with a range): one round trip, no device call
 * and nothing kept in the app. `series()` resolves null when the stack cannot
 * serve it and the caller falls back to the app's own samples: a client or
 * Kernel without the read (MDK 0.13.0), a Worker that keeps no store (no
 * `telemetryPollIntervalMs`, reported under `errors`) or a failed read. A
 * Worker missing from the answer would under-count the scope, so one Worker's
 * error falls the whole query back.
 *
 * The Worker answers the stored reading nearest to each bucket start
 * (`granularity` is the bucket length), so a point is that reading summed over
 * the scope's miners rather than the bucket's average the sampler computes. A
 * miner without a reading in a bucket counts 0, as an offline miner does in a
 * sample; a bucket no miner has a reading for is left out.
 */
function createSnapshotHistory({ client, topology, logger }) {
  const unavailable = (reason) => {
    if (logger) logger.debug("history: snapshot read unavailable (%s), serving samples", reason);
    return null;
  };

  async function hostsOf(ids) {
    const { workers } = await client.listWorkers();
    const wanted = new Set(ids);
    const hosts = new Set();
    for (const worker of Array.isArray(workers) ? workers : []) {
      if (GONE_WORKER_STATES.has(worker.state)) continue;
      const deviceIds = Array.isArray(worker.deviceIds) ? worker.deviceIds : [];
      if (deviceIds.some((id) => wanted.has(id))) hosts.add(worker.workerId);
    }
    return [...hosts];
  }

  async function series(query, now = Date.now()) {
    if (typeof client.pullSnapshot !== "function") return unavailable("client has no pullSnapshot");
    const ids = topology.minerIdsIn({ containerId: query.containerId, rackId: query.rackId });
    const starts = bucketStarts(query, now);
    if (ids.length === 0 || starts.length === 0) return unavailable("nothing to read");
    const step = INTERVAL_MS[query.interval];
    const from = starts[0];
    const to = Math.min(starts[starts.length - 1] + step - 1, now);

    let snap;
    try {
      const workers = await hostsOf(ids);
      if (workers.length === 0) return unavailable("no worker hosts the scope");
      snap = await client.pullSnapshot({
        workers,
        metrics: CHANNELS[query.metric],
        from,
        to,
        granularity: step,
      });
    } catch (err) {
      return unavailable(err && err.message);
    }
    if (snap === null || typeof snap !== "object") return unavailable("no answer");
    if (typeof snap.error === "string") return unavailable(snap.error);
    if (snap.errors && typeof snap.errors === "object" && Object.keys(snap.errors).length > 0) {
      return unavailable(Object.values(snap.errors).join("; "));
    }
    if (snap.devices === null || typeof snap.devices !== "object") return unavailable("no devices");
    const points = sumReadings(snap.devices, ids, query.metric, starts, step);
    if (logger) logger.debug("history: %d points from the Workers' stores", points.length);
    return shapeSeries(topology, query, points);
  }

  return { series };
}

/**
 * One `{ ts, value }` per bucket at least one miner has a reading in: each
 * miner's reading nearest to the bucket start, summed. A reading the handler
 * failed for (`{ error }`) counts 0.
 */
function sumReadings(devices, ids, metric, starts, step) {
  const from = starts[0];
  const last = starts.length - 1;
  const totals = new Map();
  for (const id of ids) {
    const device = devices[id];
    const readings =
      device && device.metrics && typeof device.metrics === "object"
        ? readingsOf(device.metrics, CHANNELS[metric])
        : [];
    const nearest = new Map();
    for (const point of readings) {
      const ts = number(point && point.ts);
      if (ts === null) continue;
      const index = Math.min(Math.max(Math.round((ts - from) / step), 0), last);
      const distance = Math.abs(ts - starts[index]);
      const held = nearest.get(index);
      if (held === undefined || distance < held.distance) {
        nearest.set(index, { distance, value: number(point.value) ?? 0 });
      }
    }
    for (const [index, { value }] of nearest) totals.set(index, (totals.get(index) ?? 0) + value);
  }
  const points = [];
  for (let i = 0; i < starts.length; i++) {
    if (totals.has(i)) points.push({ ts: starts[i], value: totals.get(i) });
  }
  return points;
}

/** The points of the first channel the device has any for. */
function readingsOf(metrics, channels) {
  for (const name of channels) {
    const channel = metrics[name];
    if (channel && Array.isArray(channel.points) && channel.points.length > 0)
      return channel.points;
  }
  return [];
}

module.exports = { CHANNELS, createSnapshotHistory, sumReadings };
