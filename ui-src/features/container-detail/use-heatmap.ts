import { useState } from "react";

import {
  DEFAULT_HEATMAP_METRIC,
  type HeatmapMetric,
  type HeatScale,
  heatScaleOf,
  socketHeatOf,
} from "./heatmap-shape";
import type { LayoutSocket, LayoutView } from "./layout-shape";
import type { SocketFace } from "./socket-grid";

export type Heatmap = {
  metric: HeatmapMetric;
  onMetricChange: (metric: HeatmapMetric) => void;
  scale: HeatScale;
  /** Each socket's colour and value, for the grid. */
  faceOf: (socket: LayoutSocket) => SocketFace | undefined;
};

/** The heatmap's metric and the colour scale its readings fall on. */
export const useHeatmap = (layout: LayoutView): Heatmap => {
  const [metric, setMetric] = useState<HeatmapMetric>(DEFAULT_HEATMAP_METRIC);
  const scale = heatScaleOf(layout.racks, metric);

  return {
    metric,
    onMetricChange: setMetric,
    scale,
    faceOf: ({ miner }) => {
      if (miner === null) return undefined;
      const heat = socketHeatOf(miner, metric, scale);
      return { lines: [heat.label], heat: heat.color };
    },
  };
};
