import { FALLBACK } from "../../lib/constants";
import { DISPLAY_FRACTION_DIGITS, DISPLAY_UNITS, formatFixed, wToKw } from "../../lib/units";
import { type LayoutSocket, type LayoutView, layoutMetricsOf, socketLabelOf } from "./layout-shape";
import { MetricGrid, NO_SOCKET_SELECTED, PanelHint, PanelSection, SidePanel } from "./side-panel";
import type { SocketFace } from "./socket-grid";
import { SocketLegend } from "./socket-legend";
import { useSocketSelection } from "./use-socket-selection";
import { Workbench } from "./workbench";

const currentLine = (currentA: number | null): string =>
  `${currentA === null ? FALLBACK : formatFixed(currentA, DISPLAY_FRACTION_DIGITS.CURRENT)} ${DISPLAY_UNITS.CURRENT}`;

/**
 * The miner's power in kW and the socket's current from its PDU ("- A"
 * without a reading). An empty socket shows its current only when the PDU
 * reports one.
 */
const layoutFaceOf = ({ miner, currentA }: LayoutSocket): SocketFace | undefined => {
  if (miner === null) return currentA === null ? undefined : { lines: [currentLine(currentA)] };
  return {
    lines: [
      `${formatFixed(wToKw(miner.powerW), DISPLAY_FRACTION_DIGITS.POWER_KW_SOCKET)} ${DISPLAY_UNITS.POWER_KW}`,
      currentLine(currentA),
    ],
  };
};

type LayoutTabProps = { layout: LayoutView };

/** The container's racks as columns of sockets, with the selected miner's readings beside them. */
export const LayoutTab = ({ layout }: LayoutTabProps) => {
  const selection = useSocketSelection(layout);
  const { selected } = selection;

  return (
    <div className="op-centre-lite-detail-body">
      <Workbench
        layout={layout}
        legend={<SocketLegend />}
        faceOf={layoutFaceOf}
        isSelected={selection.isSelected}
        onSelect={selection.onSelect}
      />
      <SidePanel
        title={layout.container.name}
        subtitle={selected === undefined ? NO_SOCKET_SELECTED : socketLabelOf(selected)}
      >
        <PanelSection title="Miner Metrics">
          {selected === undefined ? (
            <PanelHint>Select a socket to see its miner.</PanelHint>
          ) : (
            <MetricGrid rows={layoutMetricsOf(selected.miner)} />
          )}
        </PanelSection>
      </SidePanel>
    </div>
  );
};
