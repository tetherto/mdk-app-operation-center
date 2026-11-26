import { DataTable, type DataTableColumnDef } from "@tetherto/mdk-react-devkit";

import { formatEfficiency, formatHashratePhs, formatPowerKw } from "../../lib/units";
import type { RackRow } from "./container-card-shape";

// DataTable sets each column's width to its `size` (150px by default), so four
// default columns overflow a card. A small size lets them share the card width.
// The whole card is the click target, so the headers do not sort either.
const COLUMN_SIZE = 1;
const COLUMN_DEFAULTS = { size: COLUMN_SIZE, enableSorting: false } as const;

const COLUMNS: DataTableColumnDef<RackRow>[] = [
  { accessorKey: "name", header: "Rack", ...COLUMN_DEFAULTS },
  {
    accessorKey: "efficiencyWPerThs",
    header: "Efficiency",
    ...COLUMN_DEFAULTS,
    cell: ({ row }) => formatEfficiency(row.original.efficiencyWPerThs),
  },
  {
    accessorKey: "powerKw",
    header: "Consumption",
    ...COLUMN_DEFAULTS,
    cell: ({ row }) => formatPowerKw(row.original.powerKw),
  },
  {
    accessorKey: "hashratePhs",
    header: "Hash rate",
    ...COLUMN_DEFAULTS,
    cell: ({ row }) => formatHashratePhs(row.original.hashratePhs),
  },
];

type RackTableProps = { racks: RackRow[] };

/** The racks of one container: efficiency, consumption and hash rate per rack. */
export const RackTable = ({ racks }: RackTableProps) => (
  <DataTable<RackRow>
    data={racks}
    columns={COLUMNS}
    getRowId={(rack) => rack.id}
    enablePagination={false}
    tableClassName="op-centre-lite-rack-table"
  />
);
