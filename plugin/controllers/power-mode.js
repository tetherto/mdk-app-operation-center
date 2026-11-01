"use strict";

const { assertCommandsEnabled, site } = require("../lib/site-source");

/** POST /api/commands/power-mode: set the power mode of a container or selected miners. */
module.exports = async function powerMode(req) {
  await assertCommandsEnabled();
  return site.setPowerMode(req.body.target, req.body.mode, req.mdk);
};
