// @vitest-environment jsdom
import { act, cleanup } from "@testing-library/react";
import { useLocation } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { renderHookWithApp } from "../../test-utils/render";
import { useExplorerTab } from "./use-explorer-tab";

const useTabAndSearch = () => {
  const [tab, setTab] = useExplorerTab();
  return { tab, setTab, search: useLocation().search };
};

afterEach(() => {
  cleanup();
});

describe("useExplorerTab", () => {
  it("opens on the racks tab when the URL names none", () => {
    const { result } = renderHookWithApp(useTabAndSearch, { initialPath: "/explorer" });

    expect(result.current.tab).toBe("racks");
  });

  it("reads the tab from the URL, keeping the other params when it switches", () => {
    const { result } = renderHookWithApp(useTabAndSearch, {
      initialPath: "/explorer?tab=miners&keep=1",
    });
    expect(result.current.tab).toBe("miners");

    act(() => result.current.setTab("racks"));

    expect(result.current.tab).toBe("racks");
    expect(result.current.search).toBe("?keep=1");
  });

  it("ignores a value that is no tab", () => {
    const { result } = renderHookWithApp(useTabAndSearch, { initialPath: "/explorer?tab=miners" });

    act(() => result.current.setTab("heatmap"));

    expect(result.current.tab).toBe("miners");
    expect(result.current.search).toBe("?tab=miners");
  });
});
