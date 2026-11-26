import { Pagination, Typography } from "@tetherto/mdk-react-devkit";

import { formatFixed } from "../../lib/units";

type ExplorerTableFooterProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

/**
 * "Showing 1-10 of 16" and the page buttons under an Explorer table. Nothing
 * when there are no rows: the table's empty state says so on its own.
 */
export const ExplorerTableFooter = ({
  page,
  pageSize,
  total,
  onPageChange,
}: ExplorerTableFooterProps) => {
  if (total === 0) return null;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="op-centre-lite-explorer__footer">
      <Typography variant="secondary" size="sm">
        Showing {formatFixed(first, 0)}-{formatFixed(last, 0)} of {formatFixed(total, 0)}
      </Typography>
      <Pagination
        current={page}
        pageSize={pageSize}
        total={total}
        showSizeChanger={false}
        onChange={(next) => onPageChange(next)}
      />
    </div>
  );
};
