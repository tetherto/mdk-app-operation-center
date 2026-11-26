import type { Miner, MinerStatus } from "../../api/contract";
import {
  DISPLAY_FRACTION_DIGITS,
  formatFixed,
  formatHashrateThs,
  formatMinerPowerKw,
  formatTemperatureC,
  wToKw,
} from "../../lib/units";
import type { LayoutRack } from "./layout-shape";

export const HEATMAP_METRICS = ["inletTempC", "chipTempC", "hashrateThs", "powerW"] as const;
export type HeatmapMetric = (typeof HEATMAP_METRICS)[number];
export const DEFAULT_HEATMAP_METRIC: HeatmapMetric = "inletTempC";

type MetricSpec = {
  label: string;
  /** The value in full, for the side panel. */
  format: (value: number) => string;
  /**
   * The value on a socket tile and the scale's labels, where there is room for
   * a few digits: the metric's own decimals unless told otherwise.
   */
  short: (value: number, fractionDigits?: number) => string;
  /** What the scale calls its lowest and highest reading: "coolest" and "hottest" for a temperature. */
  ends: { low: string; high: string };
};

const TEMPERATURE_ENDS = { low: "coolest", high: "hottest" };
const AMOUNT_ENDS = { low: "lowest", high: "highest" };

const degrees = (value: number, fractionDigits = 0): string =>
  `${formatFixed(value, fractionDigits)}°`;

export const HEATMAP_METRIC_SPECS: Record<HeatmapMetric, MetricSpec> = {
  inletTempC: {
    label: "Inlet temperature",
    format: formatTemperatureC,
    short: degrees,
    ends: TEMPERATURE_ENDS,
  },
  chipTempC: {
    label: "Chip temperature",
    format: formatTemperatureC,
    short: degrees,
    ends: TEMPERATURE_ENDS,
  },
  hashrateThs: {
    label: "Hash rate",
    format: formatHashrateThs,
    short: (value, fractionDigits = DISPLAY_FRACTION_DIGITS.HASHRATE_TH_SOCKET) =>
      formatFixed(value, fractionDigits),
    ends: AMOUNT_ENDS,
  },
  powerW: {
    label: "Consumption",
    format: formatMinerPowerKw,
    short: (value, fractionDigits = DISPLAY_FRACTION_DIGITS.POWER_KW_SOCKET) =>
      formatFixed(wToKw(value), fractionDigits),
    ends: AMOUNT_ENDS,
  },
};

/**
 * What the colours span: the container's coolest, median and hottest reading,
 * so the colours show which sockets run hotter or slower than their neighbours.
 */
export type HeatScale = { low: number; median: number; high: number } | undefined;

/** A socket's colour on the scale, with the ink its value reads in; "none" for no reading. */
export type HeatColor = { fill: string; ink: "light" | "dark" } | "none";

/**
 * Miners whose readings would bend the scale: offline ones read zero or stale,
 * sleeping and erroring ones near-zero hash rate and power (and cooler chips).
 * One of them would pull the low end down and push every working miner into
 * the top steps, so they are left out of the scale and shown as "no metric".
 */
const OUT_OF_SCALE: ReadonlySet<MinerStatus> = new Set(["offline", "sleep", "error"]);

const isReporting = (miner: Miner | null): miner is Miner =>
  miner !== null && !OUT_OF_SCALE.has(miner.status);

/** The middle reading, or the mean of the middle two. */
const medianOf = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted[middle] ?? 0)
    : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
};

/** The scale over the reporting miners' readings; undefined when none reports. */
export const heatScaleOf = (racks: LayoutRack[], metric: HeatmapMetric): HeatScale => {
  const values = racks
    .flatMap((rack) => rack.sockets.map((socket) => socket.miner))
    .filter(isReporting)
    .map((miner) => miner[metric]);
  if (values.length === 0) return undefined;
  return { low: Math.min(...values), median: medianOf(values), high: Math.max(...values) };
};

type Rgb = readonly [number, number, number];

/** The design's colours for the coolest, median and hottest reading (#3b82f6, #3a3531, #f7931a). */
const HEAT_COOL: Rgb = [59, 130, 246];
const HEAT_MEDIAN: Rgb = [58, 53, 49];
const HEAT_HOT: Rgb = [247, 147, 26];

const hexOf = (rgb: Rgb): string =>
  `#${rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;

/** The legend's ramp: coolest on the left, the median in the middle, hottest on the right. */
export const HEAT_RAMP = `linear-gradient(to right, ${hexOf(HEAT_COOL)}, ${hexOf(HEAT_MEDIAN)} 50%, ${hexOf(HEAT_HOT)})`;

/** The colour a share of the way from one colour to another, to whole channels. */
const mix = (from: Rgb, to: Rgb, share: number): Rgb => [
  Math.round(from[0] + (to[0] - from[0]) * share),
  Math.round(from[1] + (to[1] - from[1]) * share),
  Math.round(from[2] + (to[2] - from[2]) * share),
];

/** Relative luminance (WCAG), to pick the ink a value reads in on a colour. */
const linear = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.040_45 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminanceOf = ([r, g, b]: Rgb): number =>
  0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);

/** Fills lighter than this take dark ink: the design's hottest orange does, its coolest blue does not. */
const DARK_INK_ABOVE = 0.3;

/**
 * Where a reading sits along the ramp, 0 to 1: the coolest to the median fill
 * the first half, the median to the hottest the second. A reading equal to the
 * median sits at the middle, also when the median is the coolest or the hottest
 * reading: when half or more of the miners read the same, they show neutral and
 * the rest show cooler or hotter than them.
 */
const rampPlaceOf = (value: number, { low, median, high }: NonNullable<HeatScale>): number => {
  if (value === median) return 0.5;
  const place =
    value < median
      ? (0.5 * (value - low)) / (median - low)
      : 0.5 + (0.5 * (value - median)) / (high - median);
  return Math.min(1, Math.max(0, place));
};

/** A reading's colour: blue at the coolest, the dark neutral at the median, orange at the hottest. */
export const heatColorOf = (value: number, scale: NonNullable<HeatScale>): HeatColor => {
  const place = rampPlaceOf(value, scale);
  const rgb =
    place <= 0.5
      ? mix(HEAT_COOL, HEAT_MEDIAN, place * 2)
      : mix(HEAT_MEDIAN, HEAT_HOT, place * 2 - 1);
  return { fill: hexOf(rgb), ink: luminanceOf(rgb) > DARK_INK_ABOVE ? "dark" : "light" };
};

/** What a socket tile shows in the heatmap. */
export type SocketHeat = { color: HeatColor; label: string };

/** A miner that is not reporting, or a scale with no readings, shows "no metric". */
export const socketHeatOf = (miner: Miner, metric: HeatmapMetric, scale: HeatScale): SocketHeat => {
  if (!isReporting(miner) || scale === undefined) return { color: "none", label: "—" };
  const value = miner[metric];
  return { color: heatColorOf(value, scale), label: HEATMAP_METRIC_SPECS[metric].short(value) };
};

/** The labels under the ramp's left end, middle and right end: "38° coolest", "41° median", "43° hottest". */
export type HeatTicks = { low: string; median: string; high: string };

/** The scale's three labels in the metric's own format; undefined when no miner reports. */
export const heatTicksOf = (metric: HeatmapMetric, scale: HeatScale): HeatTicks | undefined => {
  if (scale === undefined) return undefined;
  const { short, ends } = HEATMAP_METRIC_SPECS[metric];
  return {
    low: `${short(scale.low)} ${ends.low}`,
    median: `${short(scale.median)} median`,
    high: `${short(scale.high)} ${ends.high}`,
  };
};
