import {
  ErrorCard,
  LineChartCard,
  type LineChartCardData,
  Loader,
} from "@tetherto/mdk-react-devkit";
import { useMemo } from "react";

import { useAreaFill } from "../../lib/use-area-fill";
import { useLineChartData } from "../../lib/use-line-chart-data";
import type { HistoryToggle } from "./history-intervals";
import type { HistoryView } from "./use-history";

const EMPTY_CHART: LineChartCardData = { datasets: [] };

/**
 * The design's legend keys: a filled square in the series colour, or a dash
 * for a dashed line (nominal). The devkit's own key is an outlined box.
 */
const withLegendKeys = (data: LineChartCardData): LineChartCardData => ({
  ...data,
  datasets: data.datasets.map((dataset) => ({
    ...dataset,
    legendIcon: (
      <span
        className="op-centre-lite-legend-key"
        data-line={dataset.lineStyle ?? "solid"}
        style={{ color: dataset.borderColor }}
      />
    ),
  })),
});

type HistoryChartCardProps = {
  title: string;
  view: HistoryView;
  /** The window or bucket toggle; a chart whose window is picked elsewhere has none. */
  toggle?: HistoryToggle;
  /** The time axis labels (date-fns pattern). */
  axisFormat: string;
  /** Fill the area under the first series, as the design draws power. */
  fill?: boolean;
};

/**
 * A history series as a line chart card with its toggle and min / max / average
 * footer. The chart fits the whole series it is given: the series carries every
 * bucket of its window (empty ones as gaps), so the axis spans the window.
 */
export const HistoryChartCard = ({
  title,
  view,
  toggle,
  axisFormat,
  fill = false,
}: HistoryChartCardProps) => {
  const chart = useLineChartData(view.status === "ready" ? view.chart : EMPTY_CHART);
  useAreaFill(chart.chartRef, chart.chartReady, chart.data, fill);
  const data = useMemo(() => withLegendKeys(chart.data), [chart.data]);
  if (view.status === "error")
    return <ErrorCard title={`Could not load ${title.toLowerCase()}`} error={view.message} />;

  // A new window keeps the previous chart on screen while it loads: it dims
  // under a loader. The card's own `isLoading` swaps the chart out, and the
  // chart it remounts afterwards does not draw, so it is for the first load only.
  const stale = view.status === "ready" && view.stale;

  return (
    <div className="op-centre-lite-history" data-stale={stale} aria-busy={stale}>
      {stale ? <Loader className="op-centre-lite-history__loader" /> : null}
      <LineChartCard
        title={title}
        data={data}
        chartRef={chart.chartRef}
        isLoading={view.status === "loading"}
        timelineOptions={toggle?.options}
        timeline={toggle?.value}
        onTimelineChange={toggle?.onChange}
        chartProps={{ customDateFormat: axisFormat, disableAutoRange: true }}
        detailLegends
        minHeight={280}
      />
    </div>
  );
};
