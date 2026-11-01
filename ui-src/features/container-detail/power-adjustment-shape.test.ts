import { describe, expect, it } from "vitest";

import type { ContainerLayout, Miner } from "../../api/contract";
import { toLayoutView } from "./layout-shape";
import {
  clampPct,
  isSelectableMiner,
  parsePctInput,
  selectableMiners,
  selectedMinersOf,
  selectionNameOf,
  sharedPctOf,
} from "./power-adjustment-shape";

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

const layoutOf = (miners: (Miner | null)[]) =>
  toLayoutView({
    container: { id: "c1", name: "Container 1", model: "M56S", hashrateThs: 0, powerW: 0 },
    racks: [
      {
        id: "c1-r1",
        name: "Rack 1",
        sockets: miners.map((miner, i) => ({ position: `1-1-${i + 1}`, miner })),
      },
    ],
  } satisfies ContainerLayout);

describe("selectableMiners", () => {
  it("offers every miner that is not offline, skipping empty sockets", () => {
    const layout = layoutOf([
      createMiner({ id: "a" }),
      null,
      createMiner({ id: "b", status: "offline" }),
      createMiner({ id: "c", status: "sleep" }),
    ]);

    expect(selectableMiners(layout).map((miner) => miner.id)).toEqual(["a", "c"]);
  });
});

describe("selectedMinersOf", () => {
  it("keeps the selected miners still in the layout, in layout order", () => {
    const layout = layoutOf([createMiner({ id: "a" }), createMiner({ id: "b" })]);

    expect(selectedMinersOf(layout, new Set(["b", "a", "gone"])).map((m) => m.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("drops a selected miner that went offline", () => {
    const layout = layoutOf([createMiner({ id: "a", status: "offline" })]);

    expect(selectedMinersOf(layout, new Set(["a"]))).toEqual([]);
  });
});

describe("sharedPctOf", () => {
  it("is the percentage every selected miner reports", () => {
    expect(sharedPctOf([createMiner({ powerPct: 80 }), createMiner({ powerPct: 80 })])).toBe(80);
  });

  it("is null when they differ, none report one, or nothing is selected", () => {
    expect(sharedPctOf([createMiner({ powerPct: 80 }), createMiner({ powerPct: 90 })])).toBeNull();
    expect(sharedPctOf([createMiner({ powerPct: null })])).toBeNull();
    expect(sharedPctOf([])).toBeNull();
  });
});

describe("clampPct", () => {
  it("rounds to a whole percentage within 0 to 100", () => {
    expect(clampPct(72.6)).toBe(73);
    expect(clampPct(-5)).toBe(0);
    expect(clampPct(140)).toBe(100);
  });

  it("falls back to 100 for something that is not a number", () => {
    expect(clampPct(Number.NaN)).toBe(100);
  });
});

describe("selectionNameOf", () => {
  it("names one miner by serial and more by count", () => {
    expect(selectionNameOf([createMiner()])).toBe("WM1101");
    expect(selectionNameOf([createMiner(), createMiner({ id: "b" })])).toBe("2 miners");
  });
});

describe("isSelectableMiner", () => {
  it("leaves out offline miners only", () => {
    expect(isSelectableMiner(createMiner({ status: "offline" }))).toBe(false);
    expect(isSelectableMiner(createMiner({ status: "sleep" }))).toBe(true);
    expect(isSelectableMiner(createMiner({ status: "error" }))).toBe(true);
  });
});

describe("parsePctInput", () => {
  it("keeps the last value while the field is empty or not a number", () => {
    expect(parsePctInput("")).toBeUndefined();
    expect(parsePctInput("  ")).toBeUndefined();
    expect(parsePctInput("abc")).toBeUndefined();
  });

  it("reads a typed number as a whole percentage within 0 to 100", () => {
    expect(parsePctInput("70")).toBe(70);
    expect(parsePctInput("0")).toBe(0);
    expect(parsePctInput("150")).toBe(100);
    expect(parsePctInput("72.6")).toBe(73);
  });
});
