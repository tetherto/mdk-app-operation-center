"use strict";

const client = require("../client");

module.exports = async () => (await client.getReading()).ambient_temp_c;
