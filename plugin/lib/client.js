"use strict";

// The app's Kernel client, owned by the MDK app runtime and handed to the
// plugin through the ambient config: it signs in as the app's service account
// (app:<name>) and the Kernel checks every call against spec.rbac. Work done
// for one request uses req.mdk instead, which carries the operator's token on
// top of it. Controllers import this only for work done as the app alone (the
// history sampler).
const { config } = require("@tetherto/mdk-gateway/plugin");

if (config.mdkClient === undefined) {
  throw new Error("ERR_MDK_CLIENT_UNAVAILABLE: the app runtime did not provide config.mdkClient");
}

module.exports = config.mdkClient;
