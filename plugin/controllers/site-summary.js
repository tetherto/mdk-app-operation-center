"use strict";

const { site } = require("../lib/site-source");

/** GET /api/site/summary: site-wide totals behind the header stats. */
module.exports = async function siteSummary() {
  return site.summary();
};
