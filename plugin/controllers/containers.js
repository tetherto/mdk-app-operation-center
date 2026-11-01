"use strict";

const { site } = require("../lib/site-source");

/** GET /api/containers: every container with its racks. */
module.exports = async function containers() {
  return site.containers();
};
