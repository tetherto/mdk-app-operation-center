"use strict";

const { site } = require("../lib/site-source");

/** GET /api/power-meters: site meter, miners' own power and one entry per meter. */
module.exports = async function powerMeters() {
  return site.powerMeters();
};
