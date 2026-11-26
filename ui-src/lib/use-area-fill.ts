import type { IChartApi, LineChartCardData } from "@tetherto/mdk-react-devkit";
import { type MutableRefObject, useEffect, useRef } from "react";

type AreaSeries = ReturnType<IChartApi["addAreaSeries"]>;
type AreaPoint = Parameters<AreaSeries["setData"]>[0][number];

/** The design's fill under the power line: the line's orange, fading to nothing at the axis. */
const FILL_TOP = "rgba(247, 147, 26, 0.35)";
const FILL_BOTTOM = "rgba(247, 147, 26, 0)";

/**
 * Fills the area under a line chart's first series. `LineChartCard` draws
 * lines only (MDK friction: no area option), so this adds an area series of
 * the same points to the chart the card hands back, under the card's line.
 * Times follow the devkit line chart's own: seconds, no timezone shift.
 */
export const useAreaFill = (
  chartRef: MutableRefObject<IChartApi | null>,
  chartReady: boolean,
  data: LineChartCardData,
  enabled: boolean,
): void => {
  // The series and the chart it was added to: a new chart (the card can
  // replace its own) gets a series of its own, never one from a disposed chart.
  const seriesRef = useRef<{ chart: IChartApi; series: AreaSeries } | null>(null);
  const points = data.datasets[0]?.data;

  useEffect(() => {
    const chart = chartRef.current;
    if (!enabled || !chartReady || chart === null || points === undefined) return;
    if (seriesRef.current?.chart !== chart) {
      seriesRef.current = {
        chart,
        series: chart.addAreaSeries({
          lineColor: "transparent",
          topColor: FILL_TOP,
          bottomColor: FILL_BOTTOM,
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
        }),
      };
    }
    seriesRef.current.series.setData(
      points.map(({ x, y }): AreaPoint => {
        // lightweight-charts brands its seconds type (UTCTimestamp); a whole
        // number of seconds is one, as the devkit's own series use.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        const time = Math.round(x / 1000) as AreaPoint["time"];
        return y === null ? { time } : { time, value: y };
      }),
    );
  }, [chartRef, chartReady, enabled, points]);

  useEffect(
    () => () => {
      const added = seriesRef.current;
      seriesRef.current = null;
      // The card may already have removed its chart, and the series with it.
      if (added !== null) {
        try {
          added.chart.removeSeries(added.series);
        } catch {
          // Nothing left to remove.
        }
      }
    },
    [],
  );
};
