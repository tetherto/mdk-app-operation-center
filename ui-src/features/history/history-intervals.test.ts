import { describe, expect, it } from "vitest";

import { HISTORY_INTERVALS } from "../../api/contract";
import {
  axisTimeFormatOf,
  fromChartTimeline,
  fromSpanTimeline,
  HISTORY_SPAN_OPTIONS,
  intervalOptionsFor,
  liveToggle,
  rangeToggle,
  toChartTimeline,
  toSpanTimeline,
} from "./history-intervals";
import { HISTORY_SPANS } from "./history-window";

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

  it("labels the minute interval", () => {
    expect(intervalOptionsFor(["1m"])).toEqual([{ value: "1m", label: "1 Min" }]);
  });
});

describe("history spans", () => {
  it("offers one toggle option per window, as the design labels them", () => {
    expect(HISTORY_SPAN_OPTIONS.map((option) => option.label)).toEqual([
      "5 Min",
      "30 Min",
      "3 H",
      "1 D",
    ]);
  });

  it("round-trips every window through its toggle key", () => {
    for (const span of HISTORY_SPANS) expect(fromSpanTimeline(toSpanTimeline(span))).toBe(span);
    expect(fromSpanTimeline("1m")).toBeUndefined();
  });
});

describe("liveToggle", () => {
  it("shows the picked window and reports a newly picked one", () => {
    const picked: string[] = [];
    const toggle = liveToggle("3h", (span) => picked.push(span));

    expect(toggle.value).toBe("3h");
    toggle.onChange("1D");
    toggle.onChange("not-ours");
    expect(picked).toEqual(["1d"]);
  });
});

describe("rangeToggle", () => {
  it("offers only the allowed bucket sizes and reports a newly picked one", () => {
    const picked: string[] = [];
    const toggle = rangeToggle("30m", ["30m", "3h", "1d"], (interval) => picked.push(interval));

    expect(toggle.options.map((option) => option.value)).toEqual(["30m", "3h", "1D"]);
    expect(toggle.value).toBe("30m");
    toggle.onChange("3h");
    expect(picked).toEqual(["3h"]);
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
