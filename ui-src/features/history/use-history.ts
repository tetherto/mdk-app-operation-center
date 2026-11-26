import { useMdkApp, useQuery } from "@tetherto/mdk-react-adapter";
import type { LineChartCardData } from "@tetherto/mdk-react-devkit";
import { useMemo } from "react";

import { type HistoryQuery, historySchema } from "../../api/contract";
import { QUERY_KEYS } from "../../api/query-keys";
import { getParsed } from "../../api/request";
import { API_ROUTES } from "../../api/routes";
import { describeRequestError } from "../../lib/describe-request-error";
import { scopeKindOf, toHashrateChart, toPowerChart } from "./history-shape";
import { bucketStartsOf } from "./history-window";

const LIVE_REFETCH_MS = 60_000;

export type HistoryView =
  | { status: "loading" }
  | { status: "error"; message: string }
  /**
   * `stale`: the chart is the previous query's while the new one loads (a new
   * interval or window), so the card shows its loading state over it.
   */
  | { status: "ready"; chart: LineChartCardData; stale: boolean };

const toSearchParams = (query: HistoryQuery): URLSearchParams => {
  const params = new URLSearchParams({ metric: query.metric, interval: query.interval });
  if ("start" in query) {
    params.set("start", String(query.start));
    params.set("end", String(query.end));
  } else if (query.limit !== undefined) {
    params.set("limit", String(query.limit));
  }
  if (query.containerId !== undefined) params.set("containerId", query.containerId);
  if (query.rackId !== undefined) params.set("rackId", query.rackId);
  return params;
};

/**
 * Whether new buckets can still fill: a series that ends now, or a window that
 * ends in the future. A window entirely in the past does not change.
 */
const isLiveQuery = (query: HistoryQuery, now: number): boolean =>
  !("start" in query) || query.end > now;

/**
 * One history series as chart data. A series that is still filling (ending
 * now, or a window ending in the future) refreshes every minute.
 */
export const useHistory = (query: HistoryQuery): HistoryView => {
  const { apiUrl } = useMdkApp();
  const url = `${apiUrl(API_ROUTES.HISTORY)}?${toSearchParams(query).toString()}`;

  const result = useQuery({
    queryKey: QUERY_KEYS.live("history", url),
    // The window's buckets are counted when the answer comes in and travel with
    // it: a previous answer shown while a new window loads keeps its own
    // buckets. They are counted on the browser's clock while the plugin counts
    // on its own; both are epoch-aligned, so they line up, and a skewed browser
    // clock only adds or drops a few empty buckets at the end of the chart.
    queryFn: async () => {
      const history = await getParsed(url, historySchema);
      return { history, buckets: bucketStartsOf(query, Date.now()) };
    },
    refetchInterval: isLiveQuery(query, Date.now()) ? LIVE_REFETCH_MS : false,
    placeholderData: (previous) => previous,
  });

  // Shape once per response, so the chart only sees new data when there is new data.
  const answer = result.data;
  const scope = scopeKindOf(query);
  const chart = useMemo(() => {
    if (answer === undefined) return undefined;
    const { history, buckets } = answer;
    return history.metric === "hashrate"
      ? toHashrateChart(history, scope, buckets)
      : toPowerChart(history, scope, buckets);
  }, [answer, scope]);

  // A failed background refetch keeps the last good chart; the error shows only
  // when there is nothing to show.
  if (chart !== undefined) return { status: "ready", chart, stale: result.isPlaceholderData };
  if (result.isError) return { status: "error", message: describeRequestError(result.error, url) };
  return { status: "loading" };
};
