import type { ExplorerFilter } from "./explorer-shape";
import { type Tab, TABS } from "./explorer-tabs";

/**
 * The Explorer's open tab and filters. Each tab keeps its own search (they match
 * different things); the container filter is shared, as both lists narrow to a
 * container the same way.
 */
export type ExplorerFilters = {
  tab: Tab;
  searches: Record<Tab, string>;
  /** Undefined for every container. */
  containerId: string | undefined;
};

export type ExplorerFiltersAction =
  | { type: "tab"; tab: Tab }
  /** The toolbar's filter changed, on the open tab. */
  | { type: "filter"; filter: ExplorerFilter };

export const INITIAL_EXPLORER_FILTERS: ExplorerFilters = {
  tab: TABS.RACKS,
  searches: { [TABS.RACKS]: "", [TABS.MINERS]: "" },
  containerId: undefined,
};

export const explorerFiltersReducer = (
  state: ExplorerFilters,
  action: ExplorerFiltersAction,
): ExplorerFilters => {
  if (action.type === "tab") return { ...state, tab: action.tab };
  return {
    ...state,
    searches: { ...state.searches, [state.tab]: action.filter.search },
    containerId: action.filter.containerId,
  };
};

/** What a tab's list is filtered by: its own search and the shared container. */
export const filterOf = (state: ExplorerFilters, tab: Tab): ExplorerFilter => ({
  search: state.searches[tab],
  containerId: state.containerId,
});
