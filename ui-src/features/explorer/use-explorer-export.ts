import { useMdkApp } from "@tetherto/mdk-react-adapter";
import { useState } from "react";

import { API_ROUTES } from "../../api/routes";
import { downloadCsv, toCsv } from "../../lib/csv";
import { type ExplorerFilter, type RackExplorerRow, toMinerRow } from "./explorer-shape";
import { type Tab, TABS } from "./explorer-tabs";
import { fetchAllMiners } from "./miners-request";
import { MINER_CSV_COLUMNS } from "./miners-table";
import { RACK_CSV_COLUMNS } from "./racks-table";

type ExplorerExportInput = {
  tab: Tab;
  /** The racks the filter keeps, already all here. */
  racks: RackExplorerRow[];
  /** The filter the Miners tab shows; its miners are fetched on export. */
  minersFilter: ExplorerFilter;
  containerNames: ReadonlyMap<string, string>;
};

export type ExplorerExport = {
  exportCsv: () => void;
  exporting: boolean;
  /** Set when the last export failed. */
  error: string | undefined;
};

/** Exports every row the tab's filter matches as CSV, not only the page on screen. */
export const useExplorerExport = ({
  tab,
  racks,
  minersFilter,
  containerNames,
}: ExplorerExportInput): ExplorerExport => {
  const { apiUrl } = useMdkApp();
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const exportMiners = async () => {
    setExporting(true);
    try {
      const miners = await fetchAllMiners(apiUrl(API_ROUTES.MINERS), minersFilter);
      const rows = miners.map((miner) => toMinerRow(miner, containerNames));
      downloadCsv("miners.csv", toCsv(MINER_CSV_COLUMNS, rows));
    } catch {
      setError("Could not export the miners. Try again.");
    } finally {
      setExporting(false);
    }
  };

  const exportCsv = () => {
    setError(undefined);
    if (tab === TABS.RACKS) {
      downloadCsv("racks.csv", toCsv(RACK_CSV_COLUMNS, racks));
      return;
    }
    void exportMiners();
  };

  return { exportCsv, exporting, error };
};
