import { createRequire } from "node:module";

import { powerModeCommandSchema, powerPctCommandSchema, siteConfigSchema } from "../api/contract";

// The plugin's mock site, served over a fake `fetch` the way the Gateway would
// serve it, so hooks and pages run against bodies the contract tests already
// check. Tests can fail a route or answer it themselves.

export type MockSiteOptions = {
  siteName?: string;
  commandsEnabled?: boolean;
  downloadUrl?: string | null;
};
type LogFile = { filename: string; contentType: string; data: Uint8Array };
type MockSite = {
  config: () => unknown;
  summary: () => unknown;
  containers: () => unknown;
  powerMeters: () => unknown;
  history: (query: object) => unknown;
  containerLayout: (id: string) => unknown;
  miners: (query: object) => unknown;
  minerLogs: (id: string) => LogFile | null;
  setPowerMode: (target: unknown, mode: unknown) => unknown;
  setPowerPct: (target: unknown, pct: unknown) => unknown;
};
type QueryObject = Record<string, string | number>;
type PluginModules = {
  createMockSite: (options?: MockSiteOptions) => MockSite;
  resolveHistoryQuery: (query: QueryObject) => object;
};

const hasFunction = (value: unknown, key: string): value is object =>
  typeof value === "object" &&
  value !== null &&
  key in value &&
  typeof Reflect.get(value, key) === "function";

const loadPlugin = (): PluginModules => {
  const load = createRequire(import.meta.url);
  const mock: unknown = load("../../plugin/lib/mock-site.js");
  const window: unknown = load("../../plugin/lib/history-window.js");
  if (!hasFunction(mock, "createMockSite") || !hasFunction(window, "resolveHistoryQuery"))
    throw new Error("plugin mock site modules not found");
  // The plugin is plain JS: its shapes are checked by the contract tests.
  return {
    createMockSite: Reflect.get(mock, "createMockSite"),
    resolveHistoryQuery: Reflect.get(window, "resolveHistoryQuery"),
  };
};
const plugin = loadPlugin();

/** Where the test app is mounted: `apiUrl("/api/x")` is `/apps/test/api/x`. */
export const TEST_API_BASE = "/apps/test";

/** A route's answer: a JSON body, or an error status (the Gateway's error body). */
export type FakeAnswer =
  | { kind: "json"; body: unknown; status?: number }
  | { kind: "error"; status: number; code: string };

export type FakeRequest = { method: string; path: string; query: URLSearchParams; body: unknown };
export type FakeHandler = (request: FakeRequest) => FakeAnswer | undefined;

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const errorResponse = (status: number, code: string): Response =>
  json({ statusCode: status, error: code, message: code }, status);

const numberOrString = (value: string): string | number =>
  value !== "" && Number.isFinite(Number(value)) ? Number(value) : value;

const queryObject = (query: URLSearchParams): QueryObject => {
  const result: QueryObject = {};
  for (const [key, value] of query) result[key] = numberOrString(value);
  return result;
};

const bodyOf = (init: RequestInit | undefined): unknown =>
  typeof init?.body === "string" ? JSON.parse(init.body) : undefined;

const urlOf = (input: RequestInfo | URL): URL => {
  if (typeof input === "string") return new URL(input, "http://localhost");
  if (input instanceof URL) return input;
  return new URL(input.url, "http://localhost");
};

export type FakeGateway = {
  site: MockSite;
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  /** Every request served, oldest first. */
  requests: FakeRequest[];
  /** Answers matching requests before the mock site does (last one added wins). */
  use: (handler: FakeHandler) => void;
  /** Fails every request to `path` (relative to the app mount) with `status`. */
  fail: (path: string, status?: number, code?: string) => void;
};

export const createFakeGateway = (options: MockSiteOptions = {}): FakeGateway => {
  const site = plugin.createMockSite(options);
  const handlers: FakeHandler[] = [];
  const requests: FakeRequest[] = [];
  const commandsEnabled = () => siteConfigSchema.parse(site.config()).commandsEnabled;

  const serveSite = ({ method, path, query, body }: FakeRequest): Response => {
    if (method === "POST" && path === "/api/commands/power-mode") {
      if (!commandsEnabled()) return errorResponse(403, "ERR_COMMANDS_DISABLED");
      const command = powerModeCommandSchema.parse(body);
      return json(site.setPowerMode(command.target, command.mode));
    }
    if (method === "POST" && path === "/api/commands/power-pct") {
      if (!commandsEnabled()) return errorResponse(403, "ERR_COMMANDS_DISABLED");
      const command = powerPctCommandSchema.parse(body);
      return json(site.setPowerPct(command.target, command.pct));
    }
    if (path === "/api/config") return json(site.config());
    if (path === "/api/site/summary") return json(site.summary());
    if (path === "/api/containers") return json(site.containers());
    if (path === "/api/power-meters") return json(site.powerMeters());
    if (path === "/api/history")
      return json(site.history(plugin.resolveHistoryQuery(queryObject(query))));
    if (path === "/api/miners") return json(site.miners(queryObject(query)));

    const layout = /^\/api\/containers\/([^/]+)\/layout$/.exec(path)?.[1];
    if (layout !== undefined) {
      const found = site.containerLayout(decodeURIComponent(layout));
      return found === null ? errorResponse(404, "ERR_CONTAINER_NOT_FOUND") : json(found);
    }
    const logs = /^\/api\/miners\/([^/]+)\/logs$/.exec(path)?.[1];
    if (logs !== undefined) {
      const file = site.minerLogs(decodeURIComponent(logs));
      if (file === null) return errorResponse(404, "ERR_MINER_NOT_FOUND");
      return new Response(new Uint8Array(file.data), {
        status: 200,
        headers: {
          "content-type": file.contentType,
          "content-disposition": `attachment; filename="${file.filename}"`,
        },
      });
    }
    return errorResponse(404, "ERR_NOT_FOUND");
  };

  const fakeFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = urlOf(input);
    if (!url.pathname.startsWith(TEST_API_BASE)) return errorResponse(404, "ERR_NOT_FOUND");
    const request: FakeRequest = {
      method: init?.method ?? "GET",
      path: url.pathname.slice(TEST_API_BASE.length),
      query: url.searchParams,
      body: bodyOf(init),
    };
    requests.push(request);
    for (const handler of [...handlers].reverse()) {
      const answer = handler(request);
      if (answer === undefined) continue;
      return answer.kind === "json"
        ? json(answer.body, answer.status)
        : errorResponse(answer.status, answer.code);
    }
    return serveSite(request);
  };

  return {
    site,
    fetch: fakeFetch,
    requests,
    use: (handler) => handlers.push(handler),
    fail: (path, status = 500, code = "ERR_TEST_FAILURE") =>
      handlers.push((request) =>
        request.path === path ? { kind: "error", status, code } : undefined,
      ),
  };
};
