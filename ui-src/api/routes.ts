/**
 * The app's Gateway routes, relative to its mount. Resolve them with
 * `useMdkApp().apiUrl(...)`: the dashboard serves the app under the name the
 * operator installed it as, so the full URL is never hardcoded. The route table
 * the Gateway serves is plugin/mdk-plugin.json.
 */
export const API_ROUTES = {
  CONFIG: "/api/config",
  SITE_SUMMARY: "/api/site/summary",
  CONTAINERS: "/api/containers",
  HISTORY: "/api/history",
  POWER_METERS: "/api/power-meters",
  MINERS: "/api/miners",
  POWER_MODE: "/api/commands/power-mode",
  POWER_PCT: "/api/commands/power-pct",
} as const;

export const containerLayoutRoute = (containerId: string): string =>
  `/api/containers/${encodeURIComponent(containerId)}/layout`;

export const minerLogsRoute = (minerId: string): string =>
  `/api/miners/${encodeURIComponent(minerId)}/logs`;
