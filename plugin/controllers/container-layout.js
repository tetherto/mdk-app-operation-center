"use strict";

const { httpError } = require("../lib/errors");
const { site } = require("../lib/site-source");

/** GET /api/containers/:id/layout: the socket grid of one container. */
module.exports = async function containerLayout(req) {
  const layout = await site.containerLayout(req.params.id);
  if (layout === null) throw httpError("ERR_CONTAINER_NOT_FOUND", 404);
  return layout;
};
