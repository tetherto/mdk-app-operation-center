import { CHART_COLORS, type LineChartCardData } from "@tetherto/mdk-react-devkit";

import type { History, HistoryPoint } from "../../api/contract";
import {
  DISPLAY_FRACTION_DIGITS,
  DISPLAY_UNITS,
  formatFixed,
  roundTo,
  thsToPhs,
  wToMw,
} from "../../lib/units";

const HASHRATE_DIGITS = DISPLAY_FRACTION_DIGITS.HASHRATE;
const POWER_DIGITS = DISPLAY_FRACTION_DIGITS.POWER;

/** Min, max and average of a series, or undefined for an empty one. */
export const seriesStats = (
  values: number[],
): { min: number; max: number; avg: number } | undefined => {
  if (values.length === 0) return undefined;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  let sum = 0;
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
    sum += value;
  }
  return { min, max, avg: sum / values.length };
};

/**
 * Chart points in the display unit, rounded to the decimals shown: the chart
 * scales its axis to the data, so unrounded float noise (1e-11 W) would draw as
 * a full-height spike and leave the axis without labels. The footer's min, max
 * and average and the current value are computed from these rounded points too.
 */
const toChartPoints = (
  points: HistoryPoint[],
  convert: (value: number) => number,
  fractionDigits: number,
) => points.map((point) => ({ x: point.ts, y: roundTo(convert(point.value), fractionDigits) }));

const footerOf = (
  values: number[],
  unit: string,
  fractionDigits: number,
): LineChartCardData["minMaxAvg"] => {
  const stats = seriesStats(values);
  if (stats === undefined) return undefined;
  return {
    min: `${formatFixed(stats.min, fractionDigits)} ${unit}`,
    max: `${formatFixed(stats.max, fractionDigits)} ${unit}`,
    avg: `${formatFixed(stats.avg, fractionDigits)} ${unit}`,
  };
};

const latestOf = (values: number[]): number | undefined => values.at(-1);

/** What a history series covers: the whole site, one container, or one rack. */
export const HISTORY_SCOPES = { SITE: "site", CONTAINER: "container", RACK: "rack" } as const;
export type HistoryScopeKind = (typeof HISTORY_SCOPES)[keyof typeof HISTORY_SCOPES];

/** The narrowest scope a history query asks for: a rack, else a container, else the site. */
export const scopeKindOf = (query: {
  containerId?: string | undefined;
  rackId?: string | undefined;
}): HistoryScopeKind => {
  if (query.rackId !== undefined) return HISTORY_SCOPES.RACK;
  if (query.containerId !== undefined) return HISTORY_SCOPES.CONTAINER;
  return HISTORY_SCOPES.SITE;
};

const HASHRATE_LABELS: Record<HistoryScopeKind, string> = {
  [HISTORY_SCOPES.SITE]: "Site hash rate",
  [HISTORY_SCOPES.CONTAINER]: "Container hash rate",
  [HISTORY_SCOPES.RACK]: "Rack hash rate",
};

const POWER_LABELS: Record<HistoryScopeKind, string> = {
  [HISTORY_SCOPES.SITE]: "Total consumption",
  [HISTORY_SCOPES.CONTAINER]: "Container consumption",
  [HISTORY_SCOPES.RACK]: "Rack consumption",
};

/**
 * Hashrate history as chart data, in PH/s: the measured series plus a flat
 * nominal line over the same window, each with its current value in the legend,
 * and min / max / average of the measured series in the footer.
 */
export const toHashrateChart = (
  history: Extract<History, { metric: "hashrate" }>,
  scope: HistoryScopeKind = HISTORY_SCOPES.SITE,
): LineChartCardData => {
  const site = toChartPoints(history.points, thsToPhs, HASHRATE_DIGITS);
  const values = site.map((point) => point.y);
  const nominalPhs = thsToPhs(history.nominal);
  const latest = latestOf(values);

  const siteDataset: LineChartCardData["datasets"][number] = {
    label: HASHRATE_LABELS[scope],
    borderColor: CHART_COLORS.secondaryOrange,
    data: site,
  };
  if (latest !== undefined)
    siteDataset.currentValue = {
      value: formatFixed(latest, HASHRATE_DIGITS),
      unit: DISPLAY_UNITS.HASHRATE,
    };

  const data: LineChartCardData = {
    yTicksFormatter: (value) => formatFixed(value, HASHRATE_DIGITS),
    priceFormatter: (value) => formatFixed(value, HASHRATE_DIGITS),
    datasets: [
      siteDataset,
      {
        label: "Nominal hash rate",
        borderColor: CHART_COLORS.grey,
        data: site.map((point) => ({ x: point.x, y: nominalPhs })),
        currentValue: {
          value: formatFixed(nominalPhs, HASHRATE_DIGITS),
          unit: DISPLAY_UNITS.HASHRATE,
        },
      },
    ],
  };
  const footer = footerOf(values, DISPLAY_UNITS.HASHRATE, HASHRATE_DIGITS);
  if (footer !== undefined) data.minMaxAvg = footer;
  return data;
};

/** Power history as chart data, in MW, with the latest value highlighted and min / max / average in the footer. */
export const toPowerChart = (
  history: Extract<History, { metric: "power" }>,
  scope: HistoryScopeKind = HISTORY_SCOPES.SITE,
): LineChartCardData => {
  const series = toChartPoints(history.points, wToMw, POWER_DIGITS);
  const values = series.map((point) => point.y);
  const latest = latestOf(values);

  const dataset: LineChartCardData["datasets"][number] = {
    label: POWER_LABELS[scope],
    borderColor: CHART_COLORS.secondaryOrange,
    data: series,
  };
  if (latest !== undefined)
    dataset.currentValue = { value: formatFixed(latest, POWER_DIGITS), unit: DISPLAY_UNITS.POWER };

  const data: LineChartCardData = {
    yTicksFormatter: (value) => formatFixed(value, POWER_DIGITS),
    priceFormatter: (value) => formatFixed(value, POWER_DIGITS),
    datasets: [dataset],
  };
  const footer = footerOf(values, DISPLAY_UNITS.POWER, POWER_DIGITS);
  if (footer !== undefined) data.minMaxAvg = footer;
  return data;
};
