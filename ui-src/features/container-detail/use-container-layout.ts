import { useMdkApp, useQuery } from "@tetherto/mdk-react-adapter";
import { useMemo } from "react";

import { containerLayoutSchema } from "../../api/contract";
import { QUERY_KEYS } from "../../api/query-keys";
import { getParsed } from "../../api/request";
import { containerLayoutRoute } from "../../api/routes";
import {
  type ContainerLayoutView,
  isUnknownContainer,
  toContainerLayoutView,
  toLayoutView,
} from "./layout-shape";

const LAYOUT_REFETCH_MS = 30_000;
/** Retries of a failed read; an unknown container is not retried. */
const LAYOUT_MAX_RETRIES = 3;

/** One container's socket grid, refreshed every 30 seconds. */
export const useContainerLayout = (containerId: string): ContainerLayoutView => {
  const { apiUrl } = useMdkApp();
  const url = apiUrl(containerLayoutRoute(containerId));

  const query = useQuery({
    queryKey: QUERY_KEYS.live("layout", url),
    queryFn: () => getParsed(url, containerLayoutSchema),
    refetchInterval: LAYOUT_REFETCH_MS,
    retry: (failureCount, error) => !isUnknownContainer(error) && failureCount < LAYOUT_MAX_RETRIES,
  });

  // Shaped once per response, so the grid keeps stable sockets between renders.
  const layout = useMemo(
    () => (query.data === undefined ? undefined : toLayoutView(query.data)),
    [query.data],
  );

  return toContainerLayoutView(layout, query.error, url);
};
