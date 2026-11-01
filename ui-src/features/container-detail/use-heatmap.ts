import { useState } from "react";

import {
  DEFAULT_HEATMAP_METRIC,
  type HeatmapMetric,
  type HeatScale,
  heatScaleOf,
  socketHeatOf,
} from "./heatmap-shape";
import type { LayoutView } from "./layout-shape";
import type { SocketHeatOf } from "./socket-grid";

export type Heatmap = {
  metric: HeatmapMetric;
  onMetricChange: (metric: HeatmapMetric) => void;
  scale: HeatScale;
  /** Each socket's colour step and tile text, for `SocketGrid`. */
  heatOf: SocketHeatOf;
};

/** The heatmap's metric and the colour scale it spans across the container's readings. */
export const useHeatmap = (layout: LayoutView): Heatmap => {
  const [metric, setMetric] = useState<HeatmapMetric>(DEFAULT_HEATMAP_METRIC);
  const scale = heatScaleOf(layout.racks, metric);

  return {
    metric,
    onMetricChange: setMetric,
    scale,
    heatOf: (socket) => socketHeatOf(socket.miner, metric, scale),
  };
};
