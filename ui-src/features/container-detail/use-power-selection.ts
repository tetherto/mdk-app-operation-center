import { useState } from "react";

import type { Miner } from "../../api/contract";
import type { LayoutView } from "./layout-shape";
import { selectableMiners, selectedMinersOf } from "./power-adjustment-shape";

export type PowerSelection = {
  /** The picked miners as the latest layout reports them, in layout order. */
  miners: Miner[];
  ids: ReadonlySet<string>;
  onToggle: (miner: Miner) => void;
  onSelectAll: VoidFunction;
  onClear: VoidFunction;
  /** How many miners Select all would pick. */
  selectableCount: number;
};

/** The miners picked on the Power Adjustment grid: one click adds a miner, another removes it. */
export const usePowerSelection = (layout: LayoutView): PowerSelection => {
  const [picked, setPicked] = useState<ReadonlySet<string>>(() => new Set());
  const miners = selectedMinersOf(layout, picked);

  const onToggle = (miner: Miner) =>
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(miner.id)) next.delete(miner.id);
      else next.add(miner.id);
      return next;
    });

  return {
    miners,
    ids: new Set(miners.map((miner) => miner.id)),
    onToggle,
    onSelectAll: () => setPicked(new Set(selectableMiners(layout).map((miner) => miner.id))),
    onClear: () => setPicked(new Set()),
    selectableCount: selectableMiners(layout).length,
  };
};
