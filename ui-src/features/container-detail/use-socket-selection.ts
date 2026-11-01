import { useState } from "react";

import type { Miner } from "../../api/contract";
import { findMiner, type LayoutView } from "./layout-shape";
import { DEFAULT_ZOOM, type Zoom } from "./socket-grid";

export type SocketSelection = {
  zoom: Zoom;
  onZoomChange: (zoom: Zoom) => void;
  /** The selected miner as the latest layout reports it; undefined when none is. */
  selected: Miner | undefined;
  onSelect: (miner: Miner) => void;
  onClear: VoidFunction;
};

/**
 * The zoom and the selected miner of a socket grid tab (Layout, Heatmap). The
 * miner is read from the latest layout, so its panel follows the 30 s refresh,
 * and it clears itself if the miner leaves the container.
 */
export const useSocketSelection = (layout: LayoutView): SocketSelection => {
  const [zoom, setZoom] = useState<Zoom>(DEFAULT_ZOOM);
  const [selectedMinerId, setSelectedMinerId] = useState<string | undefined>(undefined);

  return {
    zoom,
    onZoomChange: setZoom,
    selected: findMiner(layout, selectedMinerId),
    onSelect: (miner) => setSelectedMinerId(miner.id),
    onClear: () => setSelectedMinerId(undefined),
  };
};
