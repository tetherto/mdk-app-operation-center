import type { DateRange } from "@tetherto/mdk-react-devkit";
import { useState } from "react";

import type { HistoryInterval, HistoryMetric } from "../../api/contract";
import { DEFAULT_HISTORY_INTERVAL } from "../history/history-intervals";
import {
  fitInterval,
  type HistoryWindow,
  intervalsFor,
  RECENT_WINDOW,
  spansDays,
  toHistoryQuery,
  toRangeWindow,
} from "../history/history-window";
import { type HistoryView, useHistory } from "../history/use-history";
import type { LayoutView } from "./layout-shape";

/** One chart of the tab: its series and the interval it shows. */
export type ContainerChart = {
  view: HistoryView;
  /** The picked interval, or the finest that fits the window when it does not. */
  interval: HistoryInterval;
  onIntervalChange: (interval: HistoryInterval) => void;
};

export type ContainerCharts = {
  rackId: string | undefined;
  onRackChange: (rackId: string | undefined) => void;
  range: DateRange | undefined;
  /** A full range fixes the window; anything else is live. */
  onRangeChange: (range: DateRange | undefined) => void;
  isLive: boolean;
  allowedIntervals: readonly HistoryInterval[];
  spansDays: boolean;
  hashrate: ContainerChart;
  power: ContainerChart;
};

const useChart = (
  metric: HistoryMetric,
  historyWindow: HistoryWindow,
  scope: { containerId: string; rackId: string | undefined },
): ContainerChart => {
  const [picked, setPicked] = useState<HistoryInterval>(DEFAULT_HISTORY_INTERVAL);
  const interval = fitInterval(historyWindow, picked);
  const view = useHistory(toHistoryQuery(metric, interval, historyWindow, scope));
  return { view, interval, onIntervalChange: setPicked };
};

/**
 * The Charts tab's state: which rack, which window, each chart's interval, and
 * the two history reads that follow them.
 */
export const useContainerCharts = (layout: LayoutView): ContainerCharts => {
  const [rackId, setRackId] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [historyWindow, setHistoryWindow] = useState<HistoryWindow>(RECENT_WINDOW);

  const scope = { containerId: layout.container.id, rackId };
  const hashrate = useChart("hashrate", historyWindow, scope);
  const power = useChart("power", historyWindow, scope);

  const onRangeChange = (next: DateRange | undefined) => {
    setRange(next);
    setHistoryWindow(
      next?.from !== undefined && next.to !== undefined
        ? toRangeWindow(next.from, next.to, Date.now())
        : RECENT_WINDOW,
    );
  };

  return {
    rackId,
    onRackChange: setRackId,
    range,
    onRangeChange,
    isLive: historyWindow.kind === "recent",
    allowedIntervals: intervalsFor(historyWindow),
    spansDays: spansDays(historyWindow),
    hashrate,
    power,
  };
};
