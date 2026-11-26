import { useState } from "react";

import { Page } from "../../components/page";
import { HistoryChartCard } from "../history/history-chart-card";
import { LIVE_AXIS_FORMAT, liveToggle } from "../history/history-intervals";
import { DEFAULT_HISTORY_SPAN, type HistorySpan, toLiveQuery } from "../history/history-window";
import { useHistory } from "../history/use-history";

/** Site hash rate against nominal, and site power consumption, each over its own window. */
export const DashboardPage = () => {
  const [hashrateSpan, setHashrateSpan] = useState<HistorySpan>(DEFAULT_HISTORY_SPAN);
  const [powerSpan, setPowerSpan] = useState<HistorySpan>(DEFAULT_HISTORY_SPAN);
  const hashrate = useHistory(toLiveQuery("hashrate", hashrateSpan));
  const power = useHistory(toLiveQuery("power", powerSpan));

  return (
    <Page title="Dashboard">
      <div className="op-centre-lite-dashboard">
        <HistoryChartCard
          title="Hash Rate"
          view={hashrate}
          toggle={liveToggle(hashrateSpan, setHashrateSpan)}
          axisFormat={LIVE_AXIS_FORMAT}
        />
        <HistoryChartCard
          title="Power Consumption"
          view={power}
          toggle={liveToggle(powerSpan, setPowerSpan)}
          axisFormat={LIVE_AXIS_FORMAT}
          fill
        />
      </div>
    </Page>
  );
};
