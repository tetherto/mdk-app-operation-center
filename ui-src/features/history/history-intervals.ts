import type { TimelineOption } from "@tetherto/mdk-react-devkit";

import { HISTORY_INTERVALS, type HistoryInterval } from "../../api/contract";
import { HISTORY_SPANS, type HistorySpan } from "./history-window";

const INTERVAL_LABELS: Record<HistoryInterval, string> = {
  "1m": "1 Min",
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
  "1m": "1m",
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
  "1m": "HH:mm",
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

/**
 * The toggle options of a live chart: one per window length. A window is an
 * interval key, so it takes the interval's label and the devkit's own key, and
 * the toggle and the chart agree, though the chart is told to fit the whole
 * window rather than pick its own range from the key.
 */
export const HISTORY_SPAN_OPTIONS: TimelineOption[] = HISTORY_SPANS.map(toOption);

export const toSpanTimeline = (span: HistorySpan): string => toChartTimeline(span);

/** The window of a toggle key, or undefined for a key that is not one of ours. */
export const fromSpanTimeline = (timeline: string): HistorySpan | undefined =>
  HISTORY_SPANS.find((span) => toChartTimeline(span) === timeline);

/**
 * How a live chart labels time: the time of day for every window. Even the day
 * window keeps it short, since a day-and-time label is too wide for its ticks
 * and the chart already marks midnight with a bold tick.
 */
export const LIVE_AXIS_FORMAT = "HH:mm";

/** A chart's toggle: its options, the picked one and what picking does. */
export type HistoryToggle = {
  options: TimelineOption[];
  value: string;
  onChange: (value: string) => void;
};

/** The toggle of a live chart: it picks how much time the chart shows. */
export const liveToggle = (
  span: HistorySpan,
  onSpanChange: (span: HistorySpan) => void,
): HistoryToggle => ({
  options: HISTORY_SPAN_OPTIONS,
  value: toSpanTimeline(span),
  onChange: (value) => {
    const next = fromSpanTimeline(value);
    if (next !== undefined) onSpanChange(next);
  },
});

/**
 * The toggle of a chart over a picked range: the range fixes the time, so it
 * picks the bucket size, offering only the ones that fit.
 */
export const rangeToggle = (
  interval: HistoryInterval,
  allowed: readonly HistoryInterval[],
  onIntervalChange: (interval: HistoryInterval) => void,
): HistoryToggle => ({
  options: intervalOptionsFor(allowed),
  value: toChartTimeline(interval),
  onChange: (value) => {
    const next = fromChartTimeline(value);
    if (next !== undefined) onIntervalChange(next);
  },
});
