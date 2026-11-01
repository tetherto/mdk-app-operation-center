/** Unit conversions from the contract's base units (TH/s, W) to display units, and how they display. */
import { FALLBACK } from "./constants";

export const TH_PER_PH = 1000;
export const W_PER_KW = 1000;
export const W_PER_MW = 1_000_000;

export const thsToPhs = (ths: number): number => ths / TH_PER_PH;
export const wToKw = (w: number): number => w / W_PER_KW;
export const wToMw = (w: number): number => w / W_PER_MW;

/** W per TH/s; undefined without hashrate, so the UI shows `-` instead of dividing by zero. */
export const toEfficiencyWPerThs = (powerW: number, hashrateThs: number): number | undefined =>
  hashrateThs > 0 ? powerW / hashrateThs : undefined;

/** Display units, the same on every page. */
export const DISPLAY_UNITS = {
  HASHRATE: "PH/s",
  /** One miner's hashrate. */
  HASHRATE_TH: "TH/s",
  POWER: "MW",
  /** One miner's power. */
  POWER_W: "W",
  /** Container and rack power, as Figma's Site Overview shows it. */
  POWER_KW: "kW",
  EFFICIENCY: "W/TH/s",
  /** Container and rack efficiency, as Figma's Site Overview cards show it. */
  EFFICIENCY_CARD: "W/TH",
  PERCENT: "%",
  TEMPERATURE: "°C",
} as const;

/** Decimals per display unit. */
export const DISPLAY_FRACTION_DIGITS = {
  HASHRATE: 2,
  HASHRATE_TH: 2,
  /** A miner's hash rate on a socket tile, where there is room for whole TH/s only. */
  HASHRATE_TH_SOCKET: 0,
  /** A miner's power on a socket tile, in kW. */
  POWER_KW_SOCKET: 1,
  POWER: 3,
  POWER_W: 0,
  POWER_KW: 0,
  EFFICIENCY: 2,
  TEMPERATURE: 1,
} as const;

/** Fixed decimals, with thousands separators, in one locale everywhere. */
export const formatFixed = (value: number, fractionDigits: number): string =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

/**
 * Rounds to the decimals shown, so values that differ only past them (float
 * noise in summed readings) are equal: a chart of them draws a flat line.
 */
export const roundTo = (value: number, fractionDigits: number): number => {
  const scale = 10 ** fractionDigits;
  return Math.round(value * scale) / scale;
};

const withUnit = (value: string, unit: string): string => `${value} ${unit}`;

/** Efficiency with its unit, or the fallback when there is no hashrate to divide by. */
export const formatEfficiency = (
  wPerThs: number | undefined,
  unit: string = DISPLAY_UNITS.EFFICIENCY_CARD,
): string =>
  wPerThs === undefined
    ? FALLBACK
    : withUnit(formatFixed(wPerThs, DISPLAY_FRACTION_DIGITS.EFFICIENCY), unit);

export const formatPowerMw = (mw: number): string =>
  withUnit(formatFixed(mw, DISPLAY_FRACTION_DIGITS.POWER), DISPLAY_UNITS.POWER);

export const formatPowerKw = (kw: number): string =>
  withUnit(formatFixed(kw, DISPLAY_FRACTION_DIGITS.POWER_KW), DISPLAY_UNITS.POWER_KW);

export const formatHashratePhs = (phs: number): string =>
  withUnit(formatFixed(phs, DISPLAY_FRACTION_DIGITS.HASHRATE), DISPLAY_UNITS.HASHRATE);

export const formatHashrateThs = (ths: number): string =>
  withUnit(formatFixed(ths, DISPLAY_FRACTION_DIGITS.HASHRATE_TH), DISPLAY_UNITS.HASHRATE_TH);

export const formatPowerW = (w: number): string =>
  withUnit(formatFixed(w, DISPLAY_FRACTION_DIGITS.POWER_W), DISPLAY_UNITS.POWER_W);

export const formatTemperatureC = (celsius: number): string =>
  withUnit(formatFixed(celsius, DISPLAY_FRACTION_DIGITS.TEMPERATURE), DISPLAY_UNITS.TEMPERATURE);

/** A whole percentage, with no space before the sign: "80%". */
export const formatPercent = (pct: number): string =>
  `${formatFixed(pct, 0)}${DISPLAY_UNITS.PERCENT}`;

/** A count with its noun, singular for exactly one: "1 container", "4 containers". */
export const formatCount = (count: number, singular: string, plural = `${singular}s`): string =>
  `${formatFixed(count, 0)} ${count === 1 ? singular : plural}`;
