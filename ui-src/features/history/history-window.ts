import {
  HISTORY_INTERVALS,
  HISTORY_MAX_POINTS,
  type HistoryInterval,
  type HistoryMetric,
  type HistoryQuery,
} from "../../api/contract";

const MINUTE_MS = 60_000;

/** The length of one bucket of each interval. */
export const BUCKET_MS: Record<HistoryInterval, number> = {
  "5m": 5 * MINUTE_MS,
  "30m": 30 * MINUTE_MS,
  "3h": 180 * MINUTE_MS,
  "1d": 1440 * MINUTE_MS,
};

/**
 * Which stretch of history a chart shows: the latest buckets, ending now and
 * refreshing, or a fixed range the operator picked (ms epoch).
 */
export type HistoryWindow = { kind: "recent" } | { kind: "range"; start: number; end: number };

export const RECENT_WINDOW: HistoryWindow = { kind: "recent" };

/**
 * Buckets a range touches, counted as the plugin counts them
 * (plugin/lib/history-window.js): aligned buckets, both ends included.
 */
export const bucketCount = (interval: HistoryInterval, start: number, end: number): number =>
  Math.floor(end / BUCKET_MS[interval]) - Math.floor(start / BUCKET_MS[interval]) + 1;

/**
 * The intervals that fit the window: the route answers 400 past
 * {@link HISTORY_MAX_POINTS} buckets, so a long range needs coarser ones.
 * The recent window always fits, since it asks for a bucket count.
 */
export const intervalsFor = (window: HistoryWindow): HistoryInterval[] =>
  window.kind === "recent"
    ? [...HISTORY_INTERVALS]
    : HISTORY_INTERVALS.filter(
        (interval) => bucketCount(interval, window.start, window.end) <= HISTORY_MAX_POINTS,
      );

/** The preferred interval if it fits the window, else the finest one that does. */
export const fitInterval = (window: HistoryWindow, preferred: HistoryInterval): HistoryInterval => {
  const fitting = intervalsFor(window);
  // Past the limit even at the coarsest interval, the coarsest is still the best try.
  return fitting.includes(preferred)
    ? preferred
    : (fitting[0] ?? HISTORY_INTERVALS.at(-1) ?? preferred);
};

const DAY_MS = 24 * 60 * MINUTE_MS;

/** Whether the window spans more than a day; the recent window shows the latest buckets only. */
export const spansDays = (window: HistoryWindow): boolean =>
  window.kind === "range" && window.end - window.start > DAY_MS;

/** Where a series comes from: a container, and optionally one of its racks. */
export type HistoryScope = { containerId: string; rackId: string | undefined };

/** The history query of one chart. */
export const toHistoryQuery = (
  metric: HistoryMetric,
  interval: HistoryInterval,
  window: HistoryWindow,
  { containerId, rackId }: HistoryScope,
): HistoryQuery => {
  const scope = { containerId, ...(rackId === undefined ? {} : { rackId }) };
  return window.kind === "recent"
    ? { metric, interval, ...scope }
    : { metric, interval, ...scope, start: window.start, end: window.end };
};

/**
 * A picked day range as a window: from the start of the first day to the end
 * of the last (local time), never past `now`.
 */
export const toRangeWindow = (from: Date, to: Date, now: number): HistoryWindow => {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);
  return { kind: "range", start: start.getTime(), end: Math.min(end.getTime(), now) };
};
