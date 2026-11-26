import { describe, expect, it } from "vitest";

import { DEFAULT_TAB, TAB_PARAM, TABS, tabOf, withTab } from "./explorer-tabs";

const params = (query: string) => new URLSearchParams(query);

describe("DEFAULT_TAB", () => {
  it("is Racks", () => {
    expect(DEFAULT_TAB).toBe(TABS.RACKS);
  });
});

describe("tabOf", () => {
  it("opens Racks when the URL names no tab", () => {
    expect(tabOf(params(""))).toBe(TABS.RACKS);
  });

  it("opens the tab the URL names", () => {
    expect(tabOf(params("tab=miners"))).toBe(TABS.MINERS);
    expect(tabOf(params("tab=racks"))).toBe(TABS.RACKS);
  });

  it("opens Racks for a tab that does not exist", () => {
    expect(tabOf(params("tab=pools"))).toBe(TABS.RACKS);
    expect(tabOf(params("tab="))).toBe(TABS.RACKS);
  });
});

describe("withTab", () => {
  it("names a tab other than Racks in the URL", () => {
    expect(withTab(params(""), TABS.MINERS).toString()).toBe("tab=miners");
  });

  it("leaves the param out for Racks, the default", () => {
    expect(withTab(params("tab=miners"), TABS.RACKS).has(TAB_PARAM)).toBe(false);
  });

  it("keeps the URL's other params", () => {
    expect(withTab(params("period=7d"), TABS.MINERS).toString()).toBe("period=7d&tab=miners");
  });

  it("does not change the params it is given", () => {
    const current = params("tab=miners");
    withTab(current, TABS.RACKS);
    expect(current.get(TAB_PARAM)).toBe("miners");
  });
});
