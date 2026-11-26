import {
  ErrorCard,
  HeaderConsumptionBox,
  HeaderEfficiencyBox,
  HeaderHashrateBox,
  HeaderMinersBox,
  HeaderStatsBar,
} from "@tetherto/mdk-react-devkit";

import type { SiteSummaryView } from "./use-site-summary";

/**
 * The devkit's miners and hashrate boxes always draw a pool-side reading next to
 * the app's. This app reads no pools, so the class hides those fields rather
 * than show them empty (styles.css).
 */
const NO_POOL_CLASSES = {
  MINERS: "op-centre-lite-miners-box--no-pool",
  HASHRATE: "op-centre-lite-hashrate-box--no-pool",
} as const;

/**
 * Site-wide stats: miners, hashrate, consumption and efficiency. While loading,
 * every box renders `-`.
 */
export const SiteStatsStrip = ({ view }: { view: SiteSummaryView }) => {
  if (view.status === "error")
    return <ErrorCard title="Could not load the site summary" error={view.message} />;
  const stats = view.status === "ready" ? view.stats : undefined;

  return (
    <HeaderStatsBar>
      <HeaderMinersBox
        className={NO_POOL_CLASSES.MINERS}
        total={stats?.miners.total}
        appTotal={stats?.miners.total}
        online={stats?.miners.online}
        error={stats?.miners.error}
        offline={stats?.miners.offline}
      />
      <HeaderHashrateBox className={NO_POOL_CLASSES.HASHRATE} appPhs={stats?.hashratePhs} />
      <HeaderConsumptionBox valueMw={stats?.consumptionMw} />
      <HeaderEfficiencyBox valueWthS={stats?.efficiencyWPerThs} />
    </HeaderStatsBar>
  );
};
