"use strict";

const { HISTORY_DEFAULT_POINTS, HISTORY_MAX_POINTS } = require("./contract-limits");
const { httpError } = require("./errors");

/** Bucket length of each history interval (contract: HISTORY_INTERVALS). */
const INTERVAL_MS = {
  "5m": 5 * 60_000,
  "30m": 30 * 60_000,
  "3h": 3 * 60 * 60_000,
  "1d": 24 * 60 * 60_000,
};

const bucketIndex = (ts, step) => Math.floor(ts / step);

/** Buckets from the one holding `start` to the one holding `end`, both included. */
function bucketCount(interval, start, end) {
  const step = INTERVAL_MS[interval];
  return bucketIndex(end, step) - bucketIndex(start, step) + 1;
}

/**
 * Resolves a `GET /api/history` query (already type-checked by the route table)
 * to the window a site source serves: every bucket between `start` and `end`,
 * or the last `limit` buckets ending now. Throws a 400 for a half-given, inverted
 * or oversized window.
 */
function resolveHistoryQuery({ metric, interval, limit, start, end, containerId, rackId }) {
  const query = { metric, interval, containerId, rackId };

  if (start === undefined && end === undefined) {
    query.limit = limit ?? HISTORY_DEFAULT_POINTS;
    return query;
  }
  if (start === undefined || end === undefined)
    throw httpError("ERR_HISTORY_WINDOW_INCOMPLETE", 400);
  if (start > end) throw httpError("ERR_HISTORY_WINDOW_INVALID", 400);
  if (bucketCount(interval, start, end) > HISTORY_MAX_POINTS) {
    throw httpError("ERR_HISTORY_WINDOW_TOO_LARGE", 400);
  }
  query.start = start;
  query.end = end;
  return query;
}

/**
 * Bucket start times for a resolved history query: every bucket from `start` to
 * `end`, or the last `limit` buckets ending with the one that holds `now`.
 */
function bucketStarts(query, now) {
  const step = INTERVAL_MS[query.interval];

  if (query.start !== undefined && query.end !== undefined) {
    const first = bucketIndex(query.start, step);
    return Array.from(
      { length: bucketCount(query.interval, query.start, query.end) },
      (_, i) => (first + i) * step,
    );
  }
  const last = bucketIndex(now, step) * step;
  return Array.from({ length: query.limit }, (_, i) => last - (query.limit - 1 - i) * step);
}

module.exports = { INTERVAL_MS, bucketCount, bucketStarts, resolveHistoryQuery };
