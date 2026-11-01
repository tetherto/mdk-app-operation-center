import { Indicator, type IndicatorColor, Typography } from "@tetherto/mdk-react-devkit";

import { EMPTY_SOCKET, SOCKET_STATE_LABELS, SOCKET_STATES, type SocketState } from "./layout-shape";

/** The devkit's status colours, as on the Site Overview status tiles. */
const STATE_COLORS: Record<SocketState, IndicatorColor> = {
  offline: "gray",
  error: "red",
  sleep: "blue",
  low: "yellow",
  normal: "green",
  high: "purple",
  [EMPTY_SOCKET]: "slate",
};

type SocketLegendProps = { stateCounts: ReadonlyMap<SocketState, number> };

/** What each socket colour means, with how many sockets show it, and what the number on a socket is. */
export const SocketLegend = ({ stateCounts }: SocketLegendProps) => (
  <div className="op-centre-lite-socket-legend">
    <ul className="op-centre-lite-socket-legend__states" aria-label="Legend">
      {SOCKET_STATES.map((state) => (
        <li key={state}>
          <Indicator color={STATE_COLORS[state]} size="sm">
            <span>{SOCKET_STATE_LABELS[state]}</span>
            <span>{stateCounts.get(state) ?? 0}</span>
          </Indicator>
        </li>
      ))}
    </ul>
    <Typography variant="secondary" size="sm">
      Sockets show the miner's hash rate in TH/s.
    </Typography>
  </div>
);
