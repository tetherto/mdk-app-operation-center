import type { ExplorerFilter } from "./explorer-shape";
import { type Tab, TABS } from "./explorer-tabs";

/**
 * The Explorer's filters (the open tab is in the URL). Each tab keeps its own
 * search (they match different things); the container filter is shared, as
 * both lists narrow to a container the same way.
 */
export type ExplorerFilters = {
  searches: Record<Tab, string>;
  /** Undefined for every container. */
  containerId: string | undefined;
};

/** The toolbar's filter changed, on the tab that shows it. */
export type ExplorerFiltersAction = { tab: Tab; filter: ExplorerFilter };

export const INITIAL_EXPLORER_FILTERS: ExplorerFilters = {
  searches: { [TABS.RACKS]: "", [TABS.MINERS]: "" },
  containerId: undefined,
};

export const explorerFiltersReducer = (
  state: ExplorerFilters,
  action: ExplorerFiltersAction,
): ExplorerFilters => ({
  ...state,
  searches: { ...state.searches, [action.tab]: action.filter.search },
  containerId: action.filter.containerId,
});

/** What a tab's list is filtered by: its own search and the shared container. */
export const filterOf = (state: ExplorerFilters, tab: Tab): ExplorerFilter => ({
  search: state.searches[tab],
  containerId: state.containerId,
});
