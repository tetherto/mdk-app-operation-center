"use strict";

const aggregate = require("./aggregate");

/** The records of one snapshot: the site, every container and every rack. */
function sampleOf(topology, snapshot) {
  const record = (scope, ids) => {
    const miners = aggregate.minersOf(snapshot, ids);
    const { hashrateThs, powerW } = aggregate.totals(miners);
    return { ts: snapshot.ts, scope, hashrateThs, powerW, miners: miners.length };
  };
  const records = [record("site", topology.minerIds)];
  for (const container of topology.containers) {
    records.push(record(`container:${container.id}`, container.minerIds));
    for (const rack of container.racks) {
      records.push(record(`rack:${rack.id}`, topology.minerIdsIn({ rackId: rack.id })));
    }
  }
  return records;
}

/**
 * Samples the fleet every `intervalMs` into the history store, through the
 * shared snapshot cache (a fresh read each time, which also keeps the cache
 * warm for the routes). A failed read is logged and skipped.
 */
function createSampler({ topology, snapshots, store, intervalMs, logger }) {
  let timer = null;
  let running = null;

  async function tick() {
    if (running !== null) return running;
    running = (async () => {
      try {
        store.append(sampleOf(topology, await snapshots.fresh()));
      } catch (err) {
        if (logger) logger.warn("history sample skipped: %s", err && err.message);
      } finally {
        running = null;
      }
    })();
    return running;
  }

  return {
    tick,
    start() {
      if (timer !== null) return;
      timer = setInterval(tick, intervalMs);
      if (typeof timer.unref === "function") timer.unref();
      void tick();
    },
    stop() {
      if (timer !== null) clearInterval(timer);
      timer = null;
    },
  };
}

module.exports = { createSampler, sampleOf };
