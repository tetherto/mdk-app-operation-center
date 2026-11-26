"use strict";

const http = require("http");

// A standalone container simulator: GET /api/v1/reading answers with the air
// temperature and humidity inside the container and its PDU sockets. `mdk run`
// starts one per seed device from the device's opts in mdk.yaml:
// { host, port, baseC, pdus, off }. baseC: the temperature the reading drifts
// around, by about a degree. pdus: socket count per PDU name, sockets named
// "1".."n" ({ "1-1": 10 }). off: the PDU sockets switched off
// ([{ pdu: "1-1", socket: "9" }]); every other socket is on and draws about
// SOCKET_CURRENT_A.

const SOCKET_CURRENT_A = 10.1;
const SOCKET_VOLTAGE_V = 400;

function createServer({ host, port, baseC, pdus, off } = {}) {
  const state = {
    baseC: Number(baseC) || 27,
    humidityPercent: 45,
    pdus: pdus && typeof pdus === "object" ? pdus : {},
    off: new Set((Array.isArray(off) ? off : []).map((s) => `${s.pdu}/${s.socket}`)),
  };

  const pduData = () =>
    Object.entries(state.pdus).map(([pdu, count]) => {
      const sockets = Array.from({ length: Number(count) || 0 }, (_, i) => {
        const socket = String(i + 1);
        const enabled = !state.off.has(`${pdu}/${socket}`);
        const currentA = enabled
          ? Math.round((SOCKET_CURRENT_A - 0.3 + Math.random() * 0.6) * 10) / 10
          : 0;
        return {
          socket,
          enabled,
          power_w: Math.round(currentA * SOCKET_VOLTAGE_V),
          voltage_v: SOCKET_VOLTAGE_V,
          current_a: currentA,
        };
      });
      return {
        pdu,
        power_w: sockets.reduce((sum, s) => sum + s.power_w, 0),
        voltage_v: SOCKET_VOLTAGE_V,
        current_a: Math.round(sockets.reduce((sum, s) => sum + s.current_a, 0) * 10) / 10,
        sockets,
      };
    });

  const reading = () => ({
    ambient_temp_c: Math.round((state.baseC - 1 + Math.random() * 2) * 10) / 10,
    humidity_percent: Math.round(state.humidityPercent - 3 + Math.random() * 6),
    pdu_data: pduData(),
  });

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
