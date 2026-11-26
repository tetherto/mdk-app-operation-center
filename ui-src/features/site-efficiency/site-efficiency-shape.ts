import type { PowerMeters } from "../../api/contract";
import { thsToPhs, toEfficiencyWPerThs, wToKw, wToMw } from "../../lib/units";

/** The meters cycle through this many colours (styles.css), one per meter. */
export const SERIES_COLOR_COUNT = 6;

export type MeterCard = {
  id: string;
  name: string;
  containerName: string;
  /** Index into the meter colours: the card's swatch matches its breakdown slice. */
  colorIndex: number;
  /** W per TH/s; undefined while its miners have no hashrate. */
  efficiencyWPerThs: number | undefined;
  powerKw: number;
  hashratePhs: number;
  miners: number;
};

/** One slice of the consumption breakdown: a meter, or what no meter measures. */
export type BreakdownSlice = {
  id: string;
  name: string;
  /** The container the meter measures; undefined for the unmetered rest. */
  containerName: string | undefined;
  powerKw: number;
  /** Share of the site's total consumption, 0 to 100. */
  sharePct: number;
  /** Index into the breakdown colours; undefined for the unmetered rest. */
  colorIndex: number | undefined;
};

/** A row of the breakdown table: the site meter's total first, then each slice. */
export type BreakdownRow = {
  id: string;
  /** "meter · container", or the slice's own name when it measures no container. */
  source: string;
  powerKw: number;
  sharePct: number;
  /** The swatch colour: a meter's index, the unmetered rest, or the site total. */
  series: string;
};

export const SITE_TOTAL_ROW_ID = "site-total";

export type SiteEfficiencyView = {
  /** Site meter total per TH/s: everything the site draws, cooling included. */
  siteEfficiencyWPerThs: number | undefined;
  /** The miners' own power per TH/s. */
  miningEfficiencyWPerThs: number | undefined;
  totalPowerMw: number;
  meters: MeterCard[];
  breakdown: BreakdownSlice[];
  /** The breakdown table: the site meter's total, then each slice. */
  breakdownRows: BreakdownRow[];
};

export const UNMETERED_SLICE_ID = "unmetered";

const shareOf = (powerW: number, totalW: number): number =>
  totalW > 0 ? (powerW / totalW) * 100 : 0;

const sourceOf = (slice: BreakdownSlice): string =>
  slice.containerName === undefined ? slice.name : `${slice.name} · ${slice.containerName}`;

/**
 * The breakdown table's rows. The site meter's own share is of the same base as
 * the slices', so the column stays consistent: 100% normally, and below it when
 * the meters add up to more than a lagging site meter.
 */
const toBreakdownRows = (
  slices: BreakdownSlice[],
  siteMeterW: number,
  shareBaseW: number,
): BreakdownRow[] => [
  {
    id: SITE_TOTAL_ROW_ID,
    source: "Site meter (total)",
    powerKw: wToKw(siteMeterW),
    sharePct: shareOf(siteMeterW, shareBaseW),
    series: "total",
  },
  ...slices.map((slice) => ({
    id: slice.id,
    source: sourceOf(slice),
    powerKw: slice.powerKw,
    sharePct: slice.sharePct,
    series: String(slice.colorIndex ?? "rest"),
  })),
];

/**
 * Shapes `GET /api/power-meters` for the Site Efficiency page. Shares are of
 * the site meter total; what the container meters do not cover shows as its
 * own "Not metered" slice, so the slices always add up to the total. The
 * readings are taken apart, so the meters can add up to more than a lagging
 * site meter: then the shares are of the meters' sum, so they never pass 100%.
 */
export const toSiteEfficiencyView = (
  data: PowerMeters,
  containerNames: ReadonlyMap<string, string>,
): SiteEfficiencyView => {
  const totalW = data.siteMeterPowerW;
  const meteredW = data.meters.reduce((sum, meter) => sum + meter.powerW, 0);
  const unmeteredW = totalW - meteredW;
  const shareBaseW = Math.max(totalW, meteredW);

  const containerNameOf = (containerId: string) => containerNames.get(containerId) ?? containerId;

  const breakdown: BreakdownSlice[] = data.meters.map((meter, index) => ({
    id: meter.id,
    name: meter.name,
    containerName: containerNameOf(meter.containerId),
    powerKw: wToKw(meter.powerW),
    sharePct: shareOf(meter.powerW, shareBaseW),
    colorIndex: index % SERIES_COLOR_COUNT,
  }));
  if (unmeteredW > 0) {
    breakdown.push({
      id: UNMETERED_SLICE_ID,
      name: "Not metered",
      containerName: undefined,
      powerKw: wToKw(unmeteredW),
      sharePct: shareOf(unmeteredW, shareBaseW),
      colorIndex: undefined,
    });
  }

  return {
    siteEfficiencyWPerThs: toEfficiencyWPerThs(data.siteMeterPowerW, data.hashrateThs),
    miningEfficiencyWPerThs: toEfficiencyWPerThs(data.minersPowerW, data.hashrateThs),
    totalPowerMw: wToMw(totalW),
    meters: data.meters.map((meter, index) => ({
      id: meter.id,
      name: meter.name,
      containerName: containerNameOf(meter.containerId),
      colorIndex: index % SERIES_COLOR_COUNT,
      efficiencyWPerThs: toEfficiencyWPerThs(meter.powerW, meter.hashrateThs),
      powerKw: wToKw(meter.powerW),
      hashratePhs: thsToPhs(meter.hashrateThs),
      miners: meter.miners,
    })),
    breakdown,
    breakdownRows: toBreakdownRows(breakdown, totalW, shareBaseW),
  };
};
