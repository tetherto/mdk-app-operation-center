import { DataTable, type DataTableColumnDef } from "@tetherto/mdk-react-devkit";

import { formatEfficiency, formatHashratePhs, formatPowerKw } from "../../lib/units";
import type { RackRow } from "./container-card-shape";

// DataTable sets each column's width to its `size` (150px by default), so four
// default columns overflow a card. A small size lets them share the card width.
const COLUMN_SIZE = 1;

const COLUMNS: DataTableColumnDef<RackRow>[] = [
  { accessorKey: "name", header: "Rack", size: COLUMN_SIZE },
  {
    accessorKey: "efficiencyWPerThs",
    header: "Efficiency",
    size: COLUMN_SIZE,
    cell: ({ row }) => formatEfficiency(row.original.efficiencyWPerThs),
  },
  {
    accessorKey: "powerKw",
    header: "Consumption",
    size: COLUMN_SIZE,
    cell: ({ row }) => formatPowerKw(row.original.powerKw),
  },
  {
    accessorKey: "hashratePhs",
    header: "Hash rate",
    size: COLUMN_SIZE,
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
