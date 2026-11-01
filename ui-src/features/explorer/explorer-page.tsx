import {
  ErrorCard,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@tetherto/mdk-react-devkit";
import { useReducer } from "react";
import { useNavigate } from "react-router";

import { containerDetailLink } from "../../app-routes";
import { Page } from "../../components/page";
import { useDebouncedValue } from "../../lib/use-debounced-value";
import { usePageFor } from "../../lib/use-page-for";
import { explorerFiltersReducer, filterOf, INITIAL_EXPLORER_FILTERS } from "./explorer-filters";
import {
  type ContainerOption,
  type ExplorerFilter,
  filterRackRows,
  pageOf,
  type RackExplorerRow,
} from "./explorer-shape";
import { ExplorerTableFooter } from "./explorer-table-footer";
import { isTab, SEARCH_PLACEHOLDERS, TABS } from "./explorer-tabs";
import { ExplorerToolbar } from "./explorer-toolbar";
import { MinersTab } from "./miners-tab";
import { RacksTable } from "./racks-table";
import { useExplorerContainers } from "./use-explorer-containers";
import { useExplorerExport } from "./use-explorer-export";

const PAGE_SIZE = 10;
/** The miners route searches on the server: wait for a pause in typing before asking. */
const SEARCH_DEBOUNCE_MS = 300;

const filterKey = ({ search, containerId }: ExplorerFilter) =>
  JSON.stringify([search, containerId ?? null]);

type ExplorerTabsProps = {
  racks: RackExplorerRow[];
  containers: ContainerOption[];
  containerNames: ReadonlyMap<string, string>;
};

const ExplorerTabs = ({ racks: allRacks, containers, containerNames }: ExplorerTabsProps) => {
  const navigate = useNavigate();
  // The tab stays in state, not in `?tab=`: the scaffolded dashboard matches its
  // sidebar's active item on path + query, so any query unhighlights the page.
  const [filters, dispatch] = useReducer(explorerFiltersReducer, INITIAL_EXPLORER_FILTERS);
  const { tab } = filters;
  const filter = filterOf(filters, tab);
  const racksFilter = filterOf(filters, TABS.RACKS);

  // Only the typed search waits; a picked container applies at once.
  const search = useDebouncedValue(filterOf(filters, TABS.MINERS).search, SEARCH_DEBOUNCE_MS);
  const minersFilter: ExplorerFilter = { search, containerId: filters.containerId };

  // Each table goes back to its first page when the filter it shows changes:
  // the miners one only once the debounced search is the one fetched.
  const [racksPage, setRacksPage] = usePageFor(filterKey(racksFilter));
  const [minersPage, setMinersPage] = usePageFor(filterKey(minersFilter));

  const racks = filterRackRows(allRacks, racksFilter);
  const csvExport = useExplorerExport({ tab, racks, minersFilter, containerNames });

  const handleTabChange = (next: string) => {
    if (isTab(next)) dispatch({ type: "tab", tab: next });
  };

  const handleFilterChange = (next: ExplorerFilter) => {
    dispatch({ type: "filter", filter: next });
  };

  const openContainer = ({ containerId }: { containerId: string }) => {
    void navigate(containerDetailLink(containerId), { relative: "path" });
  };

  return (
    <Tabs variant="underline" value={tab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value={TABS.RACKS}>Racks</TabsTrigger>
        <TabsTrigger value={TABS.MINERS}>Miners</TabsTrigger>
      </TabsList>
      <div className="op-centre-lite-explorer">
        <ExplorerToolbar
          filter={filter}
          containers={containers}
          searchPlaceholder={SEARCH_PLACEHOLDERS[tab]}
          onFilterChange={handleFilterChange}
          onExport={csvExport.exportCsv}
          exporting={csvExport.exporting}
        />
        {csvExport.error === undefined ? null : (
          <ErrorCard title="Export failed" error={csvExport.error} />
        )}
        <TabsContent value={TABS.RACKS}>
          <RacksTable rows={pageOf(racks, racksPage, PAGE_SIZE)} onRowClick={openContainer} />
          <ExplorerTableFooter
            page={racksPage}
            pageSize={PAGE_SIZE}
            total={racks.length}
            onPageChange={setRacksPage}
          />
        </TabsContent>
        <TabsContent value={TABS.MINERS}>
          <MinersTab
            filter={minersFilter}
            containerNames={containerNames}
            page={minersPage}
            pageSize={PAGE_SIZE}
            onPageChange={setMinersPage}
            onRowClick={openContainer}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

/** Racks and miners of the site as tables: search, filter by container, page and export. */
export const ExplorerPage = () => {
  const view = useExplorerContainers();

  return (
    <Page title="Explorer">
      {view.status === "loading" ? <Spinner type="circle" /> : null}
      {view.status === "error" ? (
        <ErrorCard title="Could not load the containers" error={view.message} />
      ) : null}
      {view.status === "ready" ? (
        <ExplorerTabs
          racks={view.racks}
          containers={view.containers}
          containerNames={view.containerNames}
        />
      ) : null}
    </Page>
  );
};
