import { Button } from "@tetherto/mdk-react-devkit";
import { type ReactNode, useState } from "react";

import type { Miner } from "../../api/contract";
import { downloadCsv, toCsv } from "../../lib/csv";
import { DISPLAY_UNITS, formatEfficiency } from "../../lib/units";
import { SOCKET_CSV_COLUMNS, socketCsvFileName, socketRowsOf } from "./layout-csv";
import type { LayoutSocket, LayoutView } from "./layout-shape";
import { DEFAULT_ZOOM, SocketGrid, type SocketFace, ZOOM_LEVELS, type Zoom } from "./socket-grid";

type WorkbenchProps = {
  layout: LayoutView;
  /** Controls opposite the container's efficiency (Select All, the heatmap metric). */
  actions?: ReactNode;
  /** The key under the grid. */
  legend: ReactNode;
  faceOf: (socket: LayoutSocket) => SocketFace | undefined;
  isSelected: (miner: Miner) => boolean;
  onSelect: (miner: Miner) => void;
};

/**
 * The left column of the Layout, Power Adjustment and Heatmap tabs: the
 * container's efficiency, the grid's tools (zoom, print, ordered view, export),
 * the socket grid and its legend. Zoom and ordered view are the tab's own.
 */
export const Workbench = ({ layout, actions, legend, ...grid }: WorkbenchProps) => {
  const [zoom, setZoom] = useState<Zoom>(DEFAULT_ZOOM);
  const [ordered, setOrdered] = useState(false);
  const index = ZOOM_LEVELS.indexOf(zoom);
  const smaller = ZOOM_LEVELS[index - 1];
  const larger = ZOOM_LEVELS[index + 1];

  const exportCsv = () =>
    downloadCsv(socketCsvFileName(layout), toCsv(SOCKET_CSV_COLUMNS, socketRowsOf(layout)));

  return (
    <div className="op-centre-lite-workbench">
      <div className="op-centre-lite-workbench__head">
        <div className="op-centre-lite-workbench__efficiency">
          <span className="op-centre-lite-workbench__label">Container Efficiency</span>
          <span className="op-centre-lite-workbench__value">
            {formatEfficiency(layout.container.efficiencyWPerThs, DISPLAY_UNITS.EFFICIENCY)}
          </span>
        </div>
        {actions === undefined ? null : (
          <div className="op-centre-lite-workbench__actions">{actions}</div>
        )}
      </div>
      <div className="op-centre-lite-workbench__tools" role="toolbar" aria-label="Grid tools">
        <Button
          variant="secondary"
          className="op-centre-lite-tool"
          disabled={larger === undefined}
          onClick={() => larger !== undefined && setZoom(larger)}
        >
          Zoom In
        </Button>
        <Button
          variant="secondary"
          className="op-centre-lite-tool"
          disabled={smaller === undefined}
          onClick={() => smaller !== undefined && setZoom(smaller)}
        >
          Zoom Out
        </Button>
        <Button
          variant="secondary"
          className="op-centre-lite-tool"
          disabled={zoom === DEFAULT_ZOOM}
          onClick={() => setZoom(DEFAULT_ZOOM)}
        >
          Reset
        </Button>
        <Button variant="secondary" className="op-centre-lite-tool" onClick={() => window.print()}>
          Print
        </Button>
        <Button
          variant="secondary"
          className="op-centre-lite-tool"
          aria-pressed={ordered}
          onClick={() => setOrdered((current) => !current)}
        >
          Ordered View
        </Button>
        <Button variant="secondary" className="op-centre-lite-tool" onClick={exportCsv}>
          Export
        </Button>
      </div>
      <div className="op-centre-lite-workbench__grid">
        <SocketGrid layout={layout} zoom={zoom} ordered={ordered} {...grid} />
      </div>
      <div className="op-centre-lite-workbench__legend">{legend}</div>
    </div>
  );
};
