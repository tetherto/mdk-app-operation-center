import type {
  ContainerSummary,
  MinerStatusCounts,
  PowerMode,
  RackSummary,
} from "../../api/contract";
import { thsToPhs, toEfficiencyWPerThs, wToKw } from "../../lib/units";

/** One rack row of a container card, in display units. */
export type RackRow = {
  id: string;
  name: string;
  /** W per TH/s; undefined while the rack has no hashrate. */
  efficiencyWPerThs: number | undefined;
  powerKw: number;
  hashratePhs: number;
};

/**
 * Miner counts keyed the way the devkit's `MinersActivityChart` reads them: it
 * calls an empty socket `disconnected` (and labels it "Empty").
 */
export type StatusTileCounts = Omit<MinerStatusCounts, "empty"> & { disconnected: number };

/** A container card on Site Overview, in display units. */
export type ContainerCard = {
  id: string;
  name: string;
  model: string;
  powerKw: number;
  /** W per TH/s; undefined while the container has no hashrate. */
  efficiencyWPerThs: number | undefined;
  hashratePhs: number;
  racks: RackRow[];
  statusCounts: StatusTileCounts;
  /** What the power controls offer and mark as current. */
  power: {
    supportedModes: PowerMode[];
    mode: PowerMode | null;
    pct: number | null;
  };
};

const toRackRow = (rack: RackSummary): RackRow => ({
  id: rack.id,
  name: rack.name,
  efficiencyWPerThs: toEfficiencyWPerThs(rack.powerW, rack.hashrateThs),
  powerKw: wToKw(rack.powerW),
  hashratePhs: thsToPhs(rack.hashrateThs),
});

/** Renames `empty` to `disconnected`, the key `MinersActivityChart` reads for empty sockets. */
export const toStatusTileCounts = ({
  empty,
  ...statuses
}: MinerStatusCounts): StatusTileCounts => ({
  ...statuses,
  disconnected: empty,
});

/** Shapes one container of `GET /api/containers` for its Site Overview card. */
export const toContainerCard = (container: ContainerSummary): ContainerCard => ({
  id: container.id,
  name: container.name,
  model: container.model,
  powerKw: wToKw(container.powerW),
  efficiencyWPerThs: toEfficiencyWPerThs(container.powerW, container.hashrateThs),
  hashratePhs: thsToPhs(container.hashrateThs),
  racks: container.racks.map(toRackRow),
  statusCounts: toStatusTileCounts(container.minerStatus),
  power: {
    supportedModes: container.supportedPowerModes,
    mode: container.powerMode,
    pct: container.powerPct,
  },
});

/** Miners in a container, counting every socket that holds one (not the empty ones). */
export const countMiners = ({ empty: _empty, ...statuses }: MinerStatusCounts): number =>
  Object.values(statuses).reduce((total, count) => total + count, 0);
