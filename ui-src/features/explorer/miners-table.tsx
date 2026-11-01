import type { DataTableColumnDef } from "@tetherto/mdk-react-devkit";

import { type CsvColumn, csvNumber } from "../../lib/csv";
import { MINER_STATUS_LABELS } from "../../lib/miner-status";
import {
  DISPLAY_FRACTION_DIGITS,
  DISPLAY_UNITS,
  formatEfficiency,
  formatHashrateThs,
  formatPowerW,
} from "../../lib/units";
import type { MinerExplorerRow } from "./explorer-shape";
import { COLUMN_SIZE, ExplorerTable } from "./explorer-table";

const COLUMNS: DataTableColumnDef<MinerExplorerRow>[] = [
  { accessorKey: "serial", header: "Serial", size: COLUMN_SIZE },
  { accessorKey: "ip", header: "IP", size: COLUMN_SIZE },
  { accessorKey: "containerName", header: "Container", size: COLUMN_SIZE },
  { accessorKey: "position", header: "Position", size: COLUMN_SIZE },
  {
    accessorKey: "status",
    header: "Status",
    size: COLUMN_SIZE,
    cell: ({ row }) => MINER_STATUS_LABELS[row.original.status],
  },
  {
    accessorKey: "efficiencyWPerThs",
    header: "Efficiency",
    size: COLUMN_SIZE,
    cell: ({ row }) => formatEfficiency(row.original.efficiencyWPerThs),
  },
  {
    accessorKey: "hashrateThs",
    header: "Hash rate",
    size: COLUMN_SIZE,
    cell: ({ row }) => formatHashrateThs(row.original.hashrateThs),
  },
  {
    accessorKey: "powerW",
    header: "Consumption",
    size: COLUMN_SIZE,
    cell: ({ row }) => formatPowerW(row.original.powerW),
  },
];

/** The Miners tab's CSV: the table's columns, as numbers in the units the headers name. */
export const MINER_CSV_COLUMNS: CsvColumn<MinerExplorerRow>[] = [
  { header: "Serial", value: (row) => row.serial },
  { header: "IP", value: (row) => row.ip },
  { header: "Container", value: (row) => row.containerName },
  { header: "Position", value: (row) => row.position },
  { header: "Status", value: (row) => MINER_STATUS_LABELS[row.status] },
  {
    header: `Efficiency (${DISPLAY_UNITS.EFFICIENCY_CARD})`,
    value: (row) => csvNumber(row.efficiencyWPerThs, DISPLAY_FRACTION_DIGITS.EFFICIENCY),
  },
  {
    header: `Hash rate (${DISPLAY_UNITS.HASHRATE_TH})`,
    value: (row) => csvNumber(row.hashrateThs, DISPLAY_FRACTION_DIGITS.HASHRATE_TH),
  },
  {
    header: `Consumption (${DISPLAY_UNITS.POWER_W})`,
    value: (row) => csvNumber(row.powerW, DISPLAY_FRACTION_DIGITS.POWER_W),
  },
];

type MinersTableProps = {
  rows: MinerExplorerRow[];
  loading: boolean;
  onRowClick: (row: MinerExplorerRow) => void;
};

export const MinersTable = ({ rows, loading, onRowClick }: MinersTableProps) => (
  <ExplorerTable columns={COLUMNS} rows={rows} loading={loading} onRowClick={onRowClick} />
);
