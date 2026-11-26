import { MdkFetchError } from "@tetherto/mdk-ui-foundation";

import { type ContainerLayout, MINER_STATUSES, type Miner } from "../../api/contract";
import { FALLBACK } from "../../lib/constants";
import { describeRequestError } from "../../lib/describe-request-error";
import { MINER_STATUS_LABELS } from "../../lib/miner-status";
import { POWER_MODE_LABELS } from "../../lib/power-mode";
import { formatAgo, formatDuration } from "../../lib/time";
import {
  DISPLAY_UNITS,
  formatEfficiency,
  formatFrequencyMhz,
  formatHashrateThs,
  formatMinerPowerKw,
  formatTemperatureC,
  thsToPhs,
  toEfficiencyWPerThs,
  wToKw,
} from "../../lib/units";

/** The state of a socket that holds no miner. */
export const EMPTY_SOCKET = "empty";

/** A miner that reports an error but still hashes. */
export const MINING_WITH_ERROR = "mining-error";

/**
 * What a socket shows: its miner's status, "mining with error" for a miner
 * that errors but still hashes, or that it holds none. In legend order.
 */
export const SOCKET_STATES = [...MINER_STATUSES, MINING_WITH_ERROR, EMPTY_SOCKET] as const;
export type SocketState = (typeof SOCKET_STATES)[number];

export const SOCKET_STATE_LABELS: Record<SocketState, string> = {
  ...MINER_STATUS_LABELS,
  [MINING_WITH_ERROR]: "Mining with Error",
  [EMPTY_SOCKET]: "No Miner",
};

/** A socket's state from its miner. */
export const socketStateOf = (miner: Miner | null): SocketState => {
  if (miner === null) return EMPTY_SOCKET;
  if (miner.status === "error" && miner.hashrateThs > 0) return MINING_WITH_ERROR;
  return miner.status;
};

/**
 * Whether the container's PDU powers a socket, from its `enabled` reading;
 * "unknown" without one (no PDU socket mapped, no reading). Never guessed from
 * the miner.
 */
export type SocketPower = "on" | "off" | "unknown";

export const socketPowerOf = (enabled: boolean | null): SocketPower => {
  if (enabled === null) return "unknown";
  return enabled ? "on" : "off";
};

export type LayoutSocket = {
  /** The socket's position in the container, e.g. "1-2-7"; the tile's label. */
  position: string;
  state: SocketState;
  /** From the PDU, empty sockets included. */
  power: SocketPower;
  /** The socket's current from its PDU, in A; null without a reading. */
  currentA: number | null;
  miner: Miner | null;
};

export type LayoutRack = { id: string; name: string; sockets: LayoutSocket[] };

export type LayoutView = {
  container: {
    id: string;
    name: string;
    model: string;
    /** Sockets holding a miner. */
    minerCount: number;
    hashratePhs: number;
    powerKw: number;
    /** W per TH/s; undefined while the container has no hashrate. */
    efficiencyWPerThs: number | undefined;
  };
  racks: LayoutRack[];
};

/** Shapes `GET /api/containers/:id/layout` for the container page. */
export const toLayoutView = ({ container, racks }: ContainerLayout): LayoutView => {
  const rackViews = racks.map((rack) => ({
    id: rack.id,
    name: rack.name,
    sockets: rack.sockets.map(({ position, miner, currentA, enabled }) => ({
      position,
      state: socketStateOf(miner),
      power: socketPowerOf(enabled),
      currentA,
      miner,
    })),
  }));
  return {
    container: {
      id: container.id,
      name: container.name,
      model: container.model,
      minerCount: rackViews
        .flatMap((rack) => rack.sockets)
        .filter((socket) => socket.miner !== null).length,
      hashratePhs: thsToPhs(container.hashrateThs),
      powerKw: wToKw(container.powerW),
      efficiencyWPerThs: toEfficiencyWPerThs(container.powerW, container.hashrateThs),
    },
    racks: rackViews,
  };
};

/** A miner with the rack the grid shows it in. */
export type PlacedMiner = { miner: Miner; rack: LayoutRack };

/** The miner in the layout with this id and the rack holding it, if it is still there. */
export const findMiner = (
  view: LayoutView,
  minerId: string | undefined,
): PlacedMiner | undefined =>
  minerId === undefined
    ? undefined
    : view.racks.flatMap((rack) =>
        rack.sockets.flatMap(({ miner }) =>
          miner !== null && miner.id === minerId ? [{ miner, rack }] : [],
        ),
      )[0];

/**
 * Where a miner sits, for the side panel's subtitle: the rack the grid shows
 * it in, then its socket, e.g. "PDU 1-3 · Socket 2". A site may send a bare
 * socket number as the position, so the rack is what tells sockets apart.
 */
export const socketLabelOf = ({ miner, rack }: PlacedMiner): string =>
  `${rack.name} · Socket ${miner.position}`;

/**
 * How the page names a miner: its serial, or its id while it has not reported
 * one (an offline miner), so a command target, a toast or a log file name is
 * never blank.
 */
export const minerNameOf = (miner: Miner): string => miner.serial || miner.id;

/** Every socket of the container in position order, as Ordered View lists them. */
export const orderedSockets = (view: LayoutView): LayoutSocket[] =>
  view.racks
    .flatMap((rack) => rack.sockets)
    .sort((a, b) => a.position.localeCompare(b.position, "en", { numeric: true }));

/**
 * One reading in the side panel. `state` colours a status value the way its
 * socket is coloured.
 */
export type MetricRow = { label: string; value: string; state?: SocketState };

/** The side panel's status: "Mining" for any hashing mode, as the design words it. */
const STATUS_TEXT: Record<SocketState, string> = {
  ...SOCKET_STATE_LABELS,
  low: "Mining",
  normal: "Mining",
  high: "Mining",
};

const statusRow = (miner: Miner): MetricRow => {
  const state = socketStateOf(miner);
  return { label: "Status", value: STATUS_TEXT[state], state };
};

/** The Layout tab's readings for the selected miner. */
export const layoutMetricsOf = (miner: Miner): MetricRow[] => [
  { label: "Hash Rate", value: formatHashrateThs(miner.hashrateThs) },
  { label: "Consumption", value: formatMinerPowerKw(miner.powerW) },
  statusRow(miner),
  { label: "IP", value: miner.ip || FALLBACK },
];

/**
 * The Heatmap tab's readings for the selected miner. Inlet Temp is the miner's
 * own ambient reading; Env Temp is its container's, "-" when the container has
 * no env device or no reading.
 */
export const heatmapMetricsOf = (miner: Miner, nowMs: number): MetricRow[] => [
  {
    label: "Efficiency",
    value: formatEfficiency(
      toEfficiencyWPerThs(miner.powerW, miner.hashrateThs),
      DISPLAY_UNITS.EFFICIENCY,
    ),
  },
  { label: "Hash Rate", value: formatHashrateThs(miner.hashrateThs) },
  { label: "Frequency", value: formatFrequencyMhz(miner.frequencyMhz) },
  { label: "Temperature", value: formatTemperatureC(miner.chipTempC) },
  { label: "Consumption", value: formatMinerPowerKw(miner.powerW) },
  { label: "Inlet Temp", value: formatTemperatureC(miner.inletTempC) },
  {
    label: "Env Temp",
    value: miner.envTempC === null ? FALLBACK : formatTemperatureC(miner.envTempC),
  },
  { label: "Power Mode", value: POWER_MODE_LABELS[miner.powerMode] },
  { label: "Uptime", value: miner.uptimeS > 0 ? formatDuration(miner.uptimeS) : FALLBACK },
  statusRow(miner),
  {
    label: "Last Update",
    value: miner.lastUpdate > 0 ? formatAgo(miner.lastUpdate, nowMs) : FALLBACK,
  },
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
