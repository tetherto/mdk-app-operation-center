import { describe, expect, it } from "vitest";

import { FALLBACK } from "./constants";
import {
  formatCount,
  formatPercent,
  formatTemperatureC,
  formatPowerMw,
  formatEfficiency,
  formatHashratePhs,
  formatHashrateThs,
  formatPowerKw,
  formatPowerW,
  roundTo,
} from "./units";

describe("formatEfficiency", () => {
  it("formats W/TH with 2 decimals", () => {
    expect(formatEfficiency(16.876)).toBe("16.88 W/TH");
  });

  it("falls back when there is no efficiency", () => {
    expect(formatEfficiency(undefined)).toBe(FALLBACK);
  });
});

describe("formatPowerKw and formatHashratePhs", () => {
  it("format with their units and digits", () => {
    expect(formatPowerKw(5701.4)).toBe("5,701 kW");
    expect(formatHashratePhs(168.9)).toBe("168.90 PH/s");
  });
});

describe("formatHashrateThs and formatPowerW", () => {
  it("formats one miner's hashrate and power", () => {
    expect(formatHashrateThs(214.456)).toBe("214.46 TH/s");
    expect(formatPowerW(3612.4)).toBe("3,612 W");
  });
});

describe("formatTemperatureC", () => {
  it("writes one decimal and the unit", () => {
    expect(formatTemperatureC(34.83)).toBe("34.8 °C");
  });
});

describe("formatPowerMw", () => {
  it("writes three decimals and the unit", () => {
    expect(formatPowerMw(0.249075)).toBe("0.249 MW");
  });
});

describe("formatPercent", () => {
  it("writes a whole percentage with the sign right after it", () => {
    expect(formatPercent(80)).toBe("80%");
    expect(formatPercent(99.6)).toBe("100%");
  });
});

describe("formatCount", () => {
  it("uses the singular for exactly one", () => {
    expect(formatCount(1, "container")).toBe("1 container");
  });

  it("uses the plural otherwise", () => {
    expect(formatCount(0, "miner")).toBe("0 miners");
    expect(formatCount(1280, "miner")).toBe("1,280 miners");
  });
});

describe("roundTo", () => {
  it("rounds to the given decimals", () => {
    expect(roundTo(0.1 + 0.2, 2)).toBe(0.3);
    expect(roundTo(9.071_46, 2)).toBe(9.07);
    expect(roundTo(101.84, 0)).toBe(102);
  });
});
