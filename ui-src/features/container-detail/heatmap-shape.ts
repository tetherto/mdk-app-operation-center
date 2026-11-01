import type { Miner, MinerStatus } from "../../api/contract";
import {
  DISPLAY_FRACTION_DIGITS,
  formatFixed,
  formatHashrateThs,
  formatPowerW,
  formatTemperatureC,
  wToKw,
} from "../../lib/units";
import type { LayoutRack } from "./layout-shape";

export const HEATMAP_METRICS = ["inletTempC", "chipTempC", "hashrateThs", "powerW"] as const;
export type HeatmapMetric = (typeof HEATMAP_METRICS)[number];
export const DEFAULT_HEATMAP_METRIC: HeatmapMetric = "inletTempC";

type MetricSpec = {
  label: string;
  /** The value in full, for the legend and the side panel. */
  format: (value: number) => string;
  /** The value on a socket tile, where there is room for a few digits only. */
  tile: (value: number) => string;
};

export const HEATMAP_METRIC_SPECS: Record<HeatmapMetric, MetricSpec> = {
  inletTempC: {
    label: "Inlet temperature",
    format: formatTemperatureC,
    tile: (value) => formatFixed(value, DISPLAY_FRACTION_DIGITS.TEMPERATURE),
  },
  chipTempC: {
    label: "Chip temperature",
    format: formatTemperatureC,
    tile: (value) => formatFixed(value, DISPLAY_FRACTION_DIGITS.TEMPERATURE),
  },
  hashrateThs: {
    label: "Hash rate",
    format: formatHashrateThs,
    tile: (value) => formatFixed(value, DISPLAY_FRACTION_DIGITS.HASHRATE_TH_SOCKET),
  },
  powerW: {
    label: "Consumption",
    format: formatPowerW,
    tile: (value) => formatFixed(wToKw(value), DISPLAY_FRACTION_DIGITS.POWER_KW_SOCKET),
  },
};

/** Colour steps of the scale, coolest first (styles.css: data-heat). */
export const HEAT_STEPS = 5;

/** The low and high end of the scale; undefined while no miner reports. */
export type HeatScale = { min: number; max: number } | undefined;

/**
 * Miners whose readings would bend the scale: offline ones read zero or stale,
 * sleeping and erroring ones near-zero hash rate and power (and cooler chips).
 * One of them would pull the low end down and push every working miner into
 * the top steps, so they are left out of the scale and stay uncoloured.
 */
const OUT_OF_SCALE: ReadonlySet<MinerStatus> = new Set(["offline", "sleep", "error"]);

const isReporting = (miner: Miner | null): miner is Miner =>
  miner !== null && !OUT_OF_SCALE.has(miner.status);

/**
 * The scale spans the container's own readings, so the colours show which
 * sockets run hotter or slower than their neighbours, whatever the absolute
 * values are.
 */
export const heatScaleOf = (racks: LayoutRack[], metric: HeatmapMetric): HeatScale => {
  const values = racks
    .flatMap((rack) => rack.sockets.map((socket) => socket.miner))
    .filter(isReporting)
    .map((miner) => miner[metric]);
  if (values.length === 0) return undefined;
  return { min: Math.min(...values), max: Math.max(...values) };
};

/** The colour step of a reading, 0 to HEAT_STEPS - 1; the middle one when all read the same. */
export const heatStepOf = (value: number, scale: { min: number; max: number }): number => {
  if (scale.max === scale.min) return Math.floor(HEAT_STEPS / 2);
  const position = (value - scale.min) / (scale.max - scale.min);
  return Math.min(HEAT_STEPS - 1, Math.max(0, Math.floor(position * HEAT_STEPS)));
};

/** What a socket tile shows in the heatmap; undefined for a socket with nothing to colour. */
export type SocketHeat = { step: number; label: string };

export const socketHeatOf = (
  miner: Miner | null,
  metric: HeatmapMetric,
  scale: HeatScale,
): SocketHeat | undefined => {
  if (!isReporting(miner) || scale === undefined) return undefined;
  const value = miner[metric];
  return { step: heatStepOf(value, scale), label: HEATMAP_METRIC_SPECS[metric].tile(value) };
};
