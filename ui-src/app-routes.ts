import { generatePath } from "react-router";

/**
 * Paths of the app's pages, relative to where the dashboard mounts the app
 * (`/app/<installed name>/`). Navigate with relative links, or prefix with
 * `useMdkApp().name`; never hardcode the installed name.
 */
export const APP_PATHS = {
  DASHBOARD: "",
  SITE_OVERVIEW: "site-overview",
  SITE_EFFICIENCY: "site-efficiency",
  EXPLORER: "explorer",
  CONTAINER_DETAIL: "explorer/containers/:id/:tab?",
} as const;

/**
 * Link to a container's detail page from a top-level page (Site Overview,
 * Explorer), for `relative="path"` navigation: `..` leaves the page's own
 * segment for the app root, so the link never names the installed app. Without
 * a tab, the page opens on its default tab.
 */
export const containerDetailLink = (containerId: string): string =>
  `../${generatePath(APP_PATHS.CONTAINER_DETAIL, { id: containerId })}`;

/** The container detail page's tabs, as their `:tab` path segment. */
export const CONTAINER_TABS = {
  LAYOUT: "layout",
  POWER_ADJUSTMENT: "power-adjustment",
  CHARTS: "charts",
  HEATMAP: "heatmap",
} as const;
export type ContainerTab = (typeof CONTAINER_TABS)[keyof typeof CONTAINER_TABS];

const CONTAINER_TAB_VALUES: readonly string[] = Object.values(CONTAINER_TABS);

export const isContainerTab = (value: string | undefined): value is ContainerTab =>
  value !== undefined && CONTAINER_TAB_VALUES.includes(value);

/**
 * Links from the container detail page, for `relative="route"` navigation:
 * `..` leaves the whole detail route (whatever its `:id` and `:tab`) for the
 * app root, so the link never names the installed app.
 */
export const FROM_CONTAINER_DETAIL = {
  explorer: `../${APP_PATHS.EXPLORER}`,
  tab: (containerId: string, tab: ContainerTab): string =>
    `../${generatePath(APP_PATHS.CONTAINER_DETAIL, { id: containerId, tab })}`,
};
