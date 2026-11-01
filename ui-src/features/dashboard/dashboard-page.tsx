import { useState } from "react";

import type { HistoryInterval } from "../../api/contract";
import { Page } from "../../components/page";
import { HistoryChartCard } from "../history/history-chart-card";
import { DEFAULT_HISTORY_INTERVAL } from "../history/history-intervals";
import { useHistory } from "../history/use-history";

/** Site hash rate against nominal, and site power consumption, each with its own interval. */
export const DashboardPage = () => {
  const [hashrateInterval, setHashrateInterval] =
    useState<HistoryInterval>(DEFAULT_HISTORY_INTERVAL);
  const [powerInterval, setPowerInterval] = useState<HistoryInterval>(DEFAULT_HISTORY_INTERVAL);
  const hashrate = useHistory({ metric: "hashrate", interval: hashrateInterval });
  const power = useHistory({ metric: "power", interval: powerInterval });

  return (
    <Page title="Dashboard">
      <div className="op-centre-lite-dashboard">
        <HistoryChartCard
          title="Hash Rate"
          view={hashrate}
          interval={hashrateInterval}
          onIntervalChange={setHashrateInterval}
        />
        <HistoryChartCard
          title="Power Consumption"
          view={power}
          interval={powerInterval}
          onIntervalChange={setPowerInterval}
        />
      </div>
    </Page>
  );
};
