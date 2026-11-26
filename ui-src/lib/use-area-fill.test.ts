// @vitest-environment jsdom
import type { IChartApi, LineChartCardData } from "@tetherto/mdk-react-devkit";
import { renderHook } from "@testing-library/react";
import type { MutableRefObject } from "react";
import { describe, expect, it, type Mock, vi } from "vitest";

import { useAreaFill } from "./use-area-fill";

type FakeSeries = { setData: Mock<(data: unknown) => void> };
type FakeChart = {
  addAreaSeries: Mock<() => FakeSeries>;
  removeSeries: Mock<(series: FakeSeries) => void>;
};

// The hook calls only `addAreaSeries` and `removeSeries` on the chart.
const isChart = (value: object): value is IChartApi =>
  "addAreaSeries" in value && "removeSeries" in value;

const createChart = () => {
  const series: FakeSeries[] = [];
  const fake: FakeChart = {
    addAreaSeries: vi.fn<() => FakeSeries>(() => {
      const added = { setData: vi.fn<(data: unknown) => void>() };
      series.push(added);
      return added;
    }),
    removeSeries: vi.fn<(series: FakeSeries) => void>(),
  };
  if (!isChart(fake)) throw new Error("not a chart");
  const chart: IChartApi = fake;
  return { fake, chart, series };
};

const dataOf = (points: Array<{ x: number; y: number | null }>): LineChartCardData => ({
  datasets: [{ borderColor: "orange", data: points }],
});

type Props = {
  chartRef: MutableRefObject<IChartApi | null>;
  ready: boolean;
  data: LineChartCardData;
  enabled: boolean;
};
const render = (initialProps: Props) =>
  renderHook(
    ({ chartRef, ready, data, enabled }: Props) => useAreaFill(chartRef, ready, data, enabled),
    { initialProps },
  );

describe("useAreaFill", () => {
  it("adds one area series under the line, with the points in seconds and gaps kept", () => {
    const { fake, chart, series } = createChart();
    const chartRef = { current: chart };

    render({
      chartRef,
      ready: true,
      enabled: true,
      data: dataOf([
        { x: 1_000, y: 5 },
        { x: 2_400, y: null },
      ]),
    });

    expect(fake.addAreaSeries).toHaveBeenCalledTimes(1);
    expect(fake.addAreaSeries).toHaveBeenCalledWith(
      expect.objectContaining({ lineColor: "transparent", lastValueVisible: false }),
    );
    expect(series[0]?.setData).toHaveBeenCalledWith([{ time: 1, value: 5 }, { time: 2 }]);
  });

  it("waits for the chart, for data and for being enabled", () => {
    const { fake, chart } = createChart();
    const data = dataOf([{ x: 1_000, y: 1 }]);
    const { rerender } = render({ chartRef: { current: null }, ready: true, enabled: true, data });
    rerender({ chartRef: { current: chart }, ready: false, enabled: true, data });
    rerender({ chartRef: { current: chart }, ready: true, enabled: false, data });
    rerender({ chartRef: { current: chart }, ready: true, enabled: true, data: { datasets: [] } });

    expect(fake.addAreaSeries).not.toHaveBeenCalled();
  });

  it("reuses its series for new data, and adds a new one to a new chart", () => {
    const first = createChart();
    const chartRef: MutableRefObject<IChartApi | null> = { current: first.chart };
    const { rerender } = render({
      chartRef,
      ready: true,
      enabled: true,
      data: dataOf([{ x: 1_000, y: 1 }]),
    });

    rerender({ chartRef, ready: true, enabled: true, data: dataOf([{ x: 2_000, y: 2 }]) });
    expect(first.fake.addAreaSeries).toHaveBeenCalledTimes(1);
    expect(first.series[0]?.setData).toHaveBeenLastCalledWith([{ time: 2, value: 2 }]);

    const second = createChart();
    chartRef.current = second.chart;
    rerender({ chartRef, ready: true, enabled: true, data: dataOf([{ x: 3_000, y: 3 }]) });
    expect(second.fake.addAreaSeries).toHaveBeenCalledTimes(1);
    expect(second.series[0]?.setData).toHaveBeenCalledWith([{ time: 3, value: 3 }]);
  });

  it("removes its series on unmount", () => {
    const { fake, chart, series } = createChart();
    const { unmount } = render({
      chartRef: { current: chart },
      ready: true,
      enabled: true,
      data: dataOf([{ x: 1_000, y: 1 }]),
    });

    unmount();

    expect(fake.removeSeries).toHaveBeenCalledWith(series[0]);
  });

  it("tolerates a chart that is already gone on unmount", () => {
    const { fake, chart } = createChart();
    fake.removeSeries.mockImplementation(() => {
      throw new Error("Object is disposed");
    });
    const { unmount } = render({
      chartRef: { current: chart },
      ready: true,
      enabled: true,
      data: dataOf([{ x: 1_000, y: 1 }]),
    });

    expect(() => unmount()).not.toThrow();
  });

  it("removes nothing when it never added a series", () => {
    const { fake, chart } = createChart();
    const { unmount } = render({
      chartRef: { current: chart },
      ready: true,
      enabled: false,
      data: dataOf([{ x: 1_000, y: 1 }]),
    });

    unmount();

    expect(fake.removeSeries).not.toHaveBeenCalled();
  });
});
