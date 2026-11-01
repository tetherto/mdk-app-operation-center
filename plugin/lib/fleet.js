"use strict";

const { httpError } = require("./errors");
const { fingerprint, normalizeMeter, normalizeMiner } = require("./normalize");

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
 * Reads the site's devices from the Kernel: the miners and meters the layout
 * names, as far as the registry has them. Capabilities are fetched once per
 * device and kept; a device the Kernel does not list, or whose pull fails, is
 * reported offline so the layout's counts hold. A Kernel that cannot be
 * reached at all is a 503 (ERR_KERNEL_UNAVAILABLE), while its refusals
 * (ERR_KERNEL_*) pass through for the runtime to map.
 */
function createFleet({ client, topology, concurrency = 8, logger }) {
  const capabilities = new Map();
  const previous = new Map();
  const lastSetPct = new Map();

  async function registeredDevices() {
    let workers;
    try {
      ({ workers } = await client.listWorkers());
    } catch (err) {
      const message = String(err && err.message);
      if (message.startsWith("ERR_KERNEL_")) throw err;
      if (logger) logger.warn("kernel unreachable: %s", message);
      throw httpError("ERR_KERNEL_UNAVAILABLE", 503);
    }
    const present = new Set();
    for (const worker of Array.isArray(workers) ? workers : []) {
      if (GONE_WORKER_STATES.has(worker.state)) continue;
      for (const id of Array.isArray(worker.deviceIds) ? worker.deviceIds : []) present.add(id);
    }
    return present;
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

  async function read() {
    const present = await registeredDevices();
    const now = Date.now();
    const miners = new Map();
    const meters = new Map();
    const tasks = [];

    for (const id of topology.minerIds) {
      tasks.push(async () => {
        const placement = topology.deviceById.get(id);
        const known = present.has(id);
        const caps = known ? await capabilitiesOf(id) : (capabilities.get(id) ?? null);
        const reply = known ? await pull(id) : null;
        const miner = normalizeMiner({
          id,
          placement,
          capabilities: caps,
          reply,
          previous: previous.get(id),
          lastSetPct: lastSetPct.get(id),
          now,
        });
        previous.set(id, miner);
        miners.set(id, miner);
      });
    }
    for (const id of topology.meterIds) {
      tasks.push(async () => {
        const reply = present.has(id) ? await pull(id) : null;
        meters.set(id, normalizeMeter({ id, reply }));
      });
    }
    await runBounded(tasks, concurrency);
    return { ts: now, miners, meters };
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

module.exports = { createFleet, runBounded };
