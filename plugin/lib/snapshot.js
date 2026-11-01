"use strict";

/**
 * One fleet read serves every route and the sampler. A snapshot younger than
 * `ttlMs` is returned as is; an older one is returned too, while one refresh
 * runs behind it, so a request never waits on a full fleet read once there is
 * a snapshot to show. Only the first read, or one after `invalidate()` (a
 * command changed the site), is waited for. Concurrent callers share one read.
 *
 * `invalidate()` also retires a read in flight: it still resolves for whoever
 * awaited it, but it is not kept, and the next get() starts a read that began
 * after the command.
 */
function createSnapshotCache({ ttlMs, read, now = Date.now, onError }) {
  let current = null;
  let takenAt = -Infinity;
  let inFlight = null;
  let generation = 0;

  function refresh() {
    if (inFlight === null) {
      const started = generation;
      const pending = read()
        .then((snapshot) => {
          if (started === generation) {
            current = snapshot;
            takenAt = now();
          }
          return snapshot;
        })
        .finally(() => {
          if (inFlight === pending) inFlight = null;
        });
      inFlight = pending;
    }
    return inFlight;
  }

  return {
    async get() {
      if (current === null) return refresh();
      if (now() - takenAt >= ttlMs) {
        refresh().catch((err) => {
          if (onError) onError(err);
        });
      }
      return current;
    },
    /** A read taken now (shared with any refresh in flight), for the sampler. */
    async fresh() {
      return refresh();
    },
    /** Forget the snapshot and any read in flight: the next get() waits for a read started now. */
    invalidate() {
      generation += 1;
      current = null;
      takenAt = -Infinity;
      inFlight = null;
    },
  };
}

module.exports = { createSnapshotCache };
