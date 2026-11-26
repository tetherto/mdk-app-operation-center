import { describe, expect, it } from "vitest";

import type { Miner } from "../../api/contract";
import { SOCKET_CSV_COLUMNS } from "./layout-csv";
import type { LayoutSocket } from "./layout-shape";

const MINER: Miner = {
  id: "miner-1-1-1",
  serial: "WM1101",
  ip: "10.1.1.21",
  containerId: "container-1",
  rackId: "container-1-rack-1",
  position: "1-1-1",
  status: "normal",
  powerMode: "normal",
  powerPct: 100,
  supportedPowerModes: ["normal"],
  hashrateThs: 100,
  powerW: 3250,
  frequencyMhz: 785,
  inletTempC: 34.8,
  envTempC: null,
  chipTempC: 70,
  uptimeS: 60,
  lastUpdate: 1,
};

const valuesOf = (socket: LayoutSocket) =>
  Object.fromEntries(
    SOCKET_CSV_COLUMNS.filter((c) => ["Socket Power", "Current (A)"].includes(c.header)).map(
      (c) => [c.header, c.value({ rack: "Rack 1", socket })],
    ),
  );

describe("SOCKET_CSV_COLUMNS", () => {
  it("exports the PDU's on/off and current, blank without a reading", () => {
    const socket = (over: Partial<LayoutSocket>): LayoutSocket => ({
      position: "1-1-1",
      state: "normal",
      power: "on",
      currentA: 10.13,
      miner: MINER,
      ...over,
    });

    expect(valuesOf(socket({}))).toEqual({ "Socket Power": "on", "Current (A)": 10.1 });
    expect(valuesOf(socket({ power: "off", currentA: 0 }))).toEqual({
      "Socket Power": "off",
      "Current (A)": 0,
    });
    expect(valuesOf(socket({ power: "unknown", currentA: null }))).toEqual({
      "Socket Power": undefined,
      "Current (A)": undefined,
    });
  });
});
