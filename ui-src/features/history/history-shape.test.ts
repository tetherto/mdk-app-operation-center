import { describe, expect, it } from "vitest";

import { scopeKindOf, seriesStats, toHashrateChart, toPowerChart } from "./history-shape";

const T0 = 1_792_000_000_000;

describe("seriesStats", () => {
  it("returns min, max and average", () => {
    expect(seriesStats([2, 4, 9])).toEqual({ min: 2, max: 9, avg: 5 });
  });

  it("returns undefined for an empty series", () => {
    expect(seriesStats([])).toBeUndefined();
  });
});

describe("toHashrateChart", () => {
  const chart = toHashrateChart({
    metric: "hashrate",
    interval: "5m",
    unit: "TH/s",
    points: [
      { ts: T0, value: 650_000 },
      { ts: T0 + 60_000, value: 652_000 },
    ],
    nominal: 660_000,
  });

  it("plots the site series in PH/s with millisecond timestamps", () => {
    expect(chart.datasets[0]?.data).toEqual([
      { x: T0, y: 650 },
      { x: T0 + 60_000, y: 652 },
    ]);
  });

  it("adds a flat nominal line over the same window", () => {
    expect(chart.datasets[1]?.data).toEqual([
      { x: T0, y: 660 },
      { x: T0 + 60_000, y: 660 },
    ]);
    expect(chart.datasets[1]?.currentValue).toEqual({ value: "660.00", unit: "PH/s" });
  });

  it("shows the latest site value and min / max / average of the site series", () => {
    expect(chart.datasets[0]?.currentValue).toEqual({ value: "652.00", unit: "PH/s" });
    expect(chart.minMaxAvg).toEqual({ min: "650.00 PH/s", max: "652.00 PH/s", avg: "651.00 PH/s" });
  });
});

describe("toPowerChart", () => {
  it("plots power in MW with the latest value and footer stats", () => {
    const chart = toPowerChart({
      metric: "power",
      interval: "5m",
      unit: "W",
      points: [
        { ts: T0, value: 22_400_000 },
        { ts: T0 + 60_000, value: 22_600_000 },
      ],
    });

    expect(chart.datasets[0]?.data).toEqual([
      { x: T0, y: 22.4 },
      { x: T0 + 60_000, y: 22.6 },
    ]);
    expect(chart.datasets[0]?.currentValue).toEqual({ value: "22.600", unit: "MW" });
    expect(chart.minMaxAvg).toEqual({ min: "22.400 MW", max: "22.600 MW", avg: "22.500 MW" });
  });

  it("rounds to the shown decimals, so float noise draws a flat line", () => {
    const chart = toPowerChart({
      metric: "power",
      interval: "5m",
      unit: "W",
      points: [
        { ts: T0, value: 236_932.560_000_000_14 },
        { ts: T0 + 60_000, value: 236_932.560_000_000_17 },
      ],
    });

    expect(chart.datasets[0]?.data).toEqual([
      { x: T0, y: 0.237 },
      { x: T0 + 60_000, y: 0.237 },
    ]);
  });

  it("has no current value or footer for an empty series", () => {
    const chart = toPowerChart({ metric: "power", interval: "5m", unit: "W", points: [] });

    expect(chart.datasets[0]?.currentValue).toBeUndefined();
    expect(chart.minMaxAvg).toBeUndefined();
  });
});

describe("scopeKindOf", () => {
  it("is the narrowest scope the query gives", () => {
    expect(scopeKindOf({})).toBe("site");
    expect(scopeKindOf({ containerId: "c1" })).toBe("container");
    expect(scopeKindOf({ containerId: "c1", rackId: "c1-r1" })).toBe("rack");
  });
});

describe("series labels", () => {
  it("name the scope the series covers", () => {
    const hashrate = toHashrateChart(
      { metric: "hashrate", interval: "5m", unit: "TH/s", points: [], nominal: 0 },
      "container",
    );
    const power = toPowerChart({ metric: "power", interval: "5m", unit: "W", points: [] }, "rack");

    expect(hashrate.datasets[0]?.label).toBe("Container hash rate");
    expect(power.datasets[0]?.label).toBe("Rack consumption");
  });
});
