import { Button } from "@tetherto/mdk-react-devkit";

import { FALLBACK } from "../../lib/constants";
import { formatCount, formatPercent } from "../../lib/units";
import { findMiner, type LayoutSocket, type LayoutView, socketLabelOf } from "./layout-shape";
import { PowerAdjustmentPanel } from "./power-adjustment-panel";
import { isSelectableMiner } from "./power-adjustment-shape";
import { NO_SOCKET_SELECTED, SidePanel } from "./side-panel";
import type { SocketFace } from "./socket-grid";
import { SocketLegend } from "./socket-legend";
import { usePowerSelection } from "./use-power-selection";
import { Workbench } from "./workbench";

/** Each miner's power percentage. */
const powerFaceOf = ({ miner }: LayoutSocket): SocketFace | undefined =>
  miner === null
    ? undefined
    : { lines: [miner.powerPct === null ? FALLBACK : formatPercent(miner.powerPct)] };

type PowerAdjustmentTabProps = { layout: LayoutView };

/** Pick miners on the socket grid and set their power percentage together. */
export const PowerAdjustmentTab = ({ layout }: PowerAdjustmentTabProps) => {
  const selection = usePowerSelection(layout);
  const [only] = selection.miners;
  const placed = selection.miners.length === 1 ? findMiner(layout, only?.id) : undefined;
  const subtitle =
    placed !== undefined
      ? socketLabelOf(placed)
      : selection.miners.length > 1
        ? formatCount(selection.miners.length, "socket")
        : NO_SOCKET_SELECTED;

  return (
    <div className="op-centre-lite-detail-body">
      <Workbench
        layout={layout}
        actions={
          <>
            <Button
              variant="secondary"
              className="op-centre-lite-tool"
              disabled={selection.miners.length === selection.selectableCount}
              onClick={selection.onSelectAll}
            >
              Select All
            </Button>
            <Button
              variant="secondary"
              className="op-centre-lite-tool"
              disabled={selection.miners.length === 0}
              onClick={selection.onClear}
            >
              Deselect All
            </Button>
          </>
        }
        legend={<SocketLegend />}
        faceOf={powerFaceOf}
        isSelected={(miner) => selection.ids.has(miner.id)}
        onSelect={(miner) => {
          if (isSelectableMiner(miner)) selection.onToggle(miner);
        }}
      />
      <SidePanel title={layout.container.name} subtitle={subtitle}>
        <PowerAdjustmentPanel layout={layout} selection={selection} />
      </SidePanel>
    </div>
  );
};
