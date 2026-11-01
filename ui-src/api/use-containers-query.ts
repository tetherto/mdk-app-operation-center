import { useMdkApp, useQuery } from "@tetherto/mdk-react-adapter";

import { containersSchema } from "./contract";
import { QUERY_KEYS } from "./query-keys";
import { getParsed } from "./request";
import { API_ROUTES } from "./routes";

const CONTAINERS_REFETCH_MS = 30_000;

/**
 * `GET /api/containers`, refreshed every 30 seconds. Site Overview and the
 * Explorer Racks tab share it, so both read one cached response.
 */
export const useContainersQuery = () => {
  const { apiUrl } = useMdkApp();
  const url = apiUrl(API_ROUTES.CONTAINERS);
  const query = useQuery({
    queryKey: QUERY_KEYS.live("containers", url),
    queryFn: () => getParsed(url, containersSchema),
    refetchInterval: CONTAINERS_REFETCH_MS,
  });
  return { query, url };
};
