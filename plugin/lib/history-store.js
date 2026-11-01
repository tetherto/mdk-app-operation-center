"use strict";

const fs = require("fs");
const path = require("path");

const FILE = "history.jsonl";
const DAY_MS = 24 * 60 * 60_000;

/**
 * The app's own telemetry history (the Kernel keeps none): one record per
 * sample and scope, `{ ts, scope, hashrateThs, powerW, miners }`, with scope
 * "site", "container:<id>" or "rack:<id>". Kept in memory and appended to
 * history.jsonl under the app's data dir, so a restart keeps the series;
 * without a data dir it lives in memory only. Records older than
 * `retentionMs` are dropped on load and whenever a sample lands after a day.
 *
 * Size: one record per scope per sample, so a site of C containers and R
 * racks at one sample a minute writes (1 + C + R) records a minute. 30 days
 * of a 4-container, 8-rack site is about 560 000 records, 65 MB on disk and
 * a little more in memory, loaded whole at boot. A site with many racks, or a
 * longer retention, is where a real store replaces this file.
 */
function createHistoryStore({ dir = null, retentionMs, now = Date.now }) {
  const file = dir === null ? null : path.join(dir, FILE);
  const byScope = new Map();
  let lastCompactedAt = now();

  const keep = (record) => record.ts >= now() - retentionMs;

  function remember(record) {
    let records = byScope.get(record.scope);
    if (records === undefined) {
      records = [];
      byScope.set(record.scope, records);
    }
    records.push(record);
  }

  function parse(line) {
    try {
      const record = JSON.parse(line);
      if (
        typeof record.ts !== "number" ||
        typeof record.scope !== "string" ||
        typeof record.hashrateThs !== "number" ||
        typeof record.powerW !== "number" ||
        typeof record.miners !== "number"
      ) {
        return null;
      }
      return record;
    } catch {
      return null;
    }
  }

  function load() {
    if (file === null || !fs.existsSync(file)) return 0;
    let count = 0;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      if (line === "") continue;
      const record = parse(line);
      if (record !== null && keep(record)) {
        remember(record);
        count += 1;
      }
    }
    compact();
    return count;
  }

  /** Drops expired records and rewrites the file whole. */
  function compact() {
    for (const [scope, records] of byScope) {
      const kept = records.filter(keep);
      if (kept.length === 0) byScope.delete(scope);
      else if (kept.length !== records.length) byScope.set(scope, kept);
    }
    lastCompactedAt = now();
    if (file === null) return;
    const lines = [];
    for (const records of byScope.values()) for (const r of records) lines.push(JSON.stringify(r));
    const tmp = `${file}.tmp`;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(tmp, lines.length === 0 ? "" : `${lines.join("\n")}\n`);
    fs.renameSync(tmp, file);
  }

  function append(records) {
    for (const record of records) remember(record);
    if (file !== null) {
      fs.mkdirSync(dir, { recursive: true });
      fs.appendFileSync(file, records.map((r) => `${JSON.stringify(r)}\n`).join(""));
    }
    if (now() - lastCompactedAt >= DAY_MS) compact();
  }

  /**
   * Records of one scope with `start <= ts < end`, oldest first. Records are
   * appended in time order, so the first one at or after `start` is found by
   * binary search and the window is read from there.
   */
  function query(scope, start, end) {
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

  return { load, append, query, compact, file };
}

module.exports = { createHistoryStore, DAY_MS, FILE };
