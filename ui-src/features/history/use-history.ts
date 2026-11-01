import { useMdkApp, useQuery } from "@tetherto/mdk-react-adapter";
import type { LineChartCardData } from "@tetherto/mdk-react-devkit";
import { useMemo } from "react";

import { type HistoryQuery, historySchema } from "../../api/contract";
import { QUERY_KEYS } from "../../api/query-keys";
import { getParsed } from "../../api/request";
import { API_ROUTES } from "../../api/routes";
import { describeRequestError } from "../../lib/describe-request-error";
import { scopeKindOf, toHashrateChart, toPowerChart } from "./history-shape";

const LIVE_REFETCH_MS = 60_000;

export type HistoryView =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; chart: LineChartCardData };

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
 * One history series as chart data. Without `start` + `end` the series ends
 * now, so it refreshes every minute; a fixed window does not change.
 */
export const useHistory = (query: HistoryQuery): HistoryView => {
  const { apiUrl } = useMdkApp();
  const url = `${apiUrl(API_ROUTES.HISTORY)}?${toSearchParams(query).toString()}`;

  const result = useQuery({
    queryKey: QUERY_KEYS.live("history", url),
    queryFn: () => getParsed(url, historySchema),
    refetchInterval: "start" in query ? false : LIVE_REFETCH_MS,
    placeholderData: (previous) => previous,
  });

  // Shape once per response, so the chart only sees new data when there is new data.
  const history = result.data;
  const scope = scopeKindOf(query);
  const chart = useMemo(() => {
    if (history === undefined) return undefined;
    return history.metric === "hashrate"
      ? toHashrateChart(history, scope)
      : toPowerChart(history, scope);
  }, [history, scope]);

  // A failed background refetch keeps the last good chart; the error shows only
  // when there is nothing to show.
  if (chart !== undefined) return { status: "ready", chart };
  if (result.isError) return { status: "error", message: describeRequestError(result.error, url) };
  return { status: "loading" };
};
