"use strict";

const { DAY_MS, createHistoryStore } = require("./lib/history-store");
const { createSampler } = require("./lib/sampler");
const { site } = require("./lib/site-source");

/**
 * The app's background work, run by the app runtime before it first serves
 * (mdk-app.yaml `main`). On the worker site it starts the history sampler
 * over the same snapshot cache the routes read; the mock site computes its
 * own history and needs none. Sampling starts once the runtime is serving,
 * so a slow first fleet read never delays startup.
 */
async function start(config, context) {
  if (site.attachHistory === undefined) return;
  const { settings } = require("./lib/config");
  const store = createHistoryStore({
    dir: config.dataDir ?? null,
    retentionMs: settings.history.retentionDays * DAY_MS,
  });
  const loaded = store.load();
  context.logger.info("history: %d samples loaded from %s", loaded, store.file ?? "memory");
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
