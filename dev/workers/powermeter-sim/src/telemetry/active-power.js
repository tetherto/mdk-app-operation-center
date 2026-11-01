"use strict";

const client = require("../client");

module.exports = async () => (await client.getReading()).active_power_w;
