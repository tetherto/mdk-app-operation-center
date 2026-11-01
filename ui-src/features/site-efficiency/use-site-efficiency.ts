import { useMdkApp, useQuery } from "@tetherto/mdk-react-adapter";
import { useMemo } from "react";

import { powerMetersSchema } from "../../api/contract";
import { QUERY_KEYS } from "../../api/query-keys";
import { getParsed } from "../../api/request";
import { API_ROUTES } from "../../api/routes";
import { useContainersQuery } from "../../api/use-containers-query";
import { describeRequestError } from "../../lib/describe-request-error";
import { type SiteEfficiencyView, toSiteEfficiencyView } from "./site-efficiency-shape";

const POWER_METERS_REFETCH_MS = 30_000;

export type SiteEfficiencyQueryView =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; view: SiteEfficiencyView };

/**
 * The power meters, refreshed every 30 seconds, with each meter's container
 * named from the shared containers read (ids until it loads).
 */
export const useSiteEfficiency = (): SiteEfficiencyQueryView => {
  const { apiUrl } = useMdkApp();
  const url = apiUrl(API_ROUTES.POWER_METERS);
  const query = useQuery({
    queryKey: QUERY_KEYS.live("power-meters", url),
    queryFn: () => getParsed(url, powerMetersSchema),
    refetchInterval: POWER_METERS_REFETCH_MS,
  });
  const containers = useContainersQuery().query.data;

  const view = useMemo(() => {
    if (query.data === undefined) return undefined;
    const names = new Map(containers?.containers.map(({ id, name }) => [id, name]));
    return toSiteEfficiencyView(query.data, names);
  }, [query.data, containers]);

  // A failed background refetch keeps the last good readings.
  if (view !== undefined) return { status: "ready", view };
  if (query.isError) return { status: "error", message: describeRequestError(query.error, url) };
  return { status: "loading" };
};
