import { describe, expect, it } from "vitest";

import { containerLayoutRoute, minerLogsRoute } from "./routes";

describe("containerLayoutRoute", () => {
  it("puts the container id in the path", () => {
    expect(containerLayoutRoute("bitmain-01")).toBe("/api/containers/bitmain-01/layout");
  });

  it("encodes an id that is not a plain path segment", () => {
    expect(containerLayoutRoute("a/b c")).toBe("/api/containers/a%2Fb%20c/layout");
  });
});

describe("minerLogsRoute", () => {
  it("puts the miner id in the path", () => {
    expect(minerLogsRoute("m-1")).toBe("/api/miners/m-1/logs");
  });

  it("encodes an id that is not a plain path segment", () => {
    expect(minerLogsRoute("rack 1/2")).toBe("/api/miners/rack%201%2F2/logs");
  });
});
