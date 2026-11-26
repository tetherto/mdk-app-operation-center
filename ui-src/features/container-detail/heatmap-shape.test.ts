import { describe, expect, it } from "vitest";

import type { Miner } from "../../api/contract";
import { heatColorOf, heatScaleOf, heatTicksOf, socketHeatOf } from "./heatmap-shape";
import { type LayoutRack, socketStateOf } from "./layout-shape";

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
  envTempC: null,
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
    state: socketStateOf(miner),
    power: "unknown",
    currentA: null,
    miner,
  })),
});

describe("heatScaleOf", () => {
  it("spans the working miners' coolest, median and hottest reading", () => {
    const rack = rackOf([
      createMiner({ inletTempC: 43 }),
      createMiner({ inletTempC: 38 }),
      createMiner({ inletTempC: 41 }),
      createMiner({ inletTempC: 99, status: "offline" }),
      createMiner({ inletTempC: 5, status: "sleep" }),
      createMiner({ inletTempC: 1, status: "error" }),
      null,
    ]);

    expect(heatScaleOf([rack], "inletTempC")).toEqual({ low: 38, median: 41, high: 43 });
  });

  it("takes the mean of the middle two readings as the median of an even count", () => {
    const rack = rackOf([40, 38, 43, 41].map((inletTempC) => createMiner({ inletTempC })));

    expect(heatScaleOf([rack], "inletTempC")).toEqual({ low: 38, median: 40.5, high: 43 });
  });

  it("is undefined when no miner reports", () => {
    expect(heatScaleOf([rackOf([null, createMiner({ status: "offline" })])], "chipTempC")).toBe(
      undefined,
    );
  });
});

describe("heatColorOf", () => {
  const scale = { low: 38, median: 41, high: 43 };

  // The Figma frame's tiles: 38° to 43° over a container whose median is 41°.
  // 42° is halfway from #3a3531 to #f7931a, red 152.5: the frame rounds it to #98, this to #99.
  it("gives each reading the design's colour", () => {
    expect([38, 39, 40, 41, 42, 43].map((value) => heatColorOf(value, scale))).toEqual([
      { fill: "#3b82f6", ink: "light" },
      { fill: "#3b68b4", ink: "light" },
      { fill: "#3a4f73", ink: "light" },
      { fill: "#3a3531", ink: "light" },
      { fill: "#996426", ink: "light" },
      { fill: "#f7931a", ink: "dark" },
    ]);
  });

  it("uses the median's colour when every miner reads the same", () => {
    expect(heatColorOf(30, { low: 30, median: 30, high: 30 })).toEqual({
      fill: "#3a3531",
      ink: "light",
    });
  });

  it("puts the coolest readings at the median's colour when they are the median", () => {
    const skewed = { low: 38, median: 38, high: 43 };

    expect(heatColorOf(38, skewed)).toEqual({ fill: "#3a3531", ink: "light" });
    expect(heatColorOf(43, skewed)).toEqual({ fill: "#f7931a", ink: "dark" });
  });

  it("puts the hottest readings at the median's colour when they are the median", () => {
    const skewed = { low: 38, median: 43, high: 43 };

    expect(heatColorOf(43, skewed)).toEqual({ fill: "#3a3531", ink: "light" });
    expect(heatColorOf(38, skewed)).toEqual({ fill: "#3b82f6", ink: "light" });
  });
});

describe("socketHeatOf", () => {
  const scale = { low: 3_000, median: 3_500, high: 4_000 };

  it("colours a reporting miner and labels it for the tile", () => {
    expect(socketHeatOf(createMiner({ powerW: 4_000 }), "powerW", scale)).toEqual({
      color: { fill: "#f7931a", ink: "dark" },
      label: "4.0",
    });
    expect(
      socketHeatOf(createMiner({ inletTempC: 42.6 }), "inletTempC", {
        low: 38,
        median: 41,
        high: 43,
      }).label,
    ).toBe("43°");
  });

  it("shows offline, sleeping or erroring miners as no metric", () => {
    for (const status of ["offline", "sleep", "error"] as const) {
      expect(socketHeatOf(createMiner({ status }), "powerW", scale)).toEqual({
        color: "none",
        label: "—",
      });
    }
  });
});

describe("heatTicksOf", () => {
  it("names a temperature's coolest, median and hottest reading", () => {
    expect(heatTicksOf("inletTempC", { low: 38, median: 41, high: 43 })).toEqual({
      low: "38° coolest",
      median: "41° median",
      high: "43° hottest",
    });
  });

  it("names any other metric's lowest and highest reading", () => {
    expect(heatTicksOf("powerW", { low: 3_000, median: 3_500, high: 4_000 })).toEqual({
      low: "3.0 lowest",
      median: "3.5 median",
      high: "4.0 highest",
    });
  });

  it("has no labels without readings", () => {
    expect(heatTicksOf("inletTempC", undefined)).toBeUndefined();
  });
});
