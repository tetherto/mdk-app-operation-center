import {
  HISTORY_DEFAULT_POINTS,
  HISTORY_INTERVALS,
  HISTORY_MAX_POINTS,
  type HistoryInterval,
  type HistoryMetric,
  type HistoryQuery,
} from "../../api/contract";

const MINUTE_MS = 60_000;

/** The length of one bucket of each interval. */
export const BUCKET_MS: Record<HistoryInterval, number> = {
  "1m": MINUTE_MS,
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

/** A window over a picked range. */
export type RangeWindow = Extract<HistoryWindow, { kind: "range" }>;

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

const scopeFields = ({ containerId, rackId }: HistoryScope) => ({
  containerId,
  ...(rackId === undefined ? {} : { rackId }),
});

/**
 * The window lengths of a live chart's toggle: the chart shows exactly this
 * much time, ending now, whatever data there is in it. They are interval keys,
 * so a window's length is its interval's bucket length.
 */
export const HISTORY_SPANS = [
  "5m",
  "30m",
  "3h",
  "1d",
] as const satisfies readonly HistoryInterval[];
export type HistorySpan = (typeof HISTORY_SPANS)[number];

export const DEFAULT_HISTORY_SPAN: HistorySpan = "5m";

/** The bucket size each window is read at: fine enough to draw a line, few enough points to stay light. */
export const SPAN_INTERVALS: Record<HistorySpan, HistoryInterval> = {
  "5m": "1m",
  "30m": "1m",
  "3h": "5m",
  "1d": "30m",
};

/**
 * Buckets a live window asks for: one per bucket of its length plus the one
 * holding now, so the first and last bucket are exactly the window apart.
 */
export const spanBucketCount = (span: HistorySpan): number =>
  BUCKET_MS[span] / BUCKET_MS[SPAN_INTERVALS[span]] + 1;

/** The history query of a live chart: the last `span` of time, ending now. */
export const toLiveQuery = (
  metric: HistoryMetric,
  span: HistorySpan,
  scope?: HistoryScope,
): HistoryQuery => ({
  metric,
  interval: SPAN_INTERVALS[span],
  limit: spanBucketCount(span),
  ...(scope === undefined ? {} : scopeFields(scope)),
});

/** The history query of a chart over a picked range, at the given bucket size. */
export const toRangeQuery = (
  metric: HistoryMetric,
  interval: HistoryInterval,
  range: RangeWindow,
  scope: HistoryScope,
): HistoryQuery => ({
  metric,
  interval,
  ...scopeFields(scope),
  start: range.start,
  end: range.end,
});

/**
 * The bucket starts a query covers, counted as the plugin counts them
 * (plugin/lib/history-window.js `bucketStarts`): every aligned bucket from
 * `start` to `end`, or the last `limit` buckets ending with the one holding
 * `now`. The chart draws the buckets with no data as empty time, so the axis
 * always spans the whole window.
 */
export const bucketStartsOf = (query: HistoryQuery, now: number): number[] => {
  const step = BUCKET_MS[query.interval];
  if ("start" in query) {
    const first = Math.floor(query.start / step);
    return Array.from(
      { length: bucketCount(query.interval, query.start, query.end) },
      (_, i) => (first + i) * step,
    );
  }
  const limit = query.limit ?? HISTORY_DEFAULT_POINTS;
  const last = Math.floor(now / step) * step;
  return Array.from({ length: limit }, (_, i) => last - (limit - 1 - i) * step);
};

/**
 * About as many points as a chart the width of the page can draw as a line:
 * the Charts tab reads a range at the finest bucket size that stays under it.
 */
export const RANGE_CHART_POINTS = 100;

/**
 * The bucket size a chart over a picked range reads at: the finest that gives
 * at most {@link RANGE_CHART_POINTS} buckets, else the coarsest there is.
 */
export const rangeIntervalOf = (range: RangeWindow): HistoryInterval =>
  HISTORY_INTERVALS.find(
    (interval) => bucketCount(interval, range.start, range.end) <= RANGE_CHART_POINTS,
  ) ??
  HISTORY_INTERVALS.at(-1) ??
  "1d";

/** Days the Charts tab shows before a range is picked: today and the six before it. */
export const DEFAULT_RANGE_DAYS = 7;

/**
 * The Charts tab's window before a range is picked: from the start of the
 * first day to the end of today. It ends in the future, so its chart keeps
 * reading new buckets as they fill (use-history.ts).
 */
export const defaultRangeWindow = (now: number): RangeWindow => {
  const from = new Date(now);
  from.setDate(from.getDate() - (DEFAULT_RANGE_DAYS - 1));
  from.setHours(0, 0, 0, 0);
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  return { kind: "range", start: from.getTime(), end: to.getTime() };
};

/**
 * A picked day range as a window: from the start of the first day to the end
 * of the last (local time), never past `now`.
 */
export const toRangeWindow = (from: Date, to: Date, now: number): RangeWindow => {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);
  return { kind: "range", start: start.getTime(), end: Math.min(end.getTime(), now) };
};
