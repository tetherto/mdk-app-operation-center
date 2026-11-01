"use strict";

const { site } = require("../lib/site-source");

/** GET /api/miners: one page of miners, optionally filtered by container or search. */
module.exports = async function miners(req) {
  const { containerId, search, page, pageSize } = req.query;
  return site.miners({ containerId, search, page, pageSize });
};
