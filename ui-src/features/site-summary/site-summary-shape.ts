import type { SiteSummary } from "../../api/contract";
import { thsToPhs, toEfficiencyWPerThs, wToMw } from "../../lib/units";

/** Site totals in the units the stats boxes display. */
export type SiteStats = {
  miners: SiteSummary["miners"];
  hashratePhs: number;
  consumptionMw: number;
  /** W per TH/s; undefined while hashrate is zero. */
  efficiencyWPerThs: number | undefined;
};

/**
 * Shapes `GET /api/site/summary` for the stats strip: TH/s to PH/s, W to MW, and
 * efficiency as W per TH/s. A site with no hashrate has no efficiency, so it
 * stays undefined (the box shows `-`) instead of dividing by zero.
 */
export const toSiteStats = (summary: SiteSummary): SiteStats => ({
  miners: summary.miners,
  hashratePhs: thsToPhs(summary.hashrateThs),
  consumptionMw: wToMw(summary.powerW),
  efficiencyWPerThs: toEfficiencyWPerThs(summary.powerW, summary.hashrateThs),
});
