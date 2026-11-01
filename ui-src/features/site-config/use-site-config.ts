import { useMdkApp, useQuery } from "@tetherto/mdk-react-adapter";

import { type SiteConfig, siteConfigSchema } from "../../api/contract";
import { QUERY_KEYS } from "../../api/query-keys";
import { getParsed } from "../../api/request";
import { API_ROUTES } from "../../api/routes";

/**
 * The site's config (`GET /api/config`). It only changes with a restart of the
 * app, so it is read once per session. Undefined until it loads.
 */
export const useSiteConfig = (): SiteConfig | undefined => {
  const { apiUrl } = useMdkApp();
  const url = apiUrl(API_ROUTES.CONFIG);

  const query = useQuery({
    queryKey: QUERY_KEYS.config(url),
    queryFn: () => getParsed(url, siteConfigSchema),
    staleTime: Number.POSITIVE_INFINITY,
  });

  return query.data;
};
