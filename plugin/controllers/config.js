"use strict";

const { site } = require("../lib/site-source");

/** GET /api/config: site name and whether commands are on. */
module.exports = async function config() {
  return site.config();
};
