import { describe, expect, it } from "vitest";

import { HISTORY_INTERVALS } from "../../api/contract";
import {
  axisTimeFormatOf,
  fromChartTimeline,
  HISTORY_INTERVAL_OPTIONS,
  intervalOptionsFor,
  toChartTimeline,
} from "./history-intervals";

describe("history intervals", () => {
  it("uses the devkit chart's key for a day", () => {
    expect(toChartTimeline("1d")).toBe("1D");
  });

  it("round-trips every contract interval through the chart key", () => {
    for (const interval of HISTORY_INTERVALS)
      expect(fromChartTimeline(toChartTimeline(interval))).toBe(interval);
  });

  it("ignores keys that are not ours", () => {
    expect(fromChartTimeline("1h")).toBeUndefined();
  });

  it("offers one toggle option per interval", () => {
    expect(HISTORY_INTERVAL_OPTIONS.map((option) => option.label)).toEqual([
      "5 Min",
      "30 Min",
      "3 H",
      "1 D",
    ]);
  });
});

describe("intervalOptionsFor", () => {
  it("offers only the allowed intervals, in contract order", () => {
    expect(intervalOptionsFor(["1d", "3h"]).map((option) => option.value)).toEqual(["3h", "1D"]);
  });
});

describe("axisTimeFormatOf", () => {
  it("keeps the interval's format within a day", () => {
    expect(axisTimeFormatOf("5m", false)).toBe("HH:mm");
  });

  it("adds the day to time-only labels when the window spans days", () => {
    expect(axisTimeFormatOf("30m", true)).toBe("MMM dd HH:mm");
    expect(axisTimeFormatOf("1d", true)).toBe("MMM dd");
  });
});
