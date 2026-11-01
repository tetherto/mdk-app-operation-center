"use strict";

const client = require("../client");

module.exports = async () => {
  const r = await client.getReading();
  return { active_power: r.active_power_w, voltage: r.voltage_v, current: r.current_a };
};
