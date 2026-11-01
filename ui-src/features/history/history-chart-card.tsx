import { ErrorCard, LineChartCard, type LineChartCardData } from "@tetherto/mdk-react-devkit";

import type { HistoryInterval } from "../../api/contract";
import { useLineChartData } from "../../lib/use-line-chart-data";
import {
  axisTimeFormatOf,
  fromChartTimeline,
  HISTORY_INTERVAL_OPTIONS,
  intervalOptionsFor,
  toChartTimeline,
} from "./history-intervals";
import type { HistoryView } from "./use-history";

const EMPTY_CHART: LineChartCardData = { datasets: [] };

type HistoryChartCardProps = {
  title: string;
  view: HistoryView;
  interval: HistoryInterval;
  onIntervalChange: (interval: HistoryInterval) => void;
  /**
   * The intervals the toggle offers; the others are left out (the devkit card
   * drops an option's `disabled` flag, so it cannot show them off). Default: all.
   */
  allowedIntervals?: readonly HistoryInterval[];
  /** Whether the shown window spans more than a day: the axis then labels the day too. */
  spansDays?: boolean;
};

/** A history series as a line chart card with the interval toggle and min / max / average footer. */
export const HistoryChartCard = ({
  title,
  view,
  interval,
  onIntervalChange,
  allowedIntervals,
  spansDays = false,
}: HistoryChartCardProps) => {
  const chart = useLineChartData(view.status === "ready" ? view.chart : EMPTY_CHART);
  if (view.status === "error")
    return <ErrorCard title={`Could not load ${title.toLowerCase()}`} error={view.message} />;

  const handleTimelineChange = (next: string) => {
    const nextInterval = fromChartTimeline(next);
    if (nextInterval !== undefined) onIntervalChange(nextInterval);
  };

  return (
    <LineChartCard
      title={title}
      data={chart.data}
      chartRef={chart.chartRef}
      isLoading={view.status === "loading"}
      timelineOptions={
        allowedIntervals === undefined
          ? HISTORY_INTERVAL_OPTIONS
          : intervalOptionsFor(allowedIntervals)
      }
      timeline={toChartTimeline(interval)}
      onTimelineChange={handleTimelineChange}
      chartProps={{ customDateFormat: axisTimeFormatOf(interval, spansDays) }}
      detailLegends
      minHeight={280}
    />
  );
};
