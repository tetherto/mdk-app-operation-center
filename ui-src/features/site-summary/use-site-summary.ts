import { useMdkApp, useQuery } from "@tetherto/mdk-react-adapter";

import { siteSummarySchema } from "../../api/contract";
import { QUERY_KEYS } from "../../api/query-keys";
import { getParsed } from "../../api/request";
import { API_ROUTES } from "../../api/routes";
import { describeRequestError } from "../../lib/describe-request-error";
import { type SiteStats, toSiteStats } from "./site-summary-shape";

const SUMMARY_REFETCH_MS = 30_000;

export type SiteSummaryView =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; stats: SiteStats };

/** Site-wide totals for the stats strip, refreshed every 30 seconds. */
export const useSiteSummary = (): SiteSummaryView => {
  const { apiUrl } = useMdkApp();
  const url = apiUrl(API_ROUTES.SITE_SUMMARY);

  const query = useQuery({
    queryKey: QUERY_KEYS.live("site-summary", url),
    queryFn: () => getParsed(url, siteSummarySchema),
    refetchInterval: SUMMARY_REFETCH_MS,
  });

  // A failed background refetch keeps the last good totals; the error shows only
  // when there is nothing to show.
  if (query.data !== undefined) return { status: "ready", stats: toSiteStats(query.data) };
  if (query.isError) return { status: "error", message: describeRequestError(query.error, url) };
  return { status: "loading" };
};
