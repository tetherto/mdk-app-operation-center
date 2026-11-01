"use strict";

const { config } = require("@tetherto/mdk-gateway/plugin");

const { validateLayout } = require("./layout");

/**
 * The app's settings: the ambient config (mdk-app.yaml defaults under the
 * operator's `config` in mdk.yaml) with every nested block filled in, since an
 * override replaces a top-level key whole. The layout is validated here, so a
 * bad one fails the app at boot with the path that is wrong, not on a request.
 */
const DEFAULTS = {
  siteName: "Site",
  commandsEnabled: true,
  downloadUrl: null,
  history: { sampleIntervalMs: 60_000, retentionDays: 30 },
  commands: { concurrency: 8, verify: false },
  snapshotTtlMs: 5_000,
};

/**
 * An http(s) URL, or null when unset. A bad one fails the app at boot: the UI
 * parses /api/config strictly, and a config it cannot read leaves every command off.
 */
function downloadUrlFrom(value) {
  if (value === undefined || value === null || value === "") return null;
  let url;
  try {
    url = new URL(value);
  } catch {
    url = null;
  }
  if (url === null || !["http:", "https:"].includes(url.protocol)) {
    throw new Error(`ERR_DOWNLOAD_URL_INVALID: ${String(value)} is not an http(s) URL`);
  }
  return url.href;
}

const positive = (value, fallback) =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;

function settingsFrom(raw) {
  const layout = raw.layout ?? { containers: [] };
  const errors = validateLayout(layout);
  if (errors.length > 0) throw new Error(`ERR_LAYOUT_INVALID: ${errors.join("; ")}`);
  const history = raw.history ?? {};
  const commands = raw.commands ?? {};
  return {
    mock: raw.mock === true,
    siteName: typeof raw.siteName === "string" && raw.siteName ? raw.siteName : DEFAULTS.siteName,
    commandsEnabled: raw.commandsEnabled !== false,
    downloadUrl: downloadUrlFrom(raw.downloadUrl),
    layout,
    history: {
      sampleIntervalMs: positive(history.sampleIntervalMs, DEFAULTS.history.sampleIntervalMs),
      retentionDays: positive(history.retentionDays, DEFAULTS.history.retentionDays),
    },
    commands: {
      concurrency: Math.floor(positive(commands.concurrency, DEFAULTS.commands.concurrency)),
      verify: commands.verify === true,
    },
    snapshotTtlMs: positive(raw.snapshotTtlMs, DEFAULTS.snapshotTtlMs),
    dataDir: typeof raw.dataDir === "string" ? raw.dataDir : null,
  };
}

module.exports = { DEFAULTS, settings: settingsFrom(config), settingsFrom };
