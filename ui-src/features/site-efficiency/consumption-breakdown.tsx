import { DataTable, type DataTableColumnDef } from "@tetherto/mdk-react-devkit";

import { DISPLAY_FRACTION_DIGITS, formatFixed } from "../../lib/units";
import { type BreakdownRow, type BreakdownSlice, SITE_TOTAL_ROW_ID } from "./site-efficiency-shape";

const DIGITS = DISPLAY_FRACTION_DIGITS.BREAKDOWN;

const formatShare = (pct: number): string => `${formatFixed(pct, DIGITS)}%`;

// DataTable sets each column's width to its `size` (150px by default); a small
// size lets the columns share the width. The rows follow the bar's order, so
// the table does not sort.
const COLUMN_DEFAULTS = { size: 1, enableSorting: false } as const;
const NUMBER_COLUMN = { ...COLUMN_DEFAULTS, meta: { align: "right" } } as const;

const COLUMNS: DataTableColumnDef<BreakdownRow>[] = [
  {
    accessorKey: "source",
    header: "Source",
    ...COLUMN_DEFAULTS,
    cell: ({ row }) => (
      <span
        className="op-centre-lite-breakdown__source"
        data-total={row.original.id === SITE_TOTAL_ROW_ID}
      >
        <span
          className="op-centre-lite-series-swatch"
          data-series={row.original.series}
          aria-hidden="true"
        />
        {row.original.source}
      </span>
    ),
  },
  {
    accessorKey: "powerKw",
    header: "Consumption (kW)",
    ...NUMBER_COLUMN,
    cell: ({ row }) => formatFixed(row.original.powerKw, DIGITS),
  },
  {
    accessorKey: "sharePct",
    header: "% of total",
    ...NUMBER_COLUMN,
    cell: ({ row }) => formatShare(row.original.sharePct),
  },
];

type ConsumptionBreakdownProps = { slices: BreakdownSlice[]; rows: BreakdownRow[] };

/**
 * How the site's consumption splits between its meters: one bar with each
 * meter's name and share inside its segment, then the site meter's total and
 * each meter's numbers.
 */
export const ConsumptionBreakdown = ({ slices, rows }: ConsumptionBreakdownProps) => (
  <div className="op-centre-lite-breakdown">
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
          title={`${slice.name}: ${formatShare(slice.sharePct)}`}
        >
          <span className="op-centre-lite-breakdown__segment-label" aria-hidden="true">
            <span>{slice.name}</span>
            <span>{formatShare(slice.sharePct)}</span>
          </span>
        </span>
      ))}
    </div>
    <DataTable<BreakdownRow>
      data={rows}
      columns={COLUMNS}
      getRowId={(row) => row.id}
      enablePagination={false}
      tableClassName="op-centre-lite-breakdown__table"
    />
  </div>
);
