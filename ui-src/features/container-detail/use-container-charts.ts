import type { DateRange } from "@tetherto/mdk-react-devkit";
import { useEffect, useState } from "react";

import type { HistoryMetric } from "../../api/contract";
import {
  defaultRangeWindow,
  type HistoryScope,
  rangeIntervalOf,
  type RangeWindow,
  spansDays,
  toRangeQuery,
  toRangeWindow,
} from "../history/history-window";
import { type HistoryView, useHistory } from "../history/use-history";
import type { LayoutView } from "./layout-shape";

/** One chart of the tab: its series and how its axis labels time. */
export type ContainerChart = { view: HistoryView; axisFormat: string };

export type ContainerCharts = {
  rackId: string | undefined;
  onRackChange: (rackId: string | undefined) => void;
  /** The days the charts show, for the date range button. */
  range: DateRange;
  /** A full range sets the days; clearing it goes back to the last seven. */
  onRangeChange: (range: DateRange | undefined) => void;
  hashrate: ContainerChart;
  power: ContainerChart;
};

// A day-long window labels hours; a longer one labels days, as the design does.
const DAY_AXIS_FORMAT = "dd/MM";
const HOUR_AXIS_FORMAT = "HH:mm";

const useChart = (
  metric: HistoryMetric,
  historyWindow: RangeWindow,
  scope: HistoryScope,
): ContainerChart => ({
  view: useHistory(toRangeQuery(metric, rangeIntervalOf(historyWindow), historyWindow, scope)),
  axisFormat: spansDays(historyWindow) ? DAY_AXIS_FORMAT : HOUR_AXIS_FORMAT,
});

const rangeOfWindow = (historyWindow: RangeWindow): DateRange => ({
  from: new Date(historyWindow.start),
  to: new Date(historyWindow.end),
});

/** A picked range and the window it reads. */
type PickedRange = { range: DateRange; historyWindow: RangeWindow };

/** A second past the window's end, so the next window has begun. */
const ROLLOVER_GRACE_MS = 1000;

/**
 * The Charts tab's state: which rack and which days, and the two history reads
 * that follow them. Before a range is picked it shows the last seven days up
 * to now, still filling, and moves on a day at midnight so a page left open
 * keeps filling; a picked range ends at the end of its last day, or now for
 * today.
 */
export const useContainerCharts = (layout: LayoutView): ContainerCharts => {
  const [rackId, setRackId] = useState<string | undefined>(undefined);
  const [picked, setPicked] = useState<PickedRange | undefined>(undefined);
  // The picker's first click, shown until the second completes the range.
  const [draft, setDraft] = useState<DateRange | undefined>(undefined);
  const [lastDays, setLastDays] = useState<RangeWindow>(() => defaultRangeWindow(Date.now()));

  useEffect(() => {
    if (picked !== undefined) return undefined;
    const timer = setTimeout(
      () => setLastDays(defaultRangeWindow(Date.now())),
      Math.max(0, lastDays.end - Date.now()) + ROLLOVER_GRACE_MS,
    );
    return () => clearTimeout(timer);
  }, [picked, lastDays]);

  const historyWindow = picked?.historyWindow ?? lastDays;
  const scope = { containerId: layout.container.id, rackId };
  const hashrate = useChart("hashrate", historyWindow, scope);
  const power = useChart("power", historyWindow, scope);

  const onRangeChange = (next: DateRange | undefined) => {
    if (next?.from !== undefined && next.to !== undefined) {
      setPicked({ range: next, historyWindow: toRangeWindow(next.from, next.to, Date.now()) });
      setDraft(undefined);
    } else if (next === undefined) {
      setPicked(undefined);
      setDraft(undefined);
      setLastDays(defaultRangeWindow(Date.now()));
    } else {
      setDraft(next);
    }
  };

  return {
    rackId,
    onRackChange: setRackId,
    range: draft ?? picked?.range ?? rangeOfWindow(lastDays),
    onRangeChange,
    hashrate,
    power,
  };
};
