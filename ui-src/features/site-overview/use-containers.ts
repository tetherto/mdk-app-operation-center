import { useMemo } from "react";

import { useContainersQuery } from "../../api/use-containers-query";
import { describeRequestError } from "../../lib/describe-request-error";
import { type ContainerCard, countMiners, toContainerCard } from "./container-card-shape";

export type ContainersView =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; cards: ContainerCard[]; minerCount: number };

/** Every container as a Site Overview card, refreshed every 30 seconds. */
export const useContainers = (): ContainersView => {
  const { query, url } = useContainersQuery();

  // Shaped once per response, so the rack tables keep stable rows between renders.
  const shaped = useMemo(() => {
    if (query.data === undefined) return undefined;
    const { containers } = query.data;
    return {
      cards: containers.map(toContainerCard),
      minerCount: containers.reduce((total, c) => total + countMiners(c.minerStatus), 0),
    };
  }, [query.data]);

  // A failed background refetch keeps the last good cards; the error shows only
  // when there is nothing to show.
  if (shaped !== undefined) return { status: "ready", ...shaped };
  if (query.isError) return { status: "error", message: describeRequestError(query.error, url) };
  return { status: "loading" };
};
