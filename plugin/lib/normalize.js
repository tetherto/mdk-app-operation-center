"use strict";

const { POWER_MODES } = require("./contract-limits");

/**
 * Modes assumed when a worker declares `setPowerMode` without an enum: the
 * three every miner family has. `low` is left out because it is vendor-specific
 * (Whatsminer has it, stock Antminer firmware may not).
 */
const DEFAULT_POWER_MODES = ["sleep", "normal", "high"];

/**
 * From a device's Kernel reply to the contract's shapes. The telemetry names
 * are the Worker Plugins' (MicroBT whatsminer-mdk-worker, Bitmain
 * antminer-mdk-worker, the ABB/SATEC meter vocabulary); where the vendors
 * differ, both spellings are read.
 */

const number = (value) => (typeof value === "number" && Number.isFinite(value) ? value : null);
const text = (value) => (typeof value === "string" ? value : "");
const failed = (value) =>
  value !== null && typeof value === "object" && typeof value.error === "string";

/**
 * What a device can do, from its declared capabilities. `kind` tells a miner
 * (hashrate channels) from a meter (active_power); `supportedPowerModes` is
 * the setPowerMode enum in contract order; `pctCommand` is the power-percent
 * command the worker declares, if any.
 */
function fingerprint(reply) {
  const caps =
    reply && typeof reply === "object" && reply.capabilities ? reply.capabilities : reply;
  const telemetry = new Set(
    Array.isArray(caps?.telemetry) ? caps.telemetry.map((t) => t && t.name) : [],
  );
  const commands = new Map(
    Array.isArray(caps?.commands) ? caps.commands.map((c) => [c && c.name, c]) : [],
  );
  let kind = "other";
  if (telemetry.has("hashrate_rt") || telemetry.has("hashrate_avg")) kind = "miner";
  else if (telemetry.has("active_power")) kind = "meter";

  const setPowerMode = commands.get("setPowerMode");
  let supportedPowerModes = [];
  if (setPowerMode !== undefined) {
    const params = Array.isArray(setPowerMode.params) ? setPowerMode.params : [];
    const mode = params.find((p) => p && p.name === "mode");
    supportedPowerModes =
      mode !== undefined && Array.isArray(mode.enum)
        ? POWER_MODES.filter((m) => mode.enum.includes(m))
        : DEFAULT_POWER_MODES;
  }

  let pctCommand = null;
  if (commands.has("setPowerPct")) pctCommand = "setPowerPct";
  else if (commands.has("setHashratePercent")) pctCommand = "setHashratePercent";

  return {
    kind,
    supportedPowerModes,
    pctCommand,
    hasDownloadLogs: commands.has("downloadLogs"),
  };
}

/** Mean of the hashboards' frequencies (`freq_mhz` on Antminer, `chip_frequency` on Whatsminer). */
function boardFrequency(hashboards) {
  if (!Array.isArray(hashboards)) return null;
  const values = hashboards
    .map((board) => number(board?.freq_mhz) ?? number(board?.chip_frequency))
    .filter((value) => value !== null);
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function statusOf(metrics, powerMode) {
  const status = metrics.status;
  if (status === "offline") return "offline";
  if (status === "error" || status === "not_mining") return "error";
  if (status === "sleeping" || powerMode === "sleep") return "sleep";
  return powerMode;
}

/**
 * One miner of the contract from its placement, capabilities and metrics
 * reply (`null` when the pull failed). Unreachable means the reply is missing
 * or its hashrate channel carries an error: the miner is reported offline with
 * the identity and mode it last showed. `lastSetPct` is the percent the app
 * last applied, reported when the worker has no readable one.
 */
function normalizeMiner({ id, placement, capabilities, reply, previous, lastSetPct, now }) {
  const metrics = reply && typeof reply === "object" && reply.metrics ? reply.metrics : null;
  const reachable = metrics !== null && !failed(metrics.hashrate_rt) && !failed(metrics.status);
  const base = {
    id,
    containerId: placement.containerId,
    rackId: placement.rackId,
    position: placement.position,
    supportedPowerModes: capabilities ? capabilities.supportedPowerModes : [],
  };

  if (!reachable) {
    return {
      ...base,
      serial: previous ? previous.serial : "",
      ip: previous ? previous.ip : "",
      status: "offline",
      powerMode: previous ? previous.powerMode : "normal",
      powerPct: previous ? previous.powerPct : (lastSetPct ?? null),
      hashrateThs: 0,
      powerW: 0,
      frequencyMhz: 0,
      inletTempC: 0,
      chipTempC: 0,
      uptimeS: 0,
      lastUpdate: previous ? previous.lastUpdate : 0,
    };
  }

  let powerMode = previous ? previous.powerMode : "normal";
  if (POWER_MODES.includes(metrics.power_mode)) powerMode = metrics.power_mode;
  const info =
    metrics.device_info && typeof metrics.device_info === "object" ? metrics.device_info : {};
  const stats =
    metrics.miner_stats && typeof metrics.miner_stats === "object" ? metrics.miner_stats : {};
  const readablePct =
    number(stats.stats?.freq_level) ?? number(stats.freq_level) ?? number(metrics.power_pct);

  return {
    ...base,
    serial: text(info.serial_number) || text(info.minersn) || text(info["miner-sn"]),
    ip: text(info.ip),
    status: statusOf(metrics, powerMode),
    powerMode,
    powerPct: readablePct ?? lastSetPct ?? null,
    hashrateThs: number(metrics.hashrate_rt) ?? number(metrics.hashrate_avg) ?? 0,
    powerW: number(metrics.power) ?? 0,
    frequencyMhz: boardFrequency(metrics.hashboards) ?? number(stats.freq_avg) ?? 0,
    // Antminer reports the inlet as ambient_temp, Whatsminer under miner_stats.env_temp.
    inletTempC:
      number(metrics.ambient_temp) ?? number(stats.env_temp) ?? number(metrics.temperature) ?? 0,
    chipTempC: number(metrics.temperature) ?? 0,
    uptimeS: number(metrics.uptime) ?? 0,
    lastUpdate: number(reply.timestamp) ?? now,
  };
}

/** A power meter's reading; `online` false when the pull failed. */
function normalizeMeter({ id, reply }) {
  const metrics = reply && typeof reply === "object" && reply.metrics ? reply.metrics : null;
  const powerW = metrics === null ? null : number(metrics.active_power);
  return { id, powerW: powerW ?? 0, online: powerW !== null };
}

module.exports = { fingerprint, normalizeMiner, normalizeMeter };
