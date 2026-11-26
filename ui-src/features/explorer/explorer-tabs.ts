export const TABS = { RACKS: "racks", MINERS: "miners" } as const;
export type Tab = (typeof TABS)[keyof typeof TABS];

export const isTab = (value: string): value is Tab => value === TABS.RACKS || value === TABS.MINERS;

/** What each tab's search matches: the racks list carries no miners, so no serials or IPs. */
export const SEARCH_PLACEHOLDERS: Record<Tab, string> = {
  [TABS.RACKS]: "Search racks, containers",
  [TABS.MINERS]: "Search serials, IPs, positions",
};

/** The query parameter that keeps the open tab, so a reload or a shared link opens it again. */
export const TAB_PARAM = "tab";

/** The tab the Explorer opens on when the URL names none; it is left out of the URL. */
export const DEFAULT_TAB: Tab = TABS.RACKS;

/** The tab a URL asks for: the default when it names none, or one that does not exist. */
export const tabOf = (params: URLSearchParams): Tab => {
  const value = params.get(TAB_PARAM);
  return value !== null && isTab(value) ? value : DEFAULT_TAB;
};

/** The URL's params with `tab` open, the others kept; the default tab leaves the param out. */
export const withTab = (params: URLSearchParams, tab: Tab): URLSearchParams => {
  const next = new URLSearchParams(params);
  if (tab === DEFAULT_TAB) next.delete(TAB_PARAM);
  else next.set(TAB_PARAM, tab);
  return next;
};
