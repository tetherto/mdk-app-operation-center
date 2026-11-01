export const TABS = { RACKS: "racks", MINERS: "miners" } as const;
export type Tab = (typeof TABS)[keyof typeof TABS];

export const isTab = (value: string): value is Tab => value === TABS.RACKS || value === TABS.MINERS;

/** What each tab's search matches: the racks list carries no miners, so no serials or IPs. */
export const SEARCH_PLACEHOLDERS: Record<Tab, string> = {
  [TABS.RACKS]: "Search racks, containers",
  [TABS.MINERS]: "Search serials, IPs, positions",
};
