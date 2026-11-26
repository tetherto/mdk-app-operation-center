"use strict";

const client = require("../client");

module.exports = async () => {
  const r = await client.getReading();
  return {
    stats: {
      status: "running",
      ambient_temp_c: r.ambient_temp_c,
      humidity_percent: r.humidity_percent,
      container_specific: { pdu_data: r.pdu_data },
    },
    config: {},
  };
};
