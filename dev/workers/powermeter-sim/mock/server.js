"use strict";

const http = require("http");

// A standalone power-meter simulator: GET /api/v1/reading answers with the
// meter's current readings. `mdk run` starts one per seed device from the
// device's opts in mdk.yaml: { host, port, baseW } (baseW: the load behind the
// meter, around which the reading drifts by a few percent).

const SQRT3 = Math.sqrt(3);

function createServer({ host, port, baseW } = {}) {
  const state = {
    baseW: Number(baseW) || 60000,
    voltageV: 400,
  };

  const reading = () => {
    const activePowerW = Math.round(state.baseW * (0.98 + Math.random() * 0.04));
    const voltageV = Math.round(state.voltageV * (0.995 + Math.random() * 0.01) * 10) / 10;
    return {
      active_power_w: activePowerW,
      voltage_v: voltageV,
      current_a: Math.round((activePowerW / (SQRT3 * voltageV)) * 10) / 10,
    };
  };

  const server = http.createServer((req, res) => {
    const reply = (code, body) => {
      res.writeHead(code, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
    };
    if (req.method === "GET" && req.url === "/api/v1/reading") return reply(200, reading());
    reply(404, { ok: false, error: "ERR_NOT_FOUND" });
  });

  const ready = new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port || 0, host || "127.0.0.1", () => resolve(server.address()));
  });

  return {
    server,
    state,
    ready,
    exit() {
      server.close();
    },
  };
}

module.exports = { createServer };
