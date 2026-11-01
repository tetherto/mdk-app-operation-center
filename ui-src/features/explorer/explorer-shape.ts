import type { ContainerSummary, Miner, MinerStatus } from "../../api/contract";
import { thsToPhs, toEfficiencyWPerThs, wToKw } from "../../lib/units";

/** What the Explorer toolbar narrows both tabs to. */
export type ExplorerFilter = {
  search: string;
  /** Undefined for every container. */
  containerId: string | undefined;
};

/** One row of the Racks tab, in display units. */
export type RackExplorerRow = {
  id: string;
  name: string;
  containerId: string;
  containerName: string;
  /** W per TH/s; undefined while the rack has no hashrate. */
  efficiencyWPerThs: number | undefined;
  hashratePhs: number;
  powerKw: number;
};

/** One row of the Miners tab. A miner's values stay in TH/s and W: PH/s and kW round them away. */
export type MinerExplorerRow = {
  id: string;
  serial: string;
  ip: string;
  containerId: string;
  containerName: string;
  position: string;
  status: MinerStatus;
  /** W per TH/s; undefined while the miner has no hashrate. */
  efficiencyWPerThs: number | undefined;
  hashrateThs: number;
  powerW: number;
};

export type ContainerOption = { id: string; name: string };

export const toContainerOptions = (containers: ContainerSummary[]): ContainerOption[] =>
  containers.map(({ id, name }) => ({ id, name }));

/** Every rack of every container, in container order. */
export const toRackRows = (containers: ContainerSummary[]): RackExplorerRow[] =>
  containers.flatMap((container) =>
    container.racks.map((rack) => ({
      id: rack.id,
      name: rack.name,
      containerId: container.id,
      containerName: container.name,
      efficiencyWPerThs: toEfficiencyWPerThs(rack.powerW, rack.hashrateThs),
      hashratePhs: thsToPhs(rack.hashrateThs),
      powerKw: wToKw(rack.powerW),
    })),
  );

/**
 * The racks the filter keeps: in the container, and with the search in the
 * rack or container name (case-insensitive). The racks list carries no miners,
 * so a serial or IP only matches on the Miners tab.
 */
export const filterRackRows = (
  rows: RackExplorerRow[],
  { search, containerId }: ExplorerFilter,
): RackExplorerRow[] => {
  const needle = search.trim().toLowerCase();
  return rows.filter(
    (row) =>
      (containerId === undefined || row.containerId === containerId) &&
      (needle === "" ||
        row.name.toLowerCase().includes(needle) ||
        row.containerName.toLowerCase().includes(needle)),
  );
};

/** Names a miner's container by id; the miners route only sends the id. */
export const toMinerRow = (
  miner: Miner,
  containerNames: ReadonlyMap<string, string>,
): MinerExplorerRow => ({
  id: miner.id,
  serial: miner.serial,
  ip: miner.ip,
  containerId: miner.containerId,
  containerName: containerNames.get(miner.containerId) ?? miner.containerId,
  position: miner.position,
  status: miner.status,
  efficiencyWPerThs: toEfficiencyWPerThs(miner.powerW, miner.hashrateThs),
  hashrateThs: miner.hashrateThs,
  powerW: miner.powerW,
});

/** The rows of one 1-based page. */
export const pageOf = <Row>(rows: Row[], page: number, pageSize: number): Row[] =>
  rows.slice((page - 1) * pageSize, page * pageSize);
