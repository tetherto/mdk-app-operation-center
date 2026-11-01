import { ErrorCard, Loader, SingleStatCard } from "@tetherto/mdk-react-devkit";

import { FALLBACK } from "../../lib/constants";
import { DISPLAY_FRACTION_DIGITS, DISPLAY_UNITS, formatFixed } from "../../lib/units";
import { useSiteSummary } from "./use-site-summary";

/** The site totals as compact cards on the dashboard's Home (too narrow for the stats strip). */
export const SiteSummaryHomePanel = () => {
  const view = useSiteSummary();
  if (view.status === "loading") return <Loader />;
  if (view.status === "error")
    return <ErrorCard title="Could not load the site summary" error={view.message} />;

  const { miners, hashratePhs, consumptionMw, efficiencyWPerThs } = view.stats;
  const efficiency =
    efficiencyWPerThs === undefined
      ? FALLBACK
      : formatFixed(efficiencyWPerThs, DISPLAY_FRACTION_DIGITS.EFFICIENCY);

  return (
    <div className="op-centre-lite-home-panel">
      <SingleStatCard name="Miners online" value={`${miners.online} / ${miners.total}`} />
      <SingleStatCard
        name="Hashrate"
        value={formatFixed(hashratePhs, DISPLAY_FRACTION_DIGITS.HASHRATE)}
        unit={DISPLAY_UNITS.HASHRATE}
      />
      <SingleStatCard
        name="Consumption"
        value={formatFixed(consumptionMw, DISPLAY_FRACTION_DIGITS.POWER)}
        unit={DISPLAY_UNITS.POWER}
      />
      <SingleStatCard name="Efficiency" value={efficiency} unit={DISPLAY_UNITS.EFFICIENCY} />
    </div>
  );
};
