import { describe, expect, it } from "vitest";

import {
  BUCKET_MS,
  bucketCount,
  bucketStartsOf,
  defaultRangeWindow,
  fitInterval,
  HISTORY_SPANS,
  type HistoryWindow,
  intervalsFor,
  RANGE_CHART_POINTS,
  rangeIntervalOf,
  RECENT_WINDOW,
  SPAN_INTERVALS,
  spanBucketCount,
  spansDays,
  toLiveQuery,
  toRangeQuery,
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
    expect(intervalsFor(RECENT_WINDOW)).toEqual(["1m", "5m", "30m", "3h", "1d"]);
  });

  it("drops the intervals that would pass the route's point limit", () => {
    // Half a day at 1 minute touches 721 buckets, a day 1441.
    expect(intervalsFor(rangeOf(0.5))).toEqual(["1m", "5m", "30m", "3h", "1d"]);
    expect(intervalsFor(rangeOf(1))).toEqual(["5m", "30m", "3h", "1d"]);
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

describe("live windows", () => {
  it("ask for one bucket per step of the window plus the one holding now", () => {
    expect(
      HISTORY_SPANS.map((span) => [span, SPAN_INTERVALS[span], spanBucketCount(span)]),
    ).toEqual([
      ["5m", "1m", 6],
      ["30m", "1m", 31],
      ["3h", "5m", 37],
      ["1d", "30m", 49],
    ]);
  });

  it("put the first and last bucket exactly the window apart", () => {
    const query = toLiveQuery("hashrate", "3h");
    const starts = bucketStartsOf(query, 10 * DAY_MS + 7 * 60_000);

    expect(starts.at(-1)! - starts[0]!).toBe(3 * 60 * 60_000);
  });
});

describe("toLiveQuery", () => {
  it("asks for the window's buckets at its bucket size, for the site or a scope", () => {
    expect(toLiveQuery("power", "5m")).toEqual({ metric: "power", interval: "1m", limit: 6 });
    expect(toLiveQuery("hashrate", "1d", { containerId: "c1", rackId: undefined })).toEqual({
      metric: "hashrate",
      interval: "30m",
      limit: 49,
      containerId: "c1",
    });
  });
});

describe("toRangeQuery", () => {
  it("asks for the range, and the rack when one is picked", () => {
    expect(
      toRangeQuery(
        "hashrate",
        "30m",
        { kind: "range", start: 1, end: 2 },
        { containerId: "c1", rackId: "c1-r2" },
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

describe("bucketStartsOf", () => {
  const step = BUCKET_MS["5m"];

  it("counts back from the bucket holding now for a live query", () => {
    expect(bucketStartsOf({ metric: "power", interval: "5m", limit: 3 }, 10 * step + 1)).toEqual([
      8 * step,
      9 * step,
      10 * step,
    ]);
  });

  it("covers every aligned bucket of a range, both ends included", () => {
    expect(
      bucketStartsOf({ metric: "power", interval: "5m", start: step + 1, end: 3 * step }, 0),
    ).toEqual([step, 2 * step, 3 * step]);
  });
});

describe("rangeIntervalOf", () => {
  const MINUTE_MS = 60_000;
  const minutes = (count: number) => ({ kind: "range", start: 0, end: count * MINUTE_MS }) as const;

  it("reads at 1 minute while that stays within the chart's points", () => {
    expect(bucketCount("1m", 0, (RANGE_CHART_POINTS - 1) * MINUTE_MS)).toBe(RANGE_CHART_POINTS);
    expect(rangeIntervalOf(minutes(RANGE_CHART_POINTS - 1))).toBe("1m");
  });

  it("steps up to the next bucket size one point past the limit", () => {
    expect(rangeIntervalOf(minutes(RANGE_CHART_POINTS))).toBe("5m");
  });

  it("reads seven days at 3 hours, 30 minutes being too many points", () => {
    const week = { kind: "range", start: 0, end: 7 * DAY_MS } as const;

    expect(bucketCount("30m", week.start, week.end)).toBeGreaterThan(RANGE_CHART_POINTS);
    expect(rangeIntervalOf(week)).toBe("3h");
  });

  it("falls back to the coarsest bucket size when even that is too many", () => {
    expect(rangeIntervalOf({ kind: "range", start: 0, end: 400 * DAY_MS })).toBe("1d");
  });
});

describe("defaultRangeWindow", () => {
  it("spans today and the six days before it, start of the first to end of today", () => {
    const now = new Date(2026, 10, 9, 15, 30).getTime();

    expect(defaultRangeWindow(now)).toEqual({
      kind: "range",
      start: new Date(2026, 10, 3).getTime(),
      end: new Date(2026, 10, 9, 23, 59, 59, 999).getTime(),
    });
  });

  it("ends in the future, so its chart keeps refreshing", () => {
    const now = new Date(2026, 10, 9, 23, 59).getTime();

    expect(defaultRangeWindow(now).end).toBeGreaterThan(now);
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
