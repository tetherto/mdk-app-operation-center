import { describe, expect, it } from "vitest";

import type { Miner } from "../../api/contract";
import { HEAT_STEPS, heatScaleOf, heatStepOf, socketHeatOf } from "./heatmap-shape";
import type { LayoutRack } from "./layout-shape";

const createMiner = (overrides: Partial<Miner> = {}): Miner => ({
  id: "miner-1",
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
  powerW: 3_250,
  frequencyMhz: 600,
  inletTempC: 30,
  chipTempC: 80,
  uptimeS: 1,
  lastUpdate: 0,
  ...overrides,
});

const rackOf = (miners: (Miner | null)[]): LayoutRack => ({
  id: "r1",
  name: "Rack 1",
  sockets: miners.map((miner, i) => ({
    position: `1-1-${i + 1}`,
    slot: String(i + 1),
    state: miner?.status ?? "empty",
    miner,
  })),
});

describe("heatScaleOf", () => {
  it("spans the readings of the working miners only", () => {
    const rack = rackOf([
      createMiner({ inletTempC: 28 }),
      createMiner({ inletTempC: 36 }),
      createMiner({ inletTempC: 99, status: "offline" }),
      createMiner({ inletTempC: 5, status: "sleep" }),
      createMiner({ inletTempC: 1, status: "error" }),
      null,
    ]);

    expect(heatScaleOf([rack], "inletTempC")).toEqual({ min: 28, max: 36 });
  });

  it("is undefined when no miner reports", () => {
    expect(heatScaleOf([rackOf([null, createMiner({ status: "offline" })])], "chipTempC")).toBe(
      undefined,
    );
  });
});

describe("heatStepOf", () => {
  const scale = { min: 20, max: 40 };

  it("puts the ends of the scale in the first and last step", () => {
    expect(heatStepOf(20, scale)).toBe(0);
    expect(heatStepOf(40, scale)).toBe(HEAT_STEPS - 1);
  });

  it("puts a reading in its fifth of the range", () => {
    expect(heatStepOf(29, scale)).toBe(2);
  });

  it("uses the middle step when every miner reads the same", () => {
    expect(heatStepOf(30, { min: 30, max: 30 })).toBe(2);
  });
});

describe("socketHeatOf", () => {
  const scale = { min: 3_000, max: 4_000 };

  it("colours a reporting miner and labels it for the tile", () => {
    expect(socketHeatOf(createMiner({ powerW: 4_000 }), "powerW", scale)).toEqual({
      step: 4,
      label: "4.0",
    });
  });

  it("leaves empty sockets and offline, sleeping or erroring miners uncoloured", () => {
    expect(socketHeatOf(null, "powerW", scale)).toBeUndefined();
    expect(socketHeatOf(createMiner({ status: "offline" }), "powerW", scale)).toBeUndefined();
    expect(socketHeatOf(createMiner({ status: "sleep" }), "powerW", scale)).toBeUndefined();
    expect(socketHeatOf(createMiner({ status: "error" }), "powerW", scale)).toBeUndefined();
  });
});
