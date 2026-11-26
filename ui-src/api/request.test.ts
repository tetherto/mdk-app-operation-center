import { MdkFetchError } from "@tetherto/mdk-ui-foundation";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import { createFakeGateway, TEST_API_BASE } from "../test-utils/fake-gateway";
import { commandResultSchema, siteConfigSchema } from "./contract";
import { getParsed, postParsed } from "./request";
import { API_ROUTES } from "./routes";

const url = (route: string) => `${TEST_API_BASE}${route}`;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getParsed", () => {
  it("returns the body parsed with its schema", async () => {
    const gateway = createFakeGateway({ siteName: "Test Site" });
    vi.stubGlobal("fetch", gateway.fetch);

    const config = await getParsed(url(API_ROUTES.CONFIG), siteConfigSchema);

    expect(config.siteName).toBe("Test Site");
    expect(gateway.requests).toEqual([
      expect.objectContaining({ method: "GET", path: API_ROUTES.CONFIG }),
    ]);
  });

  it("fails with a ZodError when the body drifts from the contract", async () => {
    const gateway = createFakeGateway();
    gateway.use(() => ({ kind: "json", body: { siteName: 42 } }));
    vi.stubGlobal("fetch", gateway.fetch);

    await expect(getParsed(url(API_ROUTES.CONFIG), siteConfigSchema)).rejects.toBeInstanceOf(
      ZodError,
    );
  });

  it("throws MdkFetchError with the status on a non-2xx answer", async () => {
    const gateway = createFakeGateway();
    gateway.fail(API_ROUTES.CONFIG, 503);
    vi.stubGlobal("fetch", gateway.fetch);

    const error: unknown = await getParsed(url(API_ROUTES.CONFIG), siteConfigSchema).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(MdkFetchError);
    expect(error).toMatchObject({ status: 503 });
  });
});

describe("postParsed", () => {
  it("POSTs the body as JSON and parses the answer", async () => {
    const gateway = createFakeGateway({ commandsEnabled: true });
    vi.stubGlobal("fetch", gateway.fetch);
    const body = { target: { containerId: "no-such-container" }, pct: 80 };

    const result = await postParsed(url(API_ROUTES.POWER_PCT), body, commandResultSchema);

    expect(result).toEqual({ accepted: false, minerCount: 0 });
    expect(gateway.requests).toEqual([
      expect.objectContaining({ method: "POST", path: API_ROUTES.POWER_PCT, body }),
    ]);
  });

  it("throws MdkFetchError when commands are off", async () => {
    const gateway = createFakeGateway({ commandsEnabled: false });
    vi.stubGlobal("fetch", gateway.fetch);
    const body = { target: { minerIds: ["m-1"] }, mode: "normal" };

    const error: unknown = await postParsed(
      url(API_ROUTES.POWER_MODE),
      body,
      commandResultSchema,
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(MdkFetchError);
    expect(error).toMatchObject({ status: 403 });
  });
});
