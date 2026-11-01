"use strict";

/**
 * Limits and value lists of the route contract (ui-src/api/contract.ts), for
 * the plugin's CommonJS code. api/plugin-history.test.ts fails if they drift
 * from the contract.
 */
module.exports = {
  HISTORY_DEFAULT_POINTS: 288,
  HISTORY_MAX_POINTS: 1000,
  MINERS_DEFAULT_PAGE_SIZE: 20,
  MINERS_MAX_PAGE_SIZE: 200,
  POWER_MODES: ["sleep", "low", "normal", "high"],
  MINER_STATUSES: ["offline", "error", "sleep", "low", "normal", "high"],
};
