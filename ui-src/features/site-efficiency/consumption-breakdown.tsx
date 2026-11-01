import { Card, DataTable, type DataTableColumnDef, Typography } from "@tetherto/mdk-react-devkit";

import { formatPercent, formatPowerKw } from "../../lib/units";
import type { BreakdownSlice } from "./site-efficiency-shape";

// DataTable sets each column's width to its `size` (150px by default); a small
// size lets the columns share the card width.
const COLUMN_SIZE = 1;

const Swatch = ({ slice }: { slice: BreakdownSlice }) => (
  <span
    className="op-centre-lite-breakdown__swatch"
    data-series={slice.colorIndex ?? "rest"}
    aria-hidden="true"
  />
);

const COLUMNS: DataTableColumnDef<BreakdownSlice>[] = [
  {
    accessorKey: "name",
    header: "Meter",
    size: COLUMN_SIZE,
    cell: ({ row }) => (
      <span className="op-centre-lite-breakdown__name">
        <Swatch slice={row.original} />
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "powerKw",
    header: "Consumption",
    size: COLUMN_SIZE,
    cell: ({ row }) => formatPowerKw(row.original.powerKw),
  },
  {
    accessorKey: "sharePct",
    header: "% of total",
    size: COLUMN_SIZE,
    cell: ({ row }) => formatPercent(row.original.sharePct),
  },
];

type ConsumptionBreakdownProps = { slices: BreakdownSlice[] };

/** How the site's consumption splits between its meters: one bar, then the numbers. */
export const ConsumptionBreakdown = ({ slices }: ConsumptionBreakdownProps) => (
  <Card className="op-centre-lite-breakdown">
    <Card.Header>
      <Typography size="md" weight="semibold">
        Consumption breakdown
      </Typography>
    </Card.Header>
    <Card.Body className="op-centre-lite-breakdown__body">
      <div
        className="op-centre-lite-breakdown__bar"
        role="img"
        aria-label="Share of consumption per meter"
      >
        {slices.map((slice) => (
          <span
            key={slice.id}
            className="op-centre-lite-breakdown__segment"
            data-series={slice.colorIndex ?? "rest"}
            style={{ flexGrow: slice.sharePct }}
            title={`${slice.name}: ${formatPercent(slice.sharePct)}`}
          />
        ))}
      </div>
      <DataTable<BreakdownSlice>
        data={slices}
        columns={COLUMNS}
        getRowId={(slice) => slice.id}
        enablePagination={false}
        tableClassName="op-centre-lite-breakdown__table"
      />
    </Card.Body>
  </Card>
);
