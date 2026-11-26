import type { CSSProperties } from "react";

import type { Miner } from "../../api/contract";
import type { HeatColor } from "./heatmap-shape";
import {
  type LayoutRack,
  type LayoutSocket,
  type LayoutView,
  minerNameOf,
  orderedSockets,
  SOCKET_STATE_LABELS,
  type SocketPower,
} from "./layout-shape";

/** Socket size multipliers the zoom steps through; 1 is the design's size. */
export const ZOOM_LEVELS = [0.75, 1, 1.25, 1.5] as const;
export type Zoom = (typeof ZOOM_LEVELS)[number];
export const DEFAULT_ZOOM: Zoom = 1;

/**
 * What one tab shows on a socket tile: the lines over the position label, and
 * the heatmap colour on the Heatmap tab (the status colours elsewhere).
 */
export type SocketFace = { lines: string[]; heat?: HeatColor };

const POWER_LABELS: Record<SocketPower, string | undefined> = {
  on: "Socket On",
  off: "Socket Off",
  unknown: undefined,
};

const describeSocket = (socket: LayoutSocket, face: SocketFace | undefined): string => {
  const power = POWER_LABELS[socket.power];
  const parts =
    socket.miner === null
      ? [`Socket ${socket.position}: no miner`]
      : [`Socket ${socket.position}`, minerNameOf(socket.miner), SOCKET_STATE_LABELS[socket.state]];
  return parts
    .concat(power === undefined ? [] : [power])
    .concat(face?.lines ?? [])
    .join(", ");
};

const SocketLines = ({ lines }: { lines: string[] }) => (
  <span className="op-centre-lite-socket__lines" aria-hidden="true">
    {lines.map((line, index) => (
      // The lines are a fixed list per tab: their order is their identity.
      // oxlint-disable-next-line react/no-array-index-key
      <span key={index}>{line}</span>
    ))}
  </span>
);

type SocketTileProps = {
  socket: LayoutSocket;
  face: SocketFace | undefined;
  selected: boolean;
  onSelect: (miner: Miner) => void;
};

type HeatStyle = CSSProperties & { "--op-centre-lite-heat": string };

/** A heatmap tile's data-heat (its ink, or "none") and its fill, for styles.css. */
const heatAttributesOf = (heat: HeatColor | undefined) => {
  if (heat === undefined) return {};
  if (heat === "none") return { "data-heat": "none" };
  const style: HeatStyle = { "--op-centre-lite-heat": heat.fill };
  return { "data-heat": heat.ink, style };
};

const SocketTile = ({ socket, face, selected, onSelect }: SocketTileProps) => {
  const label = describeSocket(socket, face);
  const position = <span className="op-centre-lite-socket__position">{socket.position}</span>;
  const { miner } = socket;
  if (miner === null) {
    return (
      <div
        className="op-centre-lite-socket"
        data-state={socket.state}
        data-power={socket.power}
        role="img"
        aria-label={label}
      >
        {face === undefined ? null : <SocketLines lines={face.lines} />}
        {position}
      </div>
    );
  }
  return (
    <button
      type="button"
      className="op-centre-lite-socket"
      data-state={socket.state}
      data-power={socket.power}
      {...heatAttributesOf(face?.heat)}
      aria-label={label}
      aria-pressed={selected}
      onClick={() => onSelect(miner)}
    >
      <SocketLines lines={face?.lines ?? []} />
      {position}
    </button>
  );
};

type SocketGridProps = {
  layout: LayoutView;
  zoom: Zoom;
  /** One list of every socket in position order, instead of a column per rack. */
  ordered: boolean;
  /** What a tile shows; the tab decides. */
  faceOf: (socket: LayoutSocket) => SocketFace | undefined;
  isSelected: (miner: Miner) => boolean;
  onSelect: (miner: Miner) => void;
};

type SocketListProps = Pick<SocketGridProps, "faceOf" | "isSelected" | "onSelect"> & {
  sockets: LayoutSocket[];
};

const SocketList = ({ sockets, faceOf, isSelected, onSelect }: SocketListProps) => (
  <div className="op-centre-lite-socket-grid__sockets">
    {sockets.map((socket) => (
      <SocketTile
        key={socket.position}
        socket={socket}
        face={faceOf(socket)}
        selected={socket.miner !== null && isSelected(socket.miner)}
        onSelect={onSelect}
      />
    ))}
  </div>
);

const RackColumn = ({ rack, ...list }: Omit<SocketListProps, "sockets"> & { rack: LayoutRack }) => (
  <section className="op-centre-lite-socket-grid__rack" aria-label={rack.name}>
    <h3 className="op-centre-lite-socket-grid__rack-name">{rack.name}</h3>
    <SocketList sockets={rack.sockets} {...list} />
  </section>
);

/**
 * The container's sockets: a column per rack, or one list in position order.
 * A tile is tinted by its miner's status (or the heatmap colour), with the
 * socket's power state on its position label. A socket with a miner is a
 * button that selects it. Shared by the Layout, Power Adjustment and Heatmap tabs.
 */
export const SocketGrid = ({ layout, zoom, ordered, ...list }: SocketGridProps) => (
  <div
    className="op-centre-lite-socket-grid"
    data-ordered={ordered}
    // CSS zoom scales the tiles, their text and the gaps together.
    style={{ zoom }}
  >
    {ordered ? (
      <SocketList sockets={orderedSockets(layout)} {...list} />
    ) : (
      layout.racks.map((rack) => <RackColumn key={rack.id} rack={rack} {...list} />)
    )}
  </div>
);
