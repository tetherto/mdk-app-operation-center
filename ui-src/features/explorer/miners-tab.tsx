import { ErrorCard, Spinner } from "@tetherto/mdk-react-devkit";
import { useMemo } from "react";

import { ExplorerTableFooter } from "./explorer-table-footer";
import { type ExplorerFilter, type MinerExplorerRow, toMinerRow } from "./explorer-shape";
import { MinersTable } from "./miners-table";
import { useExplorerMiners } from "./use-explorer-miners";

type MinersTabProps = {
  filter: ExplorerFilter;
  containerNames: ReadonlyMap<string, string>;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowClick: (row: MinerExplorerRow) => void;
};

/** The miners the filter matches, one page at a time from the miners route. */
export const MinersTab = ({
  filter,
  containerNames,
  page,
  pageSize,
  onPageChange,
  onRowClick,
}: MinersTabProps) => {
  const view = useExplorerMiners(filter, page, pageSize);
  // Shaped once per response: `view` is rebuilt every render, its miners are not.
  const miners = view.status === "ready" ? view.miners : undefined;
  const rows = useMemo(
    () => (miners ?? []).map((miner) => toMinerRow(miner, containerNames)),
    [miners, containerNames],
  );

  if (view.status === "loading") return <Spinner type="circle" />;
  if (view.status === "error") {
    return <ErrorCard title="Could not load the miners" error={view.message} />;
  }
  return (
    <>
      <MinersTable rows={rows} loading={view.stale} onRowClick={onRowClick} />
      <ExplorerTableFooter
        page={page}
        pageSize={pageSize}
        total={view.total}
        onPageChange={onPageChange}
      />
    </>
  );
};
