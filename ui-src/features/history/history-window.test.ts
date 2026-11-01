import { describe, expect, it } from "vitest";

import {
  BUCKET_MS,
  bucketCount,
  fitInterval,
  type HistoryWindow,
  intervalsFor,
  RECENT_WINDOW,
  spansDays,
  toHistoryQuery,
  toRangeWindow,
} from "./history-window";

const DAY_MS = 86_400_000;
const rangeOf = (days: number): HistoryWindow => ({ kind: "range", start: 0, end: days * DAY_MS });

describe("bucketCount", () => {
  it("counts aligned buckets with both ends included, as the plugin does", () => {
    expect(bucketCount("5m", 0, BUCKET_MS["5m"])).toBe(2);
    expect(bucketCount("5m", 1, BUCKET_MS["5m"] - 1)).toBe(1);
  });
});

describe("intervalsFor", () => {
  it("keeps an interval at exactly the point limit and drops it one bucket past", () => {
    const step = BUCKET_MS["5m"];
    expect(intervalsFor({ kind: "range", start: 0, end: 999 * step })).toContain("5m");
    expect(intervalsFor({ kind: "range", start: 0, end: 1000 * step })).not.toContain("5m");
  });

  it("offers every interval for the recent window", () => {
    expect(intervalsFor(RECENT_WINDOW)).toEqual(["5m", "30m", "3h", "1d"]);
  });

  it("drops the intervals that would pass the route's point limit", () => {
    // 3 days at 5 minutes touch 865 buckets; 4 days touch 1153.
    expect(intervalsFor(rangeOf(3))).toEqual(["5m", "30m", "3h", "1d"]);
    expect(intervalsFor(rangeOf(4))).toEqual(["30m", "3h", "1d"]);
    expect(intervalsFor(rangeOf(30))).toEqual(["3h", "1d"]);
  });
});

describe("fitInterval", () => {
  it("keeps the preferred interval when it fits", () => {
    expect(fitInterval(rangeOf(1), "5m")).toBe("5m");
  });

  it("moves to the finest interval that fits", () => {
    expect(fitInterval(rangeOf(30), "5m")).toBe("3h");
  });
});

describe("toHistoryQuery", () => {
  it("asks for the latest buckets in the recent window", () => {
    expect(
      toHistoryQuery("power", "5m", RECENT_WINDOW, { containerId: "c1", rackId: undefined }),
    ).toEqual({ metric: "power", interval: "5m", containerId: "c1" });
  });

  it("asks for the range, and the rack when one is picked", () => {
    expect(
      toHistoryQuery(
        "hashrate",
        "30m",
        { kind: "range", start: 1, end: 2 },
        {
          containerId: "c1",
          rackId: "c1-r2",
        },
      ),
    ).toEqual({
      metric: "hashrate",
      interval: "30m",
      containerId: "c1",
      rackId: "c1-r2",
      start: 1,
      end: 2,
    });
  });
});

describe("toRangeWindow", () => {
  it("spans whole local days", () => {
    const window = toRangeWindow(new Date(2026, 9, 1, 15), new Date(2026, 9, 2, 9), Infinity);

    expect(window).toEqual({
      kind: "range",
      start: new Date(2026, 9, 1).getTime(),
      end: new Date(2026, 9, 2, 23, 59, 59, 999).getTime(),
    });
  });

  it("does not end past now", () => {
    const now = new Date(2026, 9, 2, 12).getTime();

    expect(toRangeWindow(new Date(2026, 9, 1), new Date(2026, 9, 2), now)).toMatchObject({
      end: now,
    });
  });
});

describe("spansDays", () => {
  it("is true only for a range longer than a day", () => {
    expect(spansDays(RECENT_WINDOW)).toBe(false);
    expect(spansDays(rangeOf(1))).toBe(false);
    expect(spansDays(rangeOf(2))).toBe(true);
  });
});
