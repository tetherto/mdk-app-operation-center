import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { apiErrorSchema, containersSchema, siteConfigSchema } from "./contract";

// The plugin as the app runtime loads it: through the SDK's plugin loader with
// a frozen context carrying the config and the Kernel client, so the
// controllers' ambient `require("@tetherto/mdk-gateway/plugin")` resolves.
const load = createRequire(import.meta.url);
const pluginDir = fileURLToPath(new URL("../../plugin/", import.meta.url));
const loaderModule: unknown = load("@tetherto/mdk-app-runtime/lib/plugin-loader");

type Handler = (req: {
  params: Record<string, string>;
  query: Record<string, unknown>;
  body?: unknown;
  headers: Record<string, string>;
}) => Promise<unknown>;
// `_handler` is the loader's own name for the bound controller.
type Plugin = { routes: Array<{ id: string; _handler: Handler }> };
type Loader = { loadPlugin: (dir: string, context: unknown) => Plugin };
const isLoader = (value: unknown): value is Loader =>
  typeof value === "object" &&
  value !== null &&
  "loadPlugin" in value &&
  typeof value.loadPlugin === "function";
if (!isLoader(loaderModule)) throw new Error("the SDK's app-runtime plugin loader is missing");
const { loadPlugin } = loaderModule;

const logger = { debug() {}, info() {}, warn() {}, error() {} };
const noopClient = {
  async listWorkers() {
    return { workers: [] };
  },
  async getCapabilities() {
    return { capabilities: { telemetry: [], commands: [] } };
  },
  async pullTelemetry() {
    return null;
  },
};

function loadApp(config: Record<string, unknown>) {
  const plugin = loadPlugin(
    pluginDir,
    Object.freeze({ config: Object.freeze(config), logger, onReady() {} }),
  );
  // oxlint-disable-next-line no-underscore-dangle
  const byId = Object.fromEntries(plugin.routes.map((r) => [r.id, r._handler]));
  const call = (id: string, req: Partial<Parameters<Handler>[0]> = {}) =>
    byId[id]!({ params: {}, query: {}, headers: {}, ...req });
  return { call };
}

const layout = {
  containers: [
    {
      id: "c1",
      name: "Container 1",
      model: "M56S",
      nominalHashrateThs: 110,
      meterDeviceId: null,
      racks: [
        {
          id: "c1-r1",
          name: "Rack 1",
          sockets: [
            { position: "1-1-1", deviceId: "wm-1" },
            { position: "1-1-2", deviceId: null },
          ],
        },
      ],
    },
  ],
};

describe("plugin on the worker site", () => {
  it("serves config and containers from the layout when the Kernel lists no devices", async () => {
    const app = loadApp({ mock: false, siteName: "Test Site", layout, mdkClient: noopClient });
    expect(siteConfigSchema.parse(await app.call("op-centre-lite.config"))).toEqual({
      siteName: "Test Site",
      commandsEnabled: true,
      downloadUrl: null,
    });
    const { containers } = containersSchema.parse(await app.call("op-centre-lite.containers"));
    expect(containers[0]!.minerStatus).toMatchObject({ offline: 1, empty: 1 });
    expect(
      await app
        .call("op-centre-lite.container-layout", { params: { id: "nope" } })
        .catch((e: unknown) => e),
    ).toMatchObject({ statusCode: 404 });
  });

  it("answers 503 while the Kernel is unreachable", async () => {
    const client = {
      ...noopClient,
      async listWorkers() {
        throw new Error("ERR_MDK_CLIENT_UNAVAILABLE");
      },
    };
    const app = loadApp({ mock: false, layout, mdkClient: client });
    const error: unknown = await app.call("op-centre-lite.site-summary").catch((e: unknown) => e);
    expect(error).toMatchObject({ message: "ERR_KERNEL_UNAVAILABLE", statusCode: 503 });
    expect(
      apiErrorSchema.safeParse({
        statusCode: 503,
        error: "Service Unavailable",
        message: "ERR_KERNEL_UNAVAILABLE",
      }).success,
    ).toBe(true);
  });

  it("refuses to load with a bad layout, naming the path", () => {
    const bad = {
      containers: [
        {
          ...layout.containers[0],
          racks: [
            {
              id: "r",
              name: "R",
              sockets: [
                { position: "p", deviceId: "d" },
                { position: "p", deviceId: "d" },
              ],
            },
          ],
        },
      ],
    };
    expect(() => loadApp({ mock: false, layout: bad, mdkClient: noopClient })).toThrow(
      /ERR_LAYOUT_INVALID.*sockets\[1\]/,
    );
  });

  it("streams a miner's log archive with a safe Content-Disposition", async () => {
    const archive = Buffer.from("bytes");
    const client = {
      async listWorkers() {
        return { workers: [{ workerId: "w", state: "READY", deviceIds: ["wm-1"] }] };
      },
      async getCapabilities() {
        return {
          capabilities: {
            telemetry: [{ name: "hashrate_rt" }],
            commands: [{ name: "downloadLogs", params: [] }],
          },
        };
      },
      async pullTelemetry() {
        return null;
      },
      async sendCommand() {
        return { commandId: "c1", status: "QUEUED" };
      },
      async getCommandStatus() {
        return {
          status: "SUCCESS",
          result: {
            filename: 'evil"\r\nX-Injected: 1 ü.tgz',
            contentType: "application/gzip\r\nX: y",
            encoding: "base64",
            data: archive.toString("base64"),
          },
        };
      },
    };
    const plugin = loadApp({ mock: false, layout, mdkClient: client });
    const headers: Record<string, unknown> = {};
    const written: { body: Buffer | null } = { body: null };
    const raw = {
      writeHead(status: number, h: Record<string, unknown>) {
        headers.status = status;
        Object.assign(headers, h);
      },
      end(data: Buffer) {
        written.body = data;
      },
    };
    // A stream route's controller takes (req, raw); the loader types it as a one-argument handler.
    const handler = plugin.routes.find((r) => r.id === "op-centre-lite.miner-logs")!;
    // oxlint-disable-next-line no-underscore-dangle
    const stream: unknown = handler._handler;
    if (typeof stream !== "function") throw new Error("no handler");
    await stream({ params: { id: "wm-1" }, query: {}, headers: {}, mdk: client }, raw);
    expect(headers.status).toBe(200);
    expect(headers["content-type"]).toBe("application/gzipX: y");
    expect(String(headers["content-disposition"])).not.toMatch(/[\r\n]/);
    expect(headers["content-disposition"]).toBe(
      `attachment; filename="evil_X-Injected: 1 _.tgz"; filename*=UTF-8''${encodeURIComponent('evil"X-Injected: 1 ü.tgz')}`,
    );
    expect(written.body?.equals(archive)).toBe(true);

    function loadApp(config: Record<string, unknown>) {
      return loadPlugin(
        pluginDir,
        Object.freeze({ config: Object.freeze(config), logger, onReady() {} }),
      );
    }
  });

  it("serves the hosted demo's download link from the config", async () => {
    const app = loadApp({
      mock: false,
      layout,
      commandsEnabled: false,
      downloadUrl: "https://example.com/op-centre-lite",
      mdkClient: noopClient,
    });
    expect(siteConfigSchema.parse(await app.call("op-centre-lite.config"))).toMatchObject({
      commandsEnabled: false,
      downloadUrl: "https://example.com/op-centre-lite",
    });
  });

  it("refuses to start with a download link that is not http(s)", () => {
    expect(() =>
      loadApp({ mock: false, layout, downloadUrl: "javascript:alert(1)", mdkClient: noopClient }),
    ).toThrow(/ERR_DOWNLOAD_URL_INVALID/);
  });

  it("returns 403 on commands when they are disabled, before any Kernel call", async () => {
    let calls = 0;
    const client = {
      ...noopClient,
      async listWorkers() {
        calls += 1;
        return { workers: [] };
      },
    };
    const app = loadApp({ mock: false, layout, commandsEnabled: false, mdkClient: client });
    const error: unknown = await app
      .call("op-centre-lite.power-mode", { body: { target: { containerId: "c1" }, mode: "low" } })
      .catch((e: unknown) => e);
    expect(error).toMatchObject({ statusCode: 403, message: "ERR_COMMANDS_DISABLED" });
    expect(calls).toBe(0);
  });
});
