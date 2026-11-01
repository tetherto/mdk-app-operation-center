import { describe, expect, it } from "vitest";

import {
  CONTAINER_TABS,
  containerDetailLink,
  FROM_CONTAINER_DETAIL,
  isContainerTab,
} from "./app-routes";

describe("containerDetailLink", () => {
  it("links from a top-level page to the container detail page, without a tab", () => {
    expect(containerDetailLink("container-1")).toBe("../explorer/containers/container-1");
  });

  it("encodes ids that are not URL-safe", () => {
    expect(containerDetailLink("a/b c")).toBe("../explorer/containers/a%2Fb%20c");
  });
});

describe("FROM_CONTAINER_DETAIL", () => {
  it("links to a tab of the same page from the app root", () => {
    expect(FROM_CONTAINER_DETAIL.tab("container-1", CONTAINER_TABS.HEATMAP)).toBe(
      "../explorer/containers/container-1/heatmap",
    );
  });

  it("links back to Explorer from the app root", () => {
    expect(FROM_CONTAINER_DETAIL.explorer).toBe("../explorer");
  });
});

describe("isContainerTab", () => {
  it("accepts the tab segments and nothing else", () => {
    expect(isContainerTab("layout")).toBe(true);
    expect(isContainerTab("settings")).toBe(false);
    expect(isContainerTab(undefined)).toBe(false);
  });
});
