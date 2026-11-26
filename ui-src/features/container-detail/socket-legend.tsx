import { EMPTY_SOCKET, SOCKET_STATE_LABELS, type SocketState } from "./layout-shape";

/** The status keys in the design's order, after the socket power keys. */
const STATE_KEYS: SocketState[] = [
  EMPTY_SOCKET,
  "offline",
  "error",
  "sleep",
  "normal",
  "low",
  "high",
  "mining-error",
];

/**
 * What the grid's colours mean: the label strip shows whether the container's
 * PDU powers the socket (neither colour without a reading), the tile its
 * miner's status.
 */
export const SocketLegend = () => (
  <ul className="op-centre-lite-socket-legend" aria-label="Legend">
    <li>
      <span className="op-centre-lite-socket-legend__swatch" data-power="off" aria-hidden="true" />
      Socket Off
    </li>
    <li>
      <span className="op-centre-lite-socket-legend__swatch" data-power="on" aria-hidden="true" />
      Socket On
    </li>
    {STATE_KEYS.map((state) => (
      <li key={state}>
        <span
          className="op-centre-lite-socket-legend__swatch"
          data-state={state}
          aria-hidden="true"
        />
        {SOCKET_STATE_LABELS[state]}
      </li>
    ))}
  </ul>
);
