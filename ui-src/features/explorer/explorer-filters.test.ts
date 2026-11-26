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
  it("starts with no search and every container", () => {
    expect(filterOf(INITIAL_EXPLORER_FILTERS, TABS.RACKS)).toEqual({
      search: "",
      containerId: undefined,
    });
    expect(filterOf(INITIAL_EXPLORER_FILTERS, TABS.MINERS)).toEqual({
      search: "",
      containerId: undefined,
    });
  });

  it("keeps a separate search per tab", () => {
    const state = apply(
      { tab: TABS.RACKS, filter: { search: "rack 1", containerId: undefined } },
      { tab: TABS.MINERS, filter: { search: "10.0.0.7", containerId: undefined } },
    );

    expect(filterOf(state, TABS.RACKS).search).toBe("rack 1");
    expect(filterOf(state, TABS.MINERS).search).toBe("10.0.0.7");
  });

  it("leaves the other tab's search alone", () => {
    const state = apply({
      tab: TABS.RACKS,
      filter: { search: "rack 1", containerId: undefined },
    });

    expect(filterOf(state, TABS.MINERS).search).toBe("");
  });

  it("shares the container between the tabs", () => {
    const state = apply({
      tab: TABS.RACKS,
      filter: { search: "", containerId: "container-2" },
    });

    expect(filterOf(state, TABS.RACKS).containerId).toBe("container-2");
    expect(filterOf(state, TABS.MINERS).containerId).toBe("container-2");
  });
});
