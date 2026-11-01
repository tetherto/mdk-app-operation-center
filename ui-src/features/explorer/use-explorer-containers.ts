import { useMemo } from "react";

import { useContainersQuery } from "../../api/use-containers-query";
import { describeRequestError } from "../../lib/describe-request-error";
import {
  type ContainerOption,
  type RackExplorerRow,
  toContainerOptions,
  toRackRows,
} from "./explorer-shape";

export type ExplorerContainersView =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      racks: RackExplorerRow[];
      containers: ContainerOption[];
      /** Container name by id, for the miners rows. */
      containerNames: ReadonlyMap<string, string>;
    };

/** The racks for the Racks tab, and the containers for the filter and the miners rows. */
export const useExplorerContainers = (): ExplorerContainersView => {
  const { query, url } = useContainersQuery();

  const shaped = useMemo(() => {
    if (query.data === undefined) return undefined;
    const { containers } = query.data;
    return {
      racks: toRackRows(containers),
      containers: toContainerOptions(containers),
      containerNames: new Map(containers.map((c) => [c.id, c.name])),
    };
  }, [query.data]);

  // A failed background refetch keeps the last good data; the error shows only
  // when there is nothing to show.
  if (shaped !== undefined) return { status: "ready", ...shaped };
  if (query.isError) return { status: "error", message: describeRequestError(query.error, url) };
  return { status: "loading" };
};
