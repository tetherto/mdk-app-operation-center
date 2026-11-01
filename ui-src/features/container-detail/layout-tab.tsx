import type { LayoutView } from "./layout-shape";
import { MinerPanel } from "./miner-panel";
import { SocketGrid } from "./socket-grid";
import { SocketLegend } from "./socket-legend";
import { useSocketSelection } from "./use-socket-selection";
import { ZoomControls } from "./zoom-controls";

type LayoutTabProps = { layout: LayoutView };

/** The container's racks as a socket grid, with a legend, zoom and the selected miner's panel. */
export const LayoutTab = ({ layout }: LayoutTabProps) => {
  const selection = useSocketSelection(layout);

  return (
    <div className="op-centre-lite-layout">
      <div className="op-centre-lite-layout__toolbar">
        <SocketLegend stateCounts={layout.stateCounts} />
        <ZoomControls zoom={selection.zoom} onZoomChange={selection.onZoomChange} />
      </div>
      <div className="op-centre-lite-layout__body">
        <SocketGrid
          racks={layout.racks}
          zoom={selection.zoom}
          selectedMinerId={selection.selected?.id}
          onSelect={selection.onSelect}
        />
        {selection.selected === undefined ? null : (
          <MinerPanel miner={selection.selected} onClose={selection.onClear} />
        )}
      </div>
    </div>
  );
};
