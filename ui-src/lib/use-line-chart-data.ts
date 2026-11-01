import type { IChartApi, LineChartCardData } from "@tetherto/mdk-react-devkit";
import { type MutableRefObject, useEffect, useMemo, useRef, useState } from "react";

/**
 * Hands `LineChartCard` its data in a way that survives its lazy chart creation.
 *
 * The devkit's line chart loads lightweight-charts with a dynamic import and
 * creates the chart and its series only once that resolves, in a re-render of
 * the chart component alone. Its effect that sets series data runs only when
 * `data.datasets` changes identity, so data that was already there when the
 * chart mounted never reaches the new series and the chart stays empty.
 *
 * This waits (one animation frame at a time) until the chart exists, then gives
 * the datasets a new identity once, so the chart sets them. Remove it when the
 * devkit re-applies data after the chart is created.
 */
export const useLineChartData = (
  data: LineChartCardData,
): { data: LineChartCardData; chartRef: MutableRefObject<IChartApi | null> } => {
  const chartRef = useRef<IChartApi | null>(null);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    if (chartReady) return undefined;
    let frame = 0;
    const waitForChart = () => {
      if (chartRef.current === null) frame = requestAnimationFrame(waitForChart);
      else setChartReady(true);
    };
    frame = requestAnimationFrame(waitForChart);
    return () => cancelAnimationFrame(frame);
  }, [chartReady]);

  const handedOver = useMemo(
    () => ({ ...data, datasets: [...data.datasets] }),
    // `chartReady` is a dependency on purpose: flipping it re-creates `datasets`.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [data, chartReady],
  );
  return { data: handedOver, chartRef };
};
