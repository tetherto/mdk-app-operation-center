import { type Miner, type MinerStatus, POWER_PCT_MAX } from "../../api/contract";
import { formatCount } from "../../lib/units";
import { type LayoutView, minerNameOf } from "./layout-shape";

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
export const PCT_MAX = POWER_PCT_MAX;
/** Where the control starts: the miners' stock power. */
export const DEFAULT_PCT = 100;
/** The labels under the slider, as the design marks it. */
export const PCT_TICKS = [0, 50, 100, 150, 200] as const;

/** A typed or slid percentage as the command takes it: a whole number from 0 to 200. */
export const clampPct = (value: number): number =>
  Number.isFinite(value) ? Math.min(PCT_MAX, Math.max(PCT_MIN, Math.round(value))) : DEFAULT_PCT;

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
    ? minerNameOf(miners[0])
    : formatCount(miners.length, "miner");

/** The selected miners grouped by rack, in layout order, for the side panel's list. */
export const selectionByRack = (
  layout: LayoutView,
  selectedIds: ReadonlySet<string>,
): { rack: string; miners: Miner[] }[] =>
  layout.racks
    .map((rack) => ({
      rack: rack.name,
      miners: rack.sockets.flatMap((socket) =>
        socket.miner !== null && selectedIds.has(socket.miner.id) ? [socket.miner] : [],
      ),
    }))
    .filter((group) => group.miners.length > 0);
