import type { Miner, MinerStatus } from "../../api/contract";
import { formatCount } from "../../lib/units";
import type { LayoutView } from "./layout-shape";

/** Miners a power command cannot reach, so the grid does not let them be picked. */
const UNSELECTABLE: ReadonlySet<MinerStatus> = new Set(["offline"]);

export const isSelectableMiner = (miner: Miner): boolean => !UNSELECTABLE.has(miner.status);

/** The miners a power command can reach: every miner in the layout that is not offline. */
export const selectableMiners = (layout: LayoutView): Miner[] =>
  layout.racks
    .flatMap((rack) => rack.sockets)
    .flatMap((socket) => (socket.miner === null ? [] : [socket.miner]))
    .filter(isSelectableMiner);

/**
 * The selected miners as the latest layout reports them, in layout order. A
 * miner that went offline or left the container drops out of the selection.
 */
export const selectedMinersOf = (layout: LayoutView, selectedIds: ReadonlySet<string>): Miner[] =>
  selectableMiners(layout).filter((miner) => selectedIds.has(miner.id));

/** The power percentage the selection shares; null when the miners differ or none report one. */
export const sharedPctOf = (miners: Miner[]): number | null => {
  const first = miners[0]?.powerPct ?? null;
  return first !== null && miners.every((miner) => miner.powerPct === first) ? first : null;
};

export const PCT_MIN = 0;
export const PCT_MAX = 100;

/** A typed or slid percentage as the command takes it: a whole number from 0 to 100. */
export const clampPct = (value: number): number =>
  Number.isFinite(value) ? Math.min(PCT_MAX, Math.max(PCT_MIN, Math.round(value))) : PCT_MAX;

/**
 * What the number field's text sets: a percentage once it reads as a number,
 * undefined while it is empty or half-typed, so clearing the field keeps the
 * last value instead of jumping to 0% and sending that.
 */
export const parsePctInput = (text: string): number | undefined => {
  if (text.trim() === "") return undefined;
  const value = Number(text);
  return Number.isFinite(value) ? clampPct(value) : undefined;
};

/** How the panel and the confirmation name the selection: "WM1103", or "6 miners". */
export const selectionNameOf = (miners: Miner[]): string =>
  miners.length === 1 && miners[0] !== undefined
    ? miners[0].serial
    : formatCount(miners.length, "miner");
