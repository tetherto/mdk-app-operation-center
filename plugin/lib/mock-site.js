"use strict";

const aggregate = require("./aggregate");
const { bucketStarts } = require("./history-window");
const { createTopology } = require("./topology");

/**
 * An in-memory site, served when the app's config sets `mock: true` (the local
 * dev stack does). 4 containers of 4 racks, 20 sockets per rack. Readings drift
 * over time so the UI looks live, and commands change the state. Deterministic:
 * the same seed always builds the same fleet.
 *
 * Every method returns a body of the contract in ui-src/api/contract.ts; the
 * contract test parses each one with its schema. The site is described by a
 * layout (the same shape the app config takes) and read through ./aggregate.js,
 * exactly as the worker site is, so both agree on every total.
 */

const CONTAINERS = [
  { model: "MicroBT WhatsMiner M56", supportedPowerModes: ["sleep", "low", "normal", "high"] },
  { model: "MicroBT WhatsMiner M56", supportedPowerModes: ["sleep", "low", "normal", "high"] },
  { model: "MicroBT WhatsMiner M56S", supportedPowerModes: ["sleep", "low", "normal", "high"] },
  { model: "Bitmain Antminer S21", supportedPowerModes: ["sleep", "normal", "high"] },
];
const RACKS_PER_CONTAINER = 4;
const SOCKETS_PER_RACK = 20;
const EMPTY_SOCKETS_PER_RACK = 2;

const NOMINAL_THS = 210;
const NOMINAL_W = 3550;
const SLEEP_W = 20;
/** A miner in error still draws some power (fans, control board). */
const ERROR_W = 140;
const NOMINAL_FREQUENCY_MHZ = 560;
const INLET_TEMP_BASE_C = 32;
/** Inlet temperature spread across miners, on top of the base. */
const INLET_TEMP_SPREAD_C = 8;
const INLET_TEMP_DRIFT_C = 2;
const CHIP_TEMP_BASE_C = 58;
/** Chip temperature rise at full (`normal`) power. */
const CHIP_TEMP_RISE_C = 14;
const CHIP_TEMP_IDLE_C = 30;
/** Site-wide swing every miner shares (ambient temperature, curtailment), so totals move like a real site's. */
const SITE_SWING = 0.02;
const SITE_SWING_PERIOD_MS = 90 * 60_000;
/** A power meter also reads the container's own load (fans, pumps, controls). */
const METER_OVERHEAD = 1.025;

const MINUTE_MS = 60_000;

/** Hashrate and power multiplier per power mode, relative to `normal`. */
const MODE_FACTOR = {
  sleep: { hashrate: 0, power: 0 },
  low: { hashrate: 0.8, power: 0.72 },
  normal: { hashrate: 1, power: 1 },
  high: { hashrate: 1.12, power: 1.2 },
};

/** Small seeded PRNG (mulberry32), so the fleet is the same on every start. */
function createRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Slow wave in [-1, 1] per miner, so live readings drift instead of jumping. */
function wave(seed, ts, periodMs = 20 * MINUTE_MS) {
  return Math.sin((ts / periodMs) * 2 * Math.PI + seed);
}

function createMockSite({
  siteName = "Mock Site",
  commandsEnabled = true,
  downloadUrl = null,
  seed = 7,
} = {}) {
  const random = createRandom(seed);
  const startedAt = Date.now();
  const layout = { containers: [] };
  const miners = new Map();

  CONTAINERS.forEach(({ model, supportedPowerModes }, containerIndex) => {
    const c = containerIndex + 1;
    const containerId = `container-${c}`;
    const racks = [];

    for (let r = 1; r <= RACKS_PER_CONTAINER; r++) {
      const rackId = `${containerId}-rack-${r}`;
      const sockets = [];

      for (let s = 1; s <= SOCKETS_PER_RACK; s++) {
        const position = `${c}-${r}-${s}`;
        if (s > SOCKETS_PER_RACK - EMPTY_SOCKETS_PER_RACK) {
          sockets.push({ position, deviceId: null });
          continue;
        }
        const id = `miner-${position}`;
        const roll = random();
        let fault = null;
        if (roll < 0.02) fault = "offline";
        else if (roll < 0.04) fault = "error";
        let powerMode = "normal";
        if (roll < 0.06) powerMode = "sleep";
        else if (roll < 0.12 && supportedPowerModes.includes("low")) powerMode = "low";
        else if (roll < 0.16) powerMode = "high";
        miners.set(id, {
          id,
          serial: `HT${String(c * 100_000 + r * 1000 + s).padStart(8, "0")}`,
          ip: `10.${c}.${r}.${s + 10}`,
          containerId,
          rackId,
          position,
          supportedPowerModes,
          fault,
          powerMode,
          powerPct: 100,
          spread: 0.92 + random() * 0.12,
          seed: random() * 2 * Math.PI,
          bootedAt: startedAt - Math.floor(random() * 9 * 86_400_000),
        });
        sockets.push({ position, deviceId: id });
      }
      racks.push({ id: rackId, name: `Rack ${c}-${r}`, sockets });
    }
    layout.containers.push({
      id: containerId,
      name: `Container ${c}`,
      model,
      nominalHashrateThs: NOMINAL_THS,
      meterDeviceId: `PM-${String(c).padStart(2, "0")}`,
      racks,
    });
  });
  const topology = createTopology(layout);

  const statusOf = (miner) => miner.fault ?? miner.powerMode;

  function readingsOf(miner, ts) {
    const status = statusOf(miner);
    if (status === "offline") return { hashrateThs: 0, powerW: 0 };
    if (status === "error") return { hashrateThs: 0, powerW: ERROR_W };
    if (status === "sleep") return { hashrateThs: 0, powerW: SLEEP_W };

    const factor = MODE_FACTOR[miner.powerMode];
    const pct = miner.powerPct / 100;
    const siteSwing = 1 + SITE_SWING * wave(0, ts, SITE_SWING_PERIOD_MS);
    return {
      hashrateThs:
        NOMINAL_THS *
        miner.spread *
        factor.hashrate *
        pct *
        siteSwing *
        (1 + 0.015 * wave(miner.seed, ts)),
      powerW:
        NOMINAL_W *
        miner.spread *
        factor.power *
        pct *
        siteSwing *
        (1 + 0.008 * wave(miner.seed + 1, ts)),
    };
  }

  function toMiner(miner, ts) {
    const { hashrateThs, powerW } = readingsOf(miner, ts);
    const running = hashrateThs > 0;
    return {
      id: miner.id,
      serial: miner.serial,
      ip: miner.ip,
      containerId: miner.containerId,
      rackId: miner.rackId,
      position: miner.position,
      status: statusOf(miner),
      powerMode: miner.powerMode,
      powerPct: miner.powerPct,
      supportedPowerModes: miner.supportedPowerModes,
      hashrateThs,
      powerW,
      frequencyMhz: running
        ? Math.round(NOMINAL_FREQUENCY_MHZ * miner.spread * MODE_FACTOR[miner.powerMode].hashrate)
        : 0,
      inletTempC:
        INLET_TEMP_BASE_C +
        INLET_TEMP_SPREAD_C * miner.spread +
        INLET_TEMP_DRIFT_C * wave(miner.seed + 2, ts, 45 * MINUTE_MS),
      chipTempC: running
        ? CHIP_TEMP_BASE_C + CHIP_TEMP_RISE_C * MODE_FACTOR[miner.powerMode].power * miner.spread
        : CHIP_TEMP_IDLE_C,
      uptimeS: miner.fault === "offline" ? 0 : Math.floor((ts - miner.bootedAt) / 1000),
      lastUpdate: miner.fault === "offline" ? miner.bootedAt : ts - 5000,
    };
  }

  const minersWhere = (filter) => [...miners.values()].filter(filter);

  /** The site at `ts`, in the shape ./aggregate.js reads (what the fleet reader returns). */
  function snapshotAt(ts) {
    const snapshot = { ts, miners: new Map(), meters: new Map() };
    for (const miner of miners.values()) snapshot.miners.set(miner.id, toMiner(miner, ts));
    for (const container of topology.containers) {
      const { powerW } = aggregate.totals(aggregate.minersOf(snapshot, container.minerIds));
      snapshot.meters.set(container.meterDeviceId, { powerW: powerW * METER_OVERHEAD });
    }
    return snapshot;
  }

  function targetMiners(target) {
    if ("containerId" in target) return minersWhere((m) => m.containerId === target.containerId);
    return target.minerIds.map((id) => miners.get(id)).filter((m) => m !== undefined);
  }

  return {
    config: () => ({ siteName, commandsEnabled, downloadUrl }),

    summary(ts = Date.now()) {
      return aggregate.siteSummary(topology, snapshotAt(ts));
    },

    containers(ts = Date.now()) {
      return aggregate.containers(topology, snapshotAt(ts));
    },

    /** Null when the container does not exist. */
    containerLayout(id, ts = Date.now()) {
      return aggregate.containerLayout(topology, snapshotAt(ts), id);
    },

    /**
     * `query` is a resolved history query: `{ metric, interval, containerId?, rackId? }`
     * plus either `limit` or `start` + `end` (see ./history-window.js).
     */
    history(query, now = Date.now()) {
      const scope = minersWhere(
        (m) =>
          (query.containerId === undefined || m.containerId === query.containerId) &&
          (query.rackId === undefined || m.rackId === query.rackId),
      );
      const points = bucketStarts(query, now).map((ts) => {
        const totals = aggregate.totals(scope.map((miner) => toMiner(miner, ts)));
        return { ts, value: query.metric === "hashrate" ? totals.hashrateThs : totals.powerW };
      });
      if (query.metric === "hashrate") {
        return {
          metric: "hashrate",
          interval: query.interval,
          unit: "TH/s",
          points,
          nominal: scope.length * NOMINAL_THS,
        };
      }
      return { metric: "power", interval: query.interval, unit: "W", points };
    },

    powerMeters(ts = Date.now()) {
      return aggregate.powerMeters(topology, snapshotAt(ts));
    },

    miners(query, ts = Date.now()) {
      return aggregate.miners(topology, snapshotAt(ts), query);
    },

    /**
     * The miner's log file as `{ filename, contentType, data }` (data a Buffer),
     * the shape the worker site returns for a `downloadLogs` archive. Null when
     * the miner does not exist. The mock's file is plain text.
     */
    minerLogs(id, ts = Date.now()) {
      const miner = miners.get(id);
      if (miner === undefined) return null;
      const current = toMiner(miner, ts);
      const lines = [
        `${new Date(miner.bootedAt).toISOString()} boot ${miner.serial} at ${miner.ip}`,
        `${new Date(ts - MINUTE_MS).toISOString()} status=${current.status} mode=${current.powerMode} pct=${current.powerPct}`,
        `${new Date(ts).toISOString()} hashrate=${current.hashrateThs.toFixed(2)}TH/s power=${Math.round(current.powerW)}W inlet=${current.inletTempC.toFixed(1)}C`,
      ];
      return {
        filename: `${id}-logs.txt`,
        contentType: "text/plain; charset=utf-8",
        data: Buffer.from(`${lines.join("\n")}\n`, "utf8"),
      };
    },

    /** Miners that do not support `mode` are skipped and not counted. */
    setPowerMode(target, mode) {
      const scope = targetMiners(target).filter((miner) =>
        miner.supportedPowerModes.includes(mode),
      );
      for (const miner of scope) miner.powerMode = mode;
      return { accepted: scope.length > 0, minerCount: scope.length };
    },

    setPowerPct(target, pct) {
      const scope = targetMiners(target);
      for (const miner of scope) miner.powerPct = pct;
      return { accepted: scope.length > 0, minerCount: scope.length };
    },
  };
}

module.exports = { createMockSite };
