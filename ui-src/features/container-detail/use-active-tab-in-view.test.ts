import { describe, expect, it } from "vitest";

import { scrollActiveTabIntoView } from "./use-active-tab-in-view";

type Span = { left: number; right: number };

/** A tab strip from `left` to `right`, scrolled by `scrollLeft`, with its active tab at `tab` (none when undefined). */
const stubStrip = (strip: Span, tab: Span | undefined, scrollLeft = 0) => {
  const active = tab ? { getBoundingClientRect: () => tab } : null;
  return {
    scrollLeft,
    getBoundingClientRect: () => strip,
    querySelector: (selector: string) => (selector === '[data-state="active"]' ? active : null),
  };
};

describe("scrollActiveTabIntoView", () => {
  const STRIP = { left: 0, right: 300 };

  it("scrolls right just far enough to show a tab past the strip's right edge", () => {
    const list = stubStrip(STRIP, { left: 260, right: 360 }, 40);

    scrollActiveTabIntoView(list);

    expect(list.scrollLeft).toBe(100);
  });

  it("scrolls left just far enough to show a tab past the strip's left edge", () => {
    const list = stubStrip(STRIP, { left: -50, right: 50 }, 120);

    scrollActiveTabIntoView(list);

    expect(list.scrollLeft).toBe(70);
  });

  it("leaves the strip alone when the tab already shows in full", () => {
    const list = stubStrip(STRIP, { left: 100, right: 200 }, 30);

    scrollActiveTabIntoView(list);

    expect(list.scrollLeft).toBe(30);
  });

  it("leaves the strip alone when no tab is active", () => {
    const list = stubStrip(STRIP, undefined, 30);

    scrollActiveTabIntoView(list);

    expect(list.scrollLeft).toBe(30);
  });
});
