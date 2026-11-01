import { DataTable, type DataTableColumnDef } from "@tetherto/mdk-react-devkit";
import { useMemo } from "react";

// DataTable sets each column's width to its `size` (150px by default); a small
// size lets the columns share the table width instead.
export const COLUMN_SIZE = 1;

/** The ">" at the end of a clickable Explorer row. */
const RowChevron = () => (
  <svg
    className="op-centre-lite-explorer__chevron"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

type ExplorerTableProps<Row> = {
  columns: DataTableColumnDef<Row>[];
  rows: Row[];
  /** True while the rows are the previous page's and the next loads. */
  loading?: boolean;
  onRowClick: (row: Row) => void;
};

/** One page of Explorer rows: the given columns, then a chevron, and every row clickable. */
export const ExplorerTable = <Row extends { id: string }>({
  columns,
  rows,
  loading = false,
  onRowClick,
}: ExplorerTableProps<Row>) => {
  const withChevron = useMemo<DataTableColumnDef<Row>[]>(
    () => [...columns, { id: "open", header: "", size: COLUMN_SIZE, cell: () => <RowChevron /> }],
    [columns],
  );
  return (
    <DataTable<Row>
      data={rows}
      columns={withChevron}
      getRowId={(row) => row.id}
      enablePagination={false}
      loading={loading}
      onRowClick={onRowClick}
      tableClassName="op-centre-lite-explorer__table"
    />
  );
};
