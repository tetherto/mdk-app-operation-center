import { useState } from "react";

import type { LayoutView } from "./layout-shape";
import { PowerAdjustmentPanel } from "./power-adjustment-panel";
import { isSelectableMiner } from "./power-adjustment-shape";
import { DEFAULT_ZOOM, SocketGrid, type Zoom } from "./socket-grid";
import { SocketLegend } from "./socket-legend";
import { usePowerSelection } from "./use-power-selection";
import { ZoomControls } from "./zoom-controls";

type PowerAdjustmentTabProps = { layout: LayoutView };

/** Pick miners on the socket grid and set their power percentage together. */
export const PowerAdjustmentTab = ({ layout }: PowerAdjustmentTabProps) => {
  const [zoom, setZoom] = useState<Zoom>(DEFAULT_ZOOM);
  const selection = usePowerSelection(layout);

  return (
    <div className="op-centre-lite-layout">
      <div className="op-centre-lite-layout__toolbar">
        <SocketLegend stateCounts={layout.stateCounts} />
        <ZoomControls zoom={zoom} onZoomChange={setZoom} />
      </div>
      <div className="op-centre-lite-layout__body">
        <SocketGrid
          racks={layout.racks}
          zoom={zoom}
          selectedMinerId={undefined}
          selectedMinerIds={selection.ids}
          onSelect={(miner) => {
            if (isSelectableMiner(miner)) selection.onToggle(miner);
          }}
        />
        <PowerAdjustmentPanel selection={selection} />
      </div>
    </div>
  );
};
