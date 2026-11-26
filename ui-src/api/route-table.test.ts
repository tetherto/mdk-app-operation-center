import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ROUTE_TABLE, toPluginManifest } from "./route-table";
import { API_ROUTES, containerLayoutRoute, minerLogsRoute } from "./routes";

const appRoot = fileURLToPath(new URL("../../", import.meta.url));
const ERROR_CODE = /^ERR_[A-Z0-9_]+$/;
const ERROR_TEXT = /^\d{3}: /;

/** `/api/containers/:id/layout` matches `/api/containers/x/layout`. */
const matches = (pattern: string, path: string): boolean =>
  new RegExp(`^${pattern.replaceAll(/:[a-z]+/gi, "[^/]+")}$`).test(path);

const pathParamsOf = (path: string): string[] =>
  [...path.matchAll(/:([a-z]+)/gi)].map((match) => match[1] ?? "");

const META = { name: "@test/app", version: "1.2.3", description: "Test routes." };

const manifestSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  routes: z.array(
    z.object({
      id: z.string(),
      handler: z.string(),
      safety: z.enum(["read-only", "write"]),
      auth: z.literal(true).optional(),
      stream: z.literal(true).optional(),
      http: z.object({
        method: z.enum(["GET", "POST"]),
        path: z.string(),
        parameters: z
          .array(
            z.object({ name: z.string(), in: z.enum(["path", "query"]), required: z.boolean() }),
          )
          .optional(),
        requestBody: z.object({ required: z.literal(true) }).optional(),
        responses: z.object({ 200: z.object({ content: z.record(z.string(), z.unknown()) }) }),
      }),
      errors: z.record(z.string(), z.string()).optional(),
    }),
  ),
});

describe("ROUTE_TABLE", () => {
  it("gives every route a unique id and method + path", () => {
    const ids = ROUTE_TABLE.map((route) => route.id);
    const endpoints = ROUTE_TABLE.map((route) => `${route.method} ${route.path}`);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(endpoints).size).toBe(endpoints.length);
    for (const id of ids) expect(id).toMatch(/^op-centre-lite\.[a-z-]+$/);
  });

  it("serves every route the UI calls", () => {
    const paths = ROUTE_TABLE.map((route) => route.path);
    for (const path of Object.values(API_ROUTES)) expect(paths).toContain(path);
    expect(paths.some((path) => matches(path, containerLayoutRoute("c-1")))).toBe(true);
    expect(paths.some((path) => matches(path, minerLogsRoute("m-1")))).toBe(true);
  });

  it("points every route at a controller the plugin has", () => {
    const missing = ROUTE_TABLE.map((route) => route.handler).filter(
      (handler) => !existsSync(`${appRoot}plugin/controllers/${handler}.js`),
    );
    expect(missing).toEqual([]);
  });

  it("declares a path schema with exactly the path's parameters", () => {
    const declared = ROUTE_TABLE.map((route) => [
      route.id,
      Object.keys(route.pathParams?.shape ?? {}),
    ]);
    const expected = ROUTE_TABLE.map((route) => [route.id, pathParamsOf(route.path)]);
    expect(declared).toEqual(expected);
  });

  it("guards writes: POST, signed in, a body, and the commands-off error", () => {
    const unguarded = ROUTE_TABLE.filter((route) => {
      const write = route.safety === "write";
      if ((route.method === "POST") !== write) return true;
      if (!write) return false;
      return (
        route.auth !== true ||
        route.body === undefined ||
        route.errors?.ERR_COMMANDS_DISABLED === undefined
      );
    }).map((route) => route.id);
    expect(unguarded).toEqual([]);
  });

  it("names every error code in SCREAMING_SNAKE with its status", () => {
    const malformed = ROUTE_TABLE.flatMap((route) =>
      Object.entries(route.errors ?? {})
        .filter(([code, text]) => !ERROR_CODE.test(code) || !ERROR_TEXT.test(text))
        .map(([code]) => `${route.id} ${code}`),
    );
    expect(malformed).toEqual([]);
  });

  it("gives JSON routes a response schema and stream routes a content type", () => {
    const incomplete = ROUTE_TABLE.filter((route) =>
      route.stream === true ? route.contentType === "" : route.response === undefined,
    ).map((route) => route.id);
    expect(incomplete).toEqual([]);
  });
});

describe("toPluginManifest", () => {
  const manifest = manifestSchema.parse(toPluginManifest(META));

  it("carries the package meta and one entry per route, in order", () => {
    expect(manifest).toMatchObject(META);
    expect(manifest.routes.map((route) => route.id)).toEqual(ROUTE_TABLE.map((route) => route.id));
  });

  it("writes handler paths, auth, stream and errors only where the route has them", () => {
    for (const [index, entry] of manifest.routes.entries()) {
      const route = ROUTE_TABLE[index];
      if (route === undefined) throw new Error("route missing");
      expect(entry.handler).toBe(`./controllers/${route.handler}.js`);
      expect(entry.http).toMatchObject({ method: route.method, path: route.path });
      expect("auth" in entry).toBe(route.auth === true);
      expect("stream" in entry).toBe(route.stream === true);
      expect(entry.errors).toEqual(route.errors);
      expect("requestBody" in entry.http).toBe(route.body !== undefined);
    }
  });

  it("marks path parameters required and query parameters by their schema", () => {
    const layout = manifest.routes.find((route) => route.id === "op-centre-lite.container-layout");
    expect(layout?.http.parameters).toEqual([
      expect.objectContaining({ name: "id", in: "path", required: true }),
    ]);

    const history = manifest.routes.find((route) => route.id === "op-centre-lite.history");
    const query = history?.http.parameters ?? [];
    expect(query.length).toBeGreaterThan(0);
    expect(query.every((parameter) => parameter.in === "query")).toBe(true);

    const config = manifest.routes.find((route) => route.id === "op-centre-lite.config");
    expect(config?.http.parameters).toBeUndefined();
  });

  it("answers a stream route with its content type and a JSON route with a schema", () => {
    const logs = manifest.routes.find((route) => route.id === "op-centre-lite.miner-logs");
    expect(Object.keys(logs?.http.responses[200].content ?? {})).toEqual([
      "application/octet-stream",
    ]);
    const config = manifest.routes.find((route) => route.id === "op-centre-lite.config");
    expect(Object.keys(config?.http.responses[200].content ?? {})).toEqual(["application/json"]);
  });

  it("matches the committed plugin/mdk-plugin.json", () => {
    const committed: unknown = JSON.parse(readFileSync(`${appRoot}plugin/mdk-plugin.json`, "utf8"));
    const pkg = z
      .object({ name: z.string(), version: z.string() })
      .parse(JSON.parse(readFileSync(`${appRoot}package.json`, "utf8")));
    const meta = z.object({ description: z.string() }).parse(committed);

    expect(
      JSON.parse(JSON.stringify(toPluginManifest({ ...pkg, description: meta.description }))),
    ).toEqual(committed);
  });
});
