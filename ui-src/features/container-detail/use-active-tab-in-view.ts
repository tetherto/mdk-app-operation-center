import { useLayoutEffect, useRef } from "react";

type HorizontalBox = { getBoundingClientRect: () => { left: number; right: number } };

/** What the scroll needs of a tab strip; an `HTMLElement` is one. */
type TabStrip = HorizontalBox & {
  scrollLeft: number;
  querySelector: (selector: string) => HorizontalBox | null;
};

/** Scrolls a tab strip just enough to show its active tab in full; does nothing when it already shows. */
export const scrollActiveTabIntoView = (list: TabStrip) => {
  const active = list.querySelector('[data-state="active"]');
  if (!active) return;

  const strip = list.getBoundingClientRect();
  const tab = active.getBoundingClientRect();

  if (tab.left < strip.left) {
    list.scrollLeft -= strip.left - tab.left;
  } else if (tab.right > strip.right) {
    list.scrollLeft += tab.right - strip.right;
  }
};

/**
 * Keeps the active tab inside its tab strip's visible width. On a phone the
 * container page's tabs are one row that scrolls sideways, and a tab opened
 * from a link (`.../heatmap`) would otherwise sit past the strip's right edge.
 * Where the strip does not scroll, this changes nothing. `shown` reruns it once
 * the strip renders (the page shows a spinner first).
 *
 * `activeTab` is never read: it is there only to rerun the effect when the tab
 * changes. The active tab itself is found by its `data-state="active"`.
 */
export const useActiveTabInView = (activeTab: string, shown: boolean) => {
  const listRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    scrollActiveTabIntoView(list);
  }, [activeTab, shown]);

  return listRef;
};
