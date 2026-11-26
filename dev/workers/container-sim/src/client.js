"use strict";

const { opts } = require("@tetherto/mdk-worker/device");

// The simulator's HTTP JSON API (mock/server.js): one GET returns every reading.
const base = `http://${opts.host || "127.0.0.1"}:${opts.port}`;

module.exports = {
  async getReading() {
    const res = await fetch(`${base}/api/v1/reading`);
    const body = await res.json();
    if (!res.ok || body.ok === false)
      throw new Error(body.error || `ERR_DEVICE_CALL_FAILED: ${res.status}`);
    return body;
  },
};
