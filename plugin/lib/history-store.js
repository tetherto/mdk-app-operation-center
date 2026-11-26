"use strict";

const path = require("path");
const Corestore = require("corestore");
const Hyperbee = require("hyperbee");

const DIR = "history";
const DAY_MS = 24 * 60 * 60_000;
const BEE_OPTS = { keyEncoding: "utf-8", valueEncoding: "json" };

// A sample key is `<scope>\x00<ts>`, ts zero-padded so keys sort in time
// order within a scope. \x00 sorts below every scope character, so the range
// of "rack:r1" never reaches into "rack:r10".
const pad = (ts) => String(ts).padStart(15, "0");
const keyOf = (scope, ts) => `${scope}\x00${pad(Math.max(0, Math.floor(ts)))}`;
const scopeEnd = (scope) => `${scope}\x01`;

function isRecord(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.ts === "number" &&
    typeof value.scope === "string" &&
    typeof value.hashrateThs === "number" &&
    typeof value.powerW === "number" &&
    typeof value.miners === "number"
  );
}

/**
 * The app's own telemetry history, served when the Workers keep none the
 * Kernel can read (./history-snapshot.js): one record per
 * sample and scope, `{ ts, scope, hashrateThs, powerW, miners }`, with scope
 * "site", "container:<id>" or "rack:<id>". Kept in a Hyperbee under the app's
 * data dir, so a restart keeps the series and a window is read from disk;
 * without a data dir it lives in memory only. Records older than
 * `retentionMs` are pruned on open and whenever a sample lands after a day.
 *
 * Size: one record per scope per sample, so a site of C containers and R
 * racks at one sample a minute writes (1 + C + R) records a minute. A query
 * reads one scope's window, at most `retentionMs` of samples of one scope.
 *
 * The app runtime gives a plugin no close hook, so the store is not closed
 * on shutdown; each sample is one flushed batch and Hypercore recovers to the
 * last flushed one.
 */
function createHistoryStore({ dir = null, retentionMs, now = Date.now }) {
  if (dir === null) return createMemoryHistoryStore({ retentionMs, now });
  return createBeeHistoryStore({ dir: path.join(dir, DIR), retentionMs, now });
}

function createBeeHistoryStore({ dir, retentionMs, now }) {
  const corestore = new Corestore(dir);
  const bee = new Hyperbee(corestore.get({ name: DIR }), BEE_OPTS);
  const samples = bee.sub("samples");
  // Every scope ever written, so pruning reaches scopes that left the layout.
  const scopes = bee.sub("scopes");
  const known = new Set();
  let lastPrunedAt = now();

  async function open() {
    await bee.ready();
    for await (const { key } of scopes.createReadStream()) known.add(key);
    await prune();
  }

  /** Deletes every sample older than the retention window, in one batch. */
  async function prune() {
    const cutoff = now() - retentionMs;
    const keysOf = async (scope) => {
      const keys = [];
      const range = { gte: keyOf(scope, 0), lt: keyOf(scope, cutoff) };
      for await (const { key } of samples.createReadStream(range)) keys.push(key);
      return keys;
    };
    const stale = (await Promise.all([...known].map(keysOf))).flat();
    lastPrunedAt = now();
    if (stale.length === 0) return;
    // A batch queues its writes behind its own lock, so they may be issued together.
    const batch = samples.batch();
    try {
      await Promise.all(stale.map((key) => batch.del(key)));
      await batch.flush();
    } catch (err) {
      await batch.close();
      throw err;
    }
  }

  /**
   * Writes one sample's records, and any scope not seen before, in one batch
   * on the root bee: a sub's key encoding carries its prefix, so passing it
   * per put lands each key in its sub.
   */
  async function append(records) {
    const added = [...new Set(records.map((record) => record.scope))].filter(
      (scope) => !known.has(scope),
    );
    const batch = bee.batch();
    try {
      await Promise.all([
        ...records.map((record) =>
          batch.put(keyOf(record.scope, record.ts), record, { keyEncoding: samples.keyEncoding }),
        ),
        ...added.map((scope) => batch.put(scope, {}, { keyEncoding: scopes.keyEncoding })),
      ]);
      await batch.flush();
    } catch (err) {
      await batch.close();
      throw err;
    }
    for (const scope of added) known.add(scope);
    if (now() - lastPrunedAt >= DAY_MS) await prune();
  }

  /** Records of one scope with `start <= ts < end`, oldest first. */
  async function query(scope, start, end) {
    if (end <= start) return [];
    const lt = end === Infinity ? scopeEnd(scope) : keyOf(scope, Math.ceil(end));
    const out = [];
    for await (const { value } of samples.createReadStream({ gte: keyOf(scope, start), lt })) {
      if (isRecord(value) && value.ts >= start && value.ts < end) out.push(value);
    }
    return out;
  }

  async function close() {
    await bee.close();
    await corestore.close();
  }

  return { open, append, query, prune, close, location: dir };
}

/** The same store without a data dir (the smoke run): memory only. */
function createMemoryHistoryStore({ retentionMs, now }) {
  const byScope = new Map();
  let lastPrunedAt = now();

  async function prune() {
    const cutoff = now() - retentionMs;
    for (const [scope, records] of byScope) {
      const kept = records.filter((record) => record.ts >= cutoff);
      if (kept.length === 0) byScope.delete(scope);
      else if (kept.length !== records.length) byScope.set(scope, kept);
    }
    lastPrunedAt = now();
  }

  async function append(records) {
    for (const record of records) {
      let scoped = byScope.get(record.scope);
      if (scoped === undefined) {
        scoped = [];
        byScope.set(record.scope, scoped);
      }
      scoped.push(record);
    }
    if (now() - lastPrunedAt >= DAY_MS) await prune();
  }

  /**
   * Records are appended in time order, so the first one at or after `start`
   * is found by binary search and the window is read from there.
   */
  async function query(scope, start, end) {
    const records = byScope.get(scope);
    if (records === undefined) return [];
    let low = 0;
    let high = records.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (records[mid].ts < start) low = mid + 1;
      else high = mid;
    }
    const out = [];
    for (let i = low; i < records.length && records[i].ts < end; i++) out.push(records[i]);
    return out;
  }

  return { open: prune, append, query, prune, close: async () => {}, location: null };
}

module.exports = { createHistoryStore, DAY_MS };
