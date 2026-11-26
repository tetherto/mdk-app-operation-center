// @vitest-environment jsdom
import { waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createFakeGateway } from "../test-utils/fake-gateway";
import { renderHookWithApp } from "../test-utils/render";
import { containersSchema } from "./contract";
import { QUERY_KEYS } from "./query-keys";
import { API_ROUTES } from "./routes";
import { useContainersQuery } from "./use-containers-query";

const CONTAINERS_URL = "/apps/test/api/containers";

describe("useContainersQuery", () => {
  it("reads the containers from the app's mount", async () => {
    const { result, gateway, queryClient } = renderHookWithApp(() => useContainersQuery());

    expect(result.current.url).toBe(CONTAINERS_URL);
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    const expected = containersSchema.parse(gateway.site.containers());
    expect(result.current.query.data?.containers.map((container) => container.id)).toEqual(
      expected.containers.map((container) => container.id),
    );
    expect(queryClient.getQueryData(QUERY_KEYS.live("containers", CONTAINERS_URL))).toEqual(
      result.current.query.data,
    );
    expect(gateway.requests.map((request) => request.path)).toEqual([API_ROUTES.CONTAINERS]);
  });

  it("surfaces a failed read as a query error", async () => {
    const gateway = createFakeGateway();
    gateway.fail(API_ROUTES.CONTAINERS, 500);
    const { result } = renderHookWithApp(() => useContainersQuery(), { gateway });

    await waitFor(() => expect(result.current.query.isError).toBe(true));
  });
});
