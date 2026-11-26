"use strict";

const { httpError } = require("./errors");
const {
  envTempOf,
  fingerprint,
  normalizeMeter,
  normalizeMiner,
  pduSocketsOf,
} = require("./normalize");
const { readWorkerCache } = require("./worker-cache");

const GONE_WORKER_STATES = new Set(["TERMINATED", "DEAD"]);

/** Runs `tasks` (functions returning promises) with at most `limit` in flight. */
async function runBounded(tasks, limit) {
  let next = 0;
  const lane = async () => {
    const task = tasks[next];
    if (task === undefined) return;
    next += 1;
    await task();
    await lane();
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, tasks.length)) }, lane));
}

/**
 * Reads the site's devices from the Kernel: the miners, meters, env and
 * container devices the layout names, as far as the registry has them.
 *
 * Readings come from each Worker's cache (./worker-cache.js): one `list`
 * request per Worker hosting a device of the layout, answered from the snaps
 * the Worker collects on its own timer, so a fleet read never reaches a
 * device. A Worker without that cache leaves its devices offline, unless
 * `liveFallback` is set (`fleet.liveFallback` in the app config): then those
 * devices are pulled one by one (`metrics`), at most `concurrency` at a time,
 * which is what a stack of plain contract Workers needs.
 *
 * Capabilities (the Worker's contract, from the Kernel registry) are fetched
 * once per device and kept; a device the Kernel does not list, or without
 * readings, is reported offline so the layout's counts hold. A Kernel that
 * cannot be reached at all is a 503 (ERR_KERNEL_UNAVAILABLE), while its
 * refusals (ERR_KERNEL_*) pass through for the runtime to map.
 */
function createFleet({ client, topology, concurrency = 8, liveFallback = false, logger }) {
  const capabilities = new Map();
  const previous = new Map();
  const lastSetPct = new Map();
  // Workers already reported as serving no cache, with the reason logged, so
  // the warning is logged once per reason.
  const uncached = new Map();

  async function liveWorkers() {
    let workers;
    try {
      ({ workers } = await client.listWorkers());
    } catch (err) {
      const message = String(err && err.message);
      if (message.startsWith("ERR_KERNEL_")) throw err;
      if (logger) logger.warn("kernel unreachable: %s", message);
      throw httpError("ERR_KERNEL_UNAVAILABLE", 503);
    }
    const live = [];
    for (const worker of Array.isArray(workers) ? workers : []) {
      if (GONE_WORKER_STATES.has(worker.state)) continue;
      live.push({ ...worker, deviceIds: Array.isArray(worker.deviceIds) ? worker.deviceIds : [] });
    }
    return live;
  }

  async function capabilitiesOf(id) {
    if (capabilities.has(id)) return capabilities.get(id);
    let reply;
    try {
      reply = await client.getCapabilities(id);
    } catch (err) {
      if (logger) logger.debug("capabilities of %s failed: %s", id, err && err.message);
      return null;
    }
    const print = fingerprint(reply);
    capabilities.set(id, print);
    return print;
  }

  const pull = (id) => client.pullTelemetry(id, "metrics").catch(() => null);

  /**
   * The readings of every layout device a live Worker hosts: from the
   * Worker's cache, else (with `liveFallback`) a pull per device. A device
   * missing from the map is not registered; a null reading is offline.
   */
  async function readings(workers) {
    const replies = new Map();
    const toPull = [];
    const hosting = workers.filter((worker) =>
      worker.deviceIds.some((id) => topology.deviceById.has(id)),
    );
    await runBounded(
      hosting.map((worker) => async () => {
        const ids = worker.deviceIds.filter((id) => topology.deviceById.has(id));
        const cache = await readWorkerCache(client, worker);
        if (cache.cached) {
          uncached.delete(worker.workerId);
          for (const id of ids) replies.set(id, cache.replies.get(id) ?? null);
          return;
        }
        // Warn once per reason, so a Worker going from unreachable to
        // cacheless (or back) is reported again.
        if (uncached.get(worker.workerId) !== cache.reason && logger) {
          logger.warn(
            liveFallback
              ? "worker %s serves no cached readings (%s): pulling its devices"
              : "worker %s serves no cached readings (%s): its devices read offline (set fleet.liveFallback to pull them)",
            worker.workerId,
            cache.reason,
          );
        }
        uncached.set(worker.workerId, cache.reason);
        if (liveFallback) toPull.push(...ids);
        else for (const id of ids) replies.set(id, null);
      }),
      concurrency,
    );
    await runBounded(
      toPull.map((id) => async () => {
        replies.set(id, await pull(id));
      }),
      concurrency,
    );
    return replies;
  }

  async function read() {
    const replies = await readings(await liveWorkers());
    const now = Date.now();
    const miners = new Map();
    const meters = new Map();
    const envTempC = new Map();
    for (const container of topology.containers) {
      const reply =
        container.envDeviceId === null ? null : (replies.get(container.envDeviceId) ?? null);
      envTempC.set(container.id, envTempOf(reply));
    }
    const pduSockets = new Map();
    for (const container of topology.containers) {
      if (container.containerDeviceId === null) continue;
      pduSockets.set(container.id, pduSocketsOf(replies.get(container.containerDeviceId) ?? null));
    }
    const tasks = [];

    for (const id of topology.minerIds) {
      tasks.push(async () => {
        const placement = topology.deviceById.get(id);
        const known = replies.has(id);
        const caps = known ? await capabilitiesOf(id) : (capabilities.get(id) ?? null);
        const reply = replies.get(id) ?? null;
        const miner = normalizeMiner({
          id,
          placement,
          capabilities: caps,
          reply,
          previous: previous.get(id),
          lastSetPct: lastSetPct.get(id),
          envTempC: envTempC.get(placement.containerId),
          now,
        });
        previous.set(id, miner);
        miners.set(id, miner);
      });
    }
    for (const id of topology.meterIds) {
      tasks.push(async () => {
        meters.set(id, normalizeMeter({ id, reply: replies.get(id) ?? null }));
      });
    }
    await runBounded(tasks, concurrency);
    return { ts: now, miners, meters, envTempC, pduSockets };
  }

  return {
    read,
    capabilitiesOf,
    /** Remember the percent the app applied, for miners whose worker reports none. */
    recordSetPct(id, pct) {
      lastSetPct.set(id, pct);
    },
  };
}

module.exports = { GONE_WORKER_STATES, createFleet, runBounded };
