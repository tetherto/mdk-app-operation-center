"use strict";

const { assertCommandsEnabled, site } = require("../lib/site-source");

/** POST /api/commands/power-pct: set the power percentage of a container or selected miners. */
module.exports = async function powerPct(req) {
  await assertCommandsEnabled();
  return site.setPowerPct(req.body.target, req.body.pct, req.mdk);
};
