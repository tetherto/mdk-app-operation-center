import type { PowerMeters } from "../../api/contract";
import { thsToPhs, toEfficiencyWPerThs, wToKw, wToMw } from "../../lib/units";

/** The breakdown cycles through this many colours (styles.css), one per meter. */
export const SERIES_COLOR_COUNT = 6;

export type MeterCard = {
  id: string;
  name: string;
  containerName: string;
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
  powerKw: number;
  /** Share of the site's total consumption, 0 to 100. */
  sharePct: number;
  /** Index into the breakdown colours; undefined for the unmetered rest. */
  colorIndex: number | undefined;
};

export type SiteEfficiencyView = {
  /** Site meter total per TH/s: everything the site draws, cooling included. */
  siteEfficiencyWPerThs: number | undefined;
  /** The miners' own power per TH/s. */
  miningEfficiencyWPerThs: number | undefined;
  totalPowerMw: number;
  meters: MeterCard[];
  breakdown: BreakdownSlice[];
};

export const UNMETERED_SLICE_ID = "unmetered";

const shareOf = (powerW: number, totalW: number): number =>
  totalW > 0 ? (powerW / totalW) * 100 : 0;

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

  const breakdown: BreakdownSlice[] = data.meters.map((meter, index) => ({
    id: meter.id,
    name: meter.name,
    powerKw: wToKw(meter.powerW),
    sharePct: shareOf(meter.powerW, shareBaseW),
    colorIndex: index % SERIES_COLOR_COUNT,
  }));
  if (unmeteredW > 0) {
    breakdown.push({
      id: UNMETERED_SLICE_ID,
      name: "Not metered",
      powerKw: wToKw(unmeteredW),
      sharePct: shareOf(unmeteredW, shareBaseW),
      colorIndex: undefined,
    });
  }

  return {
    siteEfficiencyWPerThs: toEfficiencyWPerThs(data.siteMeterPowerW, data.hashrateThs),
    miningEfficiencyWPerThs: toEfficiencyWPerThs(data.minersPowerW, data.hashrateThs),
    totalPowerMw: wToMw(totalW),
    meters: data.meters.map((meter) => ({
      id: meter.id,
      name: meter.name,
      containerName: containerNames.get(meter.containerId) ?? meter.containerId,
      efficiencyWPerThs: toEfficiencyWPerThs(meter.powerW, meter.hashrateThs),
      powerKw: wToKw(meter.powerW),
      hashratePhs: thsToPhs(meter.hashrateThs),
      miners: meter.miners,
    })),
    breakdown,
  };
};
