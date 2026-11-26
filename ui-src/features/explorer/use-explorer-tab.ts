import { useSearchParams } from "react-router";

import { isTab, type Tab, tabOf, withTab } from "./explorer-tabs";

/**
 * The Explorer's open tab, kept in the URL (`?tab=miners`) so a reload or a
 * shared link opens it again. Switching replaces the history entry instead of
 * pushing one: Back leaves the Explorer rather than stepping through its tabs.
 * The setter takes the Tabs component's value and ignores one that is no tab.
 */
export const useExplorerTab = (): [tab: Tab, setTab: (next: string) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setTab = (next: string) => {
    if (isTab(next)) setSearchParams((current) => withTab(current, next), { replace: true });
  };
  return [tabOf(searchParams), setTab];
};
