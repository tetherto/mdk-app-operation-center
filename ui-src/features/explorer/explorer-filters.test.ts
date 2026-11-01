import { describe, expect, it } from "vitest";

import {
  explorerFiltersReducer,
  type ExplorerFilters,
  filterOf,
  INITIAL_EXPLORER_FILTERS,
} from "./explorer-filters";
import { TABS } from "./explorer-tabs";

const apply = (...actions: Parameters<typeof explorerFiltersReducer>[1][]): ExplorerFilters =>
  actions.reduce(explorerFiltersReducer, INITIAL_EXPLORER_FILTERS);

describe("explorerFiltersReducer", () => {
  it("opens on Racks with no search and every container", () => {
    expect(filterOf(INITIAL_EXPLORER_FILTERS, TABS.RACKS)).toEqual({
      search: "",
      containerId: undefined,
    });
    expect(INITIAL_EXPLORER_FILTERS.tab).toBe(TABS.RACKS);
  });

  it("keeps a separate search per tab", () => {
    const state = apply(
      { type: "filter", filter: { search: "rack 1", containerId: undefined } },
      { type: "tab", tab: TABS.MINERS },
      { type: "filter", filter: { search: "10.0.0.7", containerId: undefined } },
    );

    expect(filterOf(state, TABS.RACKS).search).toBe("rack 1");
    expect(filterOf(state, TABS.MINERS).search).toBe("10.0.0.7");
  });

  it("brings a tab's search back when the tab is reopened", () => {
    const state = apply(
      { type: "filter", filter: { search: "rack 1", containerId: undefined } },
      { type: "tab", tab: TABS.MINERS },
      { type: "tab", tab: TABS.RACKS },
    );

    expect(state.tab).toBe(TABS.RACKS);
    expect(filterOf(state, TABS.RACKS).search).toBe("rack 1");
    expect(filterOf(state, TABS.MINERS).search).toBe("");
  });

  it("shares the container between the tabs", () => {
    const state = apply(
      { type: "filter", filter: { search: "", containerId: "container-2" } },
      { type: "tab", tab: TABS.MINERS },
    );

    expect(filterOf(state, TABS.RACKS).containerId).toBe("container-2");
    expect(filterOf(state, TABS.MINERS).containerId).toBe("container-2");
  });
});
