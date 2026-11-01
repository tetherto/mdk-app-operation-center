"use strict";

const client = require("../client");

module.exports = async () => (await client.getReading()).current_a;
