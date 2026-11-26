import { describe, expect, it } from "vitest";

import { LIVE_QUERY_KEY, QUERY_KEYS } from "./query-keys";

describe("QUERY_KEYS", () => {
  it("keys the config apart from live data", () => {
    const key = QUERY_KEYS.config("/apps/test/api/config");

    expect(key).toEqual(["op-centre-lite", "config", "/apps/test/api/config"]);
    expect(key.slice(0, LIVE_QUERY_KEY.length)).not.toEqual([...LIVE_QUERY_KEY]);
  });

  it("starts every live read with the live prefix, so one command refetches them all", () => {
    const key = QUERY_KEYS.live("containers", "/apps/test/api/containers");

    expect(key).toEqual(["op-centre-lite", "live", "containers", "/apps/test/api/containers"]);
    expect(key.slice(0, LIVE_QUERY_KEY.length)).toEqual([...LIVE_QUERY_KEY]);
  });
});
