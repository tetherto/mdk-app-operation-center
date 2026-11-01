"use strict";

const { resolveHistoryQuery } = require("../lib/history-window");
const { site } = require("../lib/site-source");

/**
 * GET /api/history: one point per `interval` bucket, for the last `limit`
 * buckets ending now or every bucket between `start` and `end`.
 */
module.exports = async function history(req) {
  return site.history(resolveHistoryQuery(req.query));
};
