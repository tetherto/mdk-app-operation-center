import type { TimelineOption } from "@tetherto/mdk-react-devkit";

import { HISTORY_INTERVALS, type HistoryInterval } from "../../api/contract";

const INTERVAL_LABELS: Record<HistoryInterval, string> = {
  "5m": "5 Min",
  "30m": "30 Min",
  "3h": "3 H",
  "1d": "1 D",
};

/**
 * The devkit line chart reads its timeline as a bucket interval: it shows the
 * last dozen or so buckets and lets the user scroll back. Its keys spell a day
 * as `1D`; a key it does not know falls back to a one-hour default.
 */
const CHART_TIMELINES: Record<HistoryInterval, string> = {
  "5m": "5m",
  "30m": "30m",
  "3h": "3h",
  "1d": "1D",
};

/** The chart's timeline key for a contract interval. */
export const toChartTimeline = (interval: HistoryInterval): string => CHART_TIMELINES[interval];

/** The contract interval of a chart timeline key, or undefined for a key that is not one of ours. */
export const fromChartTimeline = (timeline: string): HistoryInterval | undefined =>
  HISTORY_INTERVALS.find((interval) => CHART_TIMELINES[interval] === timeline);

const toOption = (interval: HistoryInterval): TimelineOption => ({
  value: toChartTimeline(interval),
  label: INTERVAL_LABELS[interval],
});

/** The interval toggle options of a history chart, in contract order. */
export const HISTORY_INTERVAL_OPTIONS: TimelineOption[] = HISTORY_INTERVALS.map(toOption);

/** The toggle options of just the allowed intervals, still in contract order. */
export const intervalOptionsFor = (allowed: readonly HistoryInterval[]): TimelineOption[] =>
  HISTORY_INTERVALS.filter((interval) => allowed.includes(interval)).map(toOption);

export const DEFAULT_HISTORY_INTERVAL: HistoryInterval = "5m";

/**
 * How the chart labels time per interval (date-fns patterns). The devkit chart
 * labels in UTC unless given a format; with one it formats in local time, the
 * operator's clock. Coarse buckets show the day too, since they span days.
 */
export const AXIS_TIME_FORMATS: Record<HistoryInterval, string> = {
  "5m": "HH:mm",
  "30m": "HH:mm",
  "3h": "MMM dd HH:mm",
  "1d": "MMM dd",
};

const DAY_AND_TIME_FORMAT = "MMM dd HH:mm";

/**
 * The axis format of a chart: the interval's, with the day added when the
 * window spans more than a day, so `HH:mm` labels do not repeat across days.
 */
export const axisTimeFormatOf = (interval: HistoryInterval, spansDays: boolean): string =>
  spansDays && AXIS_TIME_FORMATS[interval] === "HH:mm"
    ? DAY_AND_TIME_FORMAT
    : AXIS_TIME_FORMATS[interval];
