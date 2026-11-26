"use strict";

const { DAY_MS, createHistoryStore } = require("./lib/history-store");
const { createSampler } = require("./lib/sampler");
const { site } = require("./lib/site-source");

/**
 * The app's background work, run by the app runtime before it first serves
 * (mdk-app.yaml `main`). On the worker site it starts the history sampler
 * over the same snapshot cache the routes read, the series /api/history
 * falls back to when the stack has no snapshot read (lib/history-snapshot.js);
 * the mock site computes its own history and needs none. Sampling starts
 * once the runtime is serving, so a slow first fleet read never delays startup.
 */
async function start(config, context) {
  if (site.attachHistory === undefined) return;
  const { settings } = require("./lib/config");
  const store = createHistoryStore({
    dir: config.dataDir ?? null,
    retentionMs: settings.history.retentionDays * DAY_MS,
  });
  try {
    await store.open();
  } catch (err) {
    // Corestore takes a lock on its directory: another process has it open.
    if (err && /could not be locked/.test(err.message)) {
      context.logger.error("history: store at %s is in use by another process", store.location);
    }
    throw err;
  }
  context.logger.info("history: store at %s", store.location ?? "memory");
  const sampler = createSampler({
    topology: site.topology,
    snapshots: site.snapshots,
    store,
    intervalMs: settings.history.sampleIntervalMs,
    logger: context.logger,
  });
  site.attachHistory(store);
  context.onReady(() => sampler.start());
}

module.exports = { start };
