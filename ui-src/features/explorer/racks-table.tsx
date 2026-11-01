import type { DataTableColumnDef } from "@tetherto/mdk-react-devkit";

import { type CsvColumn, csvNumber } from "../../lib/csv";
import {
  DISPLAY_FRACTION_DIGITS,
  DISPLAY_UNITS,
  formatEfficiency,
  formatHashratePhs,
  formatPowerKw,
} from "../../lib/units";
import type { RackExplorerRow } from "./explorer-shape";
import { COLUMN_SIZE, ExplorerTable } from "./explorer-table";

const COLUMNS: DataTableColumnDef<RackExplorerRow>[] = [
  { accessorKey: "name", header: "Rack", size: COLUMN_SIZE },
  { accessorKey: "containerName", header: "Container", size: COLUMN_SIZE },
  {
    accessorKey: "efficiencyWPerThs",
    header: "Efficiency",
    size: COLUMN_SIZE,
    cell: ({ row }) => formatEfficiency(row.original.efficiencyWPerThs),
  },
  {
    accessorKey: "hashratePhs",
    header: "Hash rate",
    size: COLUMN_SIZE,
    cell: ({ row }) => formatHashratePhs(row.original.hashratePhs),
  },
  {
    accessorKey: "powerKw",
    header: "Consumption",
    size: COLUMN_SIZE,
    cell: ({ row }) => formatPowerKw(row.original.powerKw),
  },
];

/** The Racks tab's CSV: the table's columns, as numbers in the units the headers name. */
export const RACK_CSV_COLUMNS: CsvColumn<RackExplorerRow>[] = [
  { header: "Rack", value: (row) => row.name },
  { header: "Container", value: (row) => row.containerName },
  {
    header: `Efficiency (${DISPLAY_UNITS.EFFICIENCY_CARD})`,
    value: (row) => csvNumber(row.efficiencyWPerThs, DISPLAY_FRACTION_DIGITS.EFFICIENCY),
  },
  {
    header: `Hash rate (${DISPLAY_UNITS.HASHRATE})`,
    value: (row) => csvNumber(row.hashratePhs, DISPLAY_FRACTION_DIGITS.HASHRATE),
  },
  {
    header: `Consumption (${DISPLAY_UNITS.POWER_KW})`,
    value: (row) => csvNumber(row.powerKw, DISPLAY_FRACTION_DIGITS.POWER_KW),
  },
];

type RacksTableProps = {
  rows: RackExplorerRow[];
  onRowClick: (row: RackExplorerRow) => void;
};

export const RacksTable = ({ rows, onRowClick }: RacksTableProps) => (
  <ExplorerTable columns={COLUMNS} rows={rows} onRowClick={onRowClick} />
);
