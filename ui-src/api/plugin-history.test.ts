import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import {
  HISTORY_DEFAULT_POINTS,
  HISTORY_INTERVALS,
  HISTORY_MAX_POINTS,
  MINER_STATUSES,
  MINERS_DEFAULT_PAGE_SIZE,
  MINERS_MAX_PAGE_SIZE,
  POWER_MODES,
} from "./contract";

// The plugin is CommonJS and cannot import the TS contract, so it keeps its own
// copies of the limits; these tests pin them and the history window rules.
const load = createRequire(import.meta.url);
const limits: unknown = load("../../plugin/lib/contract-limits.js");
const historyWindow: unknown = load("../../plugin/lib/history-window.js");

type ResolvedHistoryQuery = Record<string, unknown>;
type HistoryWindow = {
  INTERVAL_MS: Record<string, number>;
  resolveHistoryQuery: (query: Record<string, unknown>) => ResolvedHistoryQuery;
  bucketStarts: (query: ResolvedHistoryQuery, now: number) => number[];
};
const isHistoryWindow = (value: unknown): value is HistoryWindow =>
  typeof value === "object" &&
  value !== null &&
  "resolveHistoryQuery" in value &&
  typeof value.resolveHistoryQuery === "function";
if (!isHistoryWindow(historyWindow))
  throw new Error("plugin/lib/history-window.js has an unexpected shape");
const { INTERVAL_MS, bucketStarts, resolveHistoryQuery } = historyWindow;

const HOUR_MS = 3_600_000;
const T0 = Date.UTC(2026, 9, 21);

/** The plugin's error for a query, or undefined when it resolves. */
const errorOf = (query: Record<string, unknown>): string | undefined => {
  try {
    resolveHistoryQuery(query);
    return undefined;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
};

describe("plugin contract limits", () => {
  it("match the contract", () => {
    expect(limits).toEqual({
      HISTORY_DEFAULT_POINTS,
      HISTORY_MAX_POINTS,
      MINERS_DEFAULT_PAGE_SIZE,
      MINERS_MAX_PAGE_SIZE,
      POWER_MODES: [...POWER_MODES],
      MINER_STATUSES: [...MINER_STATUSES],
    });
  });

  it("cover every contract interval", () => {
    expect(Object.keys(INTERVAL_MS).sort()).toEqual([...HISTORY_INTERVALS].sort());
  });
});

describe("resolveHistoryQuery", () => {
  const base = { metric: "power", interval: "3h" };

  it("defaults to the last HISTORY_DEFAULT_POINTS buckets without a window", () => {
    expect(resolveHistoryQuery(base)).toMatchObject({ limit: HISTORY_DEFAULT_POINTS });
  });

  it("keeps a given limit", () => {
    expect(resolveHistoryQuery({ ...base, limit: 12 })).toMatchObject({ limit: 12 });
  });

  it("rejects a half-given window", () => {
    expect(errorOf({ ...base, start: T0 })).toBe("ERR_HISTORY_WINDOW_INCOMPLETE");
    expect(errorOf({ ...base, end: T0 })).toBe("ERR_HISTORY_WINDOW_INCOMPLETE");
  });

  it("rejects a start after the end", () => {
    expect(errorOf({ ...base, start: T0 + HOUR_MS, end: T0 })).toBe("ERR_HISTORY_WINDOW_INVALID");
  });

  it("accepts exactly HISTORY_MAX_POINTS buckets and rejects one more", () => {
    const step = 3 * HOUR_MS;
    const lastIncluded = T0 + (HISTORY_MAX_POINTS - 1) * step;

    expect(errorOf({ ...base, start: T0, end: lastIncluded })).toBeUndefined();
    expect(errorOf({ ...base, start: T0, end: lastIncluded + step })).toBe(
      "ERR_HISTORY_WINDOW_TOO_LARGE",
    );
  });
});

describe("bucketStarts", () => {
  it("serves as many buckets as the window check counts", () => {
    const step = 3 * HOUR_MS;
    const query = resolveHistoryQuery({
      metric: "power",
      interval: "3h",
      start: T0,
      end: T0 + 999 * step,
    });

    expect(bucketStarts(query, T0)).toHaveLength(HISTORY_MAX_POINTS);
  });

  it("starts each bucket on the interval boundary", () => {
    const query = resolveHistoryQuery({
      metric: "power",
      interval: "30m",
      start: T0 + 5 * 60_000,
      end: T0 + HOUR_MS,
    });

    expect(bucketStarts(query, T0)).toEqual([T0, T0 + 30 * 60_000, T0 + HOUR_MS]);
  });
});
