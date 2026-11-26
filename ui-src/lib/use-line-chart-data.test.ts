// @vitest-environment jsdom
import type { IChartApi, LineChartCardData } from "@tetherto/mdk-react-devkit";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useLineChartData } from "./use-line-chart-data";

const DATA: LineChartCardData = {
  datasets: [{ label: "Power", borderColor: "orange", data: [{ x: 1_000, y: 5 }] }],
};

// Only `useLineChartData` reads the ref, and only to see whether it is set.
const isChart = (value: object): value is IChartApi => "addAreaSeries" in value;
const fakeChart = (): IChartApi => {
  const chart = { addAreaSeries: vi.fn<() => void>(), removeSeries: vi.fn<() => void>() };
  if (!isChart(chart)) throw new Error("not a chart");
  return chart;
};

describe("useLineChartData", () => {
  let frames: Map<number, FrameRequestCallback>;
  let nextFrame: number;
  const runFrame = () => {
    const pending = [...frames.values()];
    frames.clear();
    act(() => {
      for (const callback of pending) callback(0);
    });
  };

  beforeEach(() => {
    frames = new Map();
    nextFrame = 0;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      nextFrame += 1;
      frames.set(nextFrame, callback);
      return nextFrame;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("waits frame by frame for the chart, then hands the datasets over anew once", () => {
    const { result, rerender } = renderHook(({ data }) => useLineChartData(data), {
      initialProps: { data: DATA },
    });
    const before = result.current.data.datasets;
    expect(result.current.chartReady).toBe(false);
    expect(result.current.data).toEqual(DATA);
    expect(before).not.toBe(DATA.datasets);

    runFrame();
    expect(result.current.chartReady).toBe(false);
    expect(frames.size).toBe(1);

    result.current.chartRef.current = fakeChart();
    runFrame();

    expect(result.current.chartReady).toBe(true);
    expect(result.current.data.datasets).not.toBe(before);
    expect(result.current.data.datasets).toEqual(DATA.datasets);
    expect(frames.size).toBe(0);

    const ready = result.current.data;
    rerender({ data: DATA });
    expect(result.current.data).toBe(ready);
  });

  it("stops waiting on unmount", () => {
    const { unmount } = renderHook(() => useLineChartData(DATA));
    expect(frames.size).toBe(1);

    unmount();

    expect(frames.size).toBe(0);
  });
});
