import { MdkFetchError } from "@tetherto/mdk-ui-foundation";

import { type ContainerLayout, MINER_STATUSES, type Miner } from "../../api/contract";
import { FALLBACK } from "../../lib/constants";
import { describeRequestError } from "../../lib/describe-request-error";
import { MINER_STATUS_LABELS } from "../../lib/miner-status";
import { POWER_MODE_LABELS } from "../../lib/power-mode";
import {
  formatEfficiency,
  formatHashrateThs,
  formatPercent,
  formatPowerW,
  formatTemperatureC,
  thsToPhs,
  toEfficiencyWPerThs,
  wToKw,
} from "../../lib/units";

/** The state of a socket that holds no miner. */
export const EMPTY_SOCKET = "empty";

/**
 * What a socket shows: its miner's status, or that it holds none. In legend
 * order, the Site Overview status tiles' order.
 */
export const SOCKET_STATES = [...MINER_STATUSES, EMPTY_SOCKET] as const;
export type SocketState = (typeof SOCKET_STATES)[number];

export const SOCKET_STATE_LABELS: Record<SocketState, string> = {
  ...MINER_STATUS_LABELS,
  [EMPTY_SOCKET]: "Empty",
};

export type LayoutSocket = {
  position: string;
  /** The socket's number in its rack: the last part of the position ("1-2-7" is 7). */
  slot: string;
  state: SocketState;
  miner: Miner | null;
};

export type LayoutRack = { id: string; name: string; sockets: LayoutSocket[] };

export type LayoutView = {
  container: {
    id: string;
    name: string;
    model: string;
    hashratePhs: number;
    powerKw: number;
    /** W per TH/s; undefined while the container has no hashrate. */
    efficiencyWPerThs: number | undefined;
  };
  racks: LayoutRack[];
  /** Sockets per state, for the legend; a state no socket shows is missing. */
  stateCounts: ReadonlyMap<SocketState, number>;
};

const slotOf = (position: string): string => position.split("-").at(-1) ?? position;

/** Shapes `GET /api/containers/:id/layout` for the Layout tab. */
export const toLayoutView = ({ container, racks }: ContainerLayout): LayoutView => {
  const stateCounts = new Map<SocketState, number>();
  const rackViews = racks.map((rack) => ({
    id: rack.id,
    name: rack.name,
    sockets: rack.sockets.map(({ position, miner }) => {
      const state: SocketState = miner?.status ?? EMPTY_SOCKET;
      stateCounts.set(state, (stateCounts.get(state) ?? 0) + 1);
      return { position, slot: slotOf(position), state, miner };
    }),
  }));
  return {
    container: {
      id: container.id,
      name: container.name,
      model: container.model,
      hashratePhs: thsToPhs(container.hashrateThs),
      powerKw: wToKw(container.powerW),
      efficiencyWPerThs: toEfficiencyWPerThs(container.powerW, container.hashrateThs),
    },
    racks: rackViews,
    stateCounts,
  };
};

/** The miner in the layout with this id, if it is still there. */
export const findMiner = (view: LayoutView, minerId: string | undefined): Miner | undefined =>
  minerId === undefined
    ? undefined
    : (view.racks.flatMap((rack) => rack.sockets).find((socket) => socket.miner?.id === minerId)
        ?.miner ?? undefined);

export type DetailRow = { label: string; value: string };

/** The side panel's rows for one miner, in display units. */
export const toMinerDetails = (miner: Miner): DetailRow[] => [
  { label: "Serial", value: miner.serial },
  { label: "IP", value: miner.ip },
  { label: "Position", value: miner.position },
  { label: "Status", value: MINER_STATUS_LABELS[miner.status] },
  { label: "Power mode", value: POWER_MODE_LABELS[miner.powerMode] },
  { label: "Power %", value: miner.powerPct === null ? FALLBACK : formatPercent(miner.powerPct) },
  { label: "Hash rate", value: formatHashrateThs(miner.hashrateThs) },
  { label: "Consumption", value: formatPowerW(miner.powerW) },
  {
    label: "Efficiency",
    value: formatEfficiency(toEfficiencyWPerThs(miner.powerW, miner.hashrateThs)),
  },
  { label: "Inlet temp", value: formatTemperatureC(miner.inletTempC) },
  { label: "Chip temp", value: formatTemperatureC(miner.chipTempC) },
];

// The layout route answers 404 for a container the site does not have.
const UNKNOWN_CONTAINER = 404;

export const isUnknownContainer = (error: unknown): boolean =>
  error instanceof MdkFetchError && error.status === UNKNOWN_CONTAINER;

export type ContainerLayoutView =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error"; message: string }
  | { status: "ready"; layout: LayoutView };

/**
 * What the page shows for the layout query. A layout already shown stays on a
 * failed background refetch; a 404 means the container does not exist, not
 * that the backend is down.
 */
export const toContainerLayoutView = (
  layout: LayoutView | undefined,
  error: unknown,
  url: string,
): ContainerLayoutView => {
  if (layout !== undefined) return { status: "ready", layout };
  if (isUnknownContainer(error)) return { status: "not-found" };
  if (error !== null && error !== undefined) {
    return { status: "error", message: describeRequestError(error, url) };
  }
  return { status: "loading" };
};
