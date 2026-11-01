import { useMdkApp, useQuery } from "@tetherto/mdk-react-adapter";

import { type Miner, minersPageSchema } from "../../api/contract";
import { QUERY_KEYS } from "../../api/query-keys";
import { getParsed } from "../../api/request";
import { API_ROUTES } from "../../api/routes";
import { describeRequestError } from "../../lib/describe-request-error";
import type { ExplorerFilter } from "./explorer-shape";
import { minersPageUrl, toMinersQuery } from "./miners-request";

const MINERS_REFETCH_MS = 30_000;

export type ExplorerMinersView =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      miners: Miner[];
      total: number;
      /** True while these are the previous page's miners and the asked-for page loads. */
      stale: boolean;
    };

/**
 * One page of the miners the filter matches. The route pages and searches, so
 * only this page is fetched; the previous page stays on screen while the next loads.
 */
export const useExplorerMiners = (
  filter: ExplorerFilter,
  page: number,
  pageSize: number,
): ExplorerMinersView => {
  const { apiUrl } = useMdkApp();
  const url = minersPageUrl(apiUrl(API_ROUTES.MINERS), toMinersQuery(filter, page, pageSize));

  const query = useQuery({
    queryKey: QUERY_KEYS.live("miners", url),
    queryFn: () => getParsed(url, minersPageSchema),
    refetchInterval: MINERS_REFETCH_MS,
    placeholderData: (previous) => previous,
  });

  if (query.data !== undefined) {
    return {
      status: "ready",
      miners: query.data.items,
      total: query.data.total,
      stale: query.isPlaceholderData,
    };
  }
  if (query.isError) return { status: "error", message: describeRequestError(query.error, url) };
  return { status: "loading" };
};
