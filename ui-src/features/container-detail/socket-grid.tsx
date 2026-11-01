import { Typography } from "@tetherto/mdk-react-devkit";

import type { Miner } from "../../api/contract";
import { FALLBACK } from "../../lib/constants";
import { DISPLAY_FRACTION_DIGITS, formatFixed } from "../../lib/units";
import {
  EMPTY_SOCKET,
  type LayoutRack,
  type LayoutSocket,
  SOCKET_STATE_LABELS,
} from "./layout-shape";

// The grid's sizes, as CSS custom properties set from here (styles.css reads them).
declare module "react" {
  interface CSSProperties {
    "--op-centre-lite-socket-size"?: string;
    "--op-centre-lite-rack-columns"?: number;
  }
}

/** Socket size multipliers the zoom steps through; 1 is the default. */
export const ZOOM_LEVELS = [0.75, 1, 1.25, 1.5] as const;
export type Zoom = (typeof ZOOM_LEVELS)[number];
export const DEFAULT_ZOOM: Zoom = 1;

/** A socket's side at zoom 1. */
const BASE_SOCKET_PX = 52;

/**
 * The layout gives a socket a position but no row or column, so the grid
 * wraps each rack's sockets in rows of up to 5: a 10 to 20 socket rack stays
 * compact. A rack with fewer sockets gets one column each. Real rack geometry
 * needs the layout config to carry it.
 */
const MAX_SOCKETS_PER_ROW = 5;

const describeSocket = (rackName: string, socket: LayoutSocket): string =>
  socket.miner === null
    ? `${rackName}, socket ${socket.slot}: empty`
    : `${rackName}, socket ${socket.slot}: ${socket.miner.serial}, ${SOCKET_STATE_LABELS[socket.state]}`;

/** A heatmap's colour step and tile text for one socket; undefined leaves it uncoloured. */
export type SocketHeatOf = (socket: LayoutSocket) => { step: number; label: string } | undefined;

type SocketTileProps = {
  rackName: string;
  socket: LayoutSocket;
  selected: boolean;
  onSelect: (miner: Miner) => void;
  heatOf: SocketHeatOf | undefined;
};

const SocketTile = ({ rackName, socket, selected, onSelect, heatOf }: SocketTileProps) => {
  const label = describeSocket(rackName, socket);
  if (socket.miner === null) {
    return (
      <div
        className="op-centre-lite-socket"
        data-state={EMPTY_SOCKET}
        role="img"
        aria-label={label}
      >
        <span className="op-centre-lite-socket__slot">{socket.slot}</span>
      </div>
    );
  }
  const { miner } = socket;
  const heat = heatOf?.(socket);
  return (
    <button
      type="button"
      className="op-centre-lite-socket"
      data-state={socket.state}
      data-heat={heatOf === undefined ? undefined : (heat?.step ?? "none")}
      aria-label={label}
      aria-pressed={selected}
      onClick={() => onSelect(miner)}
    >
      <span className="op-centre-lite-socket__slot">{socket.slot}</span>
      <span className="op-centre-lite-socket__value">
        {heatOf === undefined
          ? formatFixed(miner.hashrateThs, DISPLAY_FRACTION_DIGITS.HASHRATE_TH_SOCKET)
          : (heat?.label ?? FALLBACK)}
      </span>
    </button>
  );
};

type SocketGridProps = {
  racks: LayoutRack[];
  zoom: Zoom;
  /** The miner shown in the side panel, outlined in the grid. */
  selectedMinerId: string | undefined;
  /** Several miners picked at once (the Power Adjustment tab), outlined too. */
  selectedMinerIds?: ReadonlySet<string>;
  onSelect: (miner: Miner) => void;
  /**
   * Colour the sockets by a metric (the Heatmap tab) instead of by status, and
   * show its value instead of the hash rate. Without it, the status grid.
   */
  heatOf?: SocketHeatOf;
};

/**
 * Every rack of a container as a block of sockets, tinted by miner status, with
 * the socket number and the miner's hash rate in TH/s. A socket with a miner is
 * a button that selects it. Shared by the Layout, Power Adjustment and Heatmap tabs.
 */
export const SocketGrid = ({
  racks,
  zoom,
  selectedMinerId,
  selectedMinerIds,
  onSelect,
  heatOf,
}: SocketGridProps) => (
  <div
    className="op-centre-lite-socket-grid"
    style={{ "--op-centre-lite-socket-size": `${BASE_SOCKET_PX * zoom}px` }}
  >
    {racks.map((rack) => (
      <section key={rack.id} className="op-centre-lite-socket-grid__rack" aria-label={rack.name}>
        <Typography size="sm" weight="semibold">
          {rack.name}
        </Typography>
        <div
          className="op-centre-lite-socket-grid__sockets"
          style={{
            "--op-centre-lite-rack-columns": Math.min(rack.sockets.length, MAX_SOCKETS_PER_ROW),
          }}
        >
          {rack.sockets.map((socket) => (
            <SocketTile
              key={socket.position}
              rackName={rack.name}
              socket={socket}
              selected={
                socket.miner !== null &&
                (socket.miner.id === selectedMinerId ||
                  selectedMinerIds?.has(socket.miner.id) === true)
              }
              onSelect={onSelect}
              heatOf={heatOf}
            />
          ))}
        </div>
      </section>
    ))}
  </div>
);
