import { useState } from "react";

import type { Miner } from "../../api/contract";
import { findMiner, type LayoutView, type PlacedMiner } from "./layout-shape";

export type SocketSelection = {
  /** The selected miner and its rack as the latest layout reports them; undefined when none is. */
  selected: PlacedMiner | undefined;
  isSelected: (miner: Miner) => boolean;
  onSelect: (miner: Miner) => void;
};

/**
 * The selected miner of a socket grid tab (Layout, Heatmap). The miner is read
 * from the latest layout, so the side panel follows the 30 s refresh, and it
 * clears itself if the miner leaves the container. Selecting it again clears it.
 */
export const useSocketSelection = (layout: LayoutView): SocketSelection => {
  const [selectedMinerId, setSelectedMinerId] = useState<string | undefined>(undefined);
  const selected = findMiner(layout, selectedMinerId);

  return {
    selected,
    isSelected: (miner) => miner.id === selected?.miner.id,
    onSelect: (miner) =>
      setSelectedMinerId((current) => (current === miner.id ? undefined : miner.id)),
  };
};
