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
        total={stats?.miners.total}
        online={stats?.miners.online}
        error={stats?.miners.error}
        offline={stats?.miners.offline}
      />
      <HeaderHashrateBox appPhs={stats?.hashratePhs} />
      <HeaderConsumptionBox valueMw={stats?.consumptionMw} />
      <HeaderEfficiencyBox valueWthS={stats?.efficiencyWPerThs} />
    </HeaderStatsBar>
  );
};
