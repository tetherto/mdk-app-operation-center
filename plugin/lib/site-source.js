"use strict";

const { logger } = require("@tetherto/mdk-gateway/plugin");

const aggregate = require("./aggregate");
const { createCommands } = require("./commands");
const { settings } = require("./config");
const { httpError } = require("./errors");
const { createFleet } = require("./fleet");
const { historySeries } = require("./history");
const { createLogs } = require("./logs");
const { createMockSite } = require("./mock-site");
const { createSnapshotCache } = require("./snapshot");
const { createTopology } = require("./topology");

/**
 * Where the routes read the site from. With `mock: true` in the app's config
 * every route is served from an in-memory site (./mock-site.js); otherwise
 * from the Kernel, through the app's own client: the layout config says what
 * sits where, the fleet reader pulls those devices, and one snapshot (kept
 * for `snapshotTtlMs`) serves every route.
 *
 * Both sources expose the same methods and return the bodies of the contract
 * in ui-src/api/contract.ts. Methods that act for the caller (commands, logs)
 * take the request's Kernel client last; the mock ignores it.
 */
function createWorkerSite() {
  const client = require("./client");
  const topology = createTopology(settings.layout);
  const fleet = createFleet({
    client,
    topology,
    concurrency: settings.commands.concurrency,
    logger,
  });
  const snapshots = createSnapshotCache({
    ttlMs: settings.snapshotTtlMs,
    read: fleet.read,
    onError: (err) => logger.warn("fleet refresh failed: %s", err && err.message),
  });
  const commands = createCommands({
    topology,
    fleet,
    snapshots,
    concurrency: settings.commands.concurrency,
    verify: settings.commands.verify,
    logger,
  });
  const logs = createLogs({ topology, fleet });
  // Attached by main.js once the sampler's store is open; until then the
  // series is empty rather than an error.
  let store = { query: () => [] };

  return {
    config: async () => ({
      siteName: settings.siteName,
      commandsEnabled: settings.commandsEnabled,
      downloadUrl: settings.downloadUrl,
    }),
    summary: async () => aggregate.siteSummary(topology, await snapshots.get()),
    containers: async () => aggregate.containers(topology, await snapshots.get()),
    containerLayout: async (id) => aggregate.containerLayout(topology, await snapshots.get(), id),
    powerMeters: async () => aggregate.powerMeters(topology, await snapshots.get()),
    miners: async (query) => aggregate.miners(topology, await snapshots.get(), query),
    history: async (query) => historySeries({ topology, store, query }),
    minerLogs: (id, mdk) => logs(mdk, id),
    setPowerMode: (target, mode, mdk) => commands.setPowerMode(mdk, target, mode),
    setPowerPct: (target, pct, mdk) => commands.setPowerPct(mdk, target, pct),
    attachHistory(historyStore) {
      store = historyStore;
    },
    topology,
    fleet,
    snapshots,
  };
}

/** Wraps a source so every method returns a promise, as the worker source does. */
function asAsync(source) {
  const wrapped = {};
  for (const [name, method] of Object.entries(source)) {
    wrapped[name] = async (...args) => method(...args);
  }
  return wrapped;
}

const site = settings.mock
  ? asAsync(
      createMockSite({
        siteName: settings.siteName,
        commandsEnabled: settings.commandsEnabled,
        downloadUrl: settings.downloadUrl,
      }),
    )
  : createWorkerSite();

/** Throws 403 when commands are off (the hosted demo). */
async function assertCommandsEnabled() {
  if (!(await site.config()).commandsEnabled) throw httpError("ERR_COMMANDS_DISABLED", 403);
}

module.exports = { site, assertCommandsEnabled };
