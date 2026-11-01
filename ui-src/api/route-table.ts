/**
 * The app's Gateway route table, defined against the contract schemas.
 * `npm run gen:routes` writes it to plugin/mdk-plugin.json (the file the
 * Gateway loads), and CI fails when that file is stale. Path, query and body
 * schemas become the Gateway's request validation; response schemas document
 * each route for readers and MCP clients.
 */
import { z } from "zod";

import {
  commandResultSchema,
  containerLayoutSchema,
  containersSchema,
  HISTORY_DEFAULT_POINTS,
  HISTORY_MAX_POINTS,
  historyRequestSchema,
  historySchema,
  MINER_LOGS_CONTENT_TYPE,
  MINERS_DEFAULT_PAGE_SIZE,
  MINERS_MAX_PAGE_SIZE,
  minersPageSchema,
  minersQuerySchema,
  powerMetersSchema,
  powerModeCommandSchema,
  powerPctCommandSchema,
  siteConfigSchema,
  siteSummarySchema,
} from "./contract.ts";

type RouteBase = {
  id: string;
  method: "GET" | "POST";
  path: string;
  /** Controller file under plugin/controllers/. */
  handler: string;
  safety: "read-only" | "write";
  description: string;
  /**
   * The route needs a signed-in caller. On MDK with RBAC (develop) every app
   * route does, and spec.rbac decides who; the flag then only documents intent.
   * On MDK 0.12.0 it is what makes the Gateway check the caller.
   */
  auth?: boolean;
  pathParams?: z.ZodObject;
  query?: z.ZodObject;
  body?: z.ZodType;
  /** Error codes the route can return, besides Gateway validation errors. */
  errors?: Record<string, string>;
};

/** A JSON route: the controller returns the body, parsed with `response`. */
type JsonRoute = RouteBase & { stream?: undefined; response: z.ZodType };

/**
 * A stream route: the controller is `async (req, raw)` and writes the response
 * itself (headers and bytes), as for a file download.
 */
type StreamRoute = RouteBase & { stream: true; contentType: string; response?: undefined };

export type RouteDefinition = JsonRoute | StreamRoute;

const COMMAND_ERRORS = {
  ERR_COMMANDS_DISABLED: "403: commands are off on this site (hosted demo)",
};

export const ROUTE_TABLE: RouteDefinition[] = [
  {
    id: "op-centre-lite.config",
    method: "GET",
    path: "/api/config",
    handler: "config",
    safety: "read-only",
    description: "Site name and whether commands are on.",
    response: siteConfigSchema,
  },
  {
    id: "op-centre-lite.site-summary",
    method: "GET",
    path: "/api/site/summary",
    handler: "site-summary",
    safety: "read-only",
    description: "Site-wide miner counts, hashrate and power.",
    response: siteSummarySchema,
  },
  {
    id: "op-centre-lite.containers",
    method: "GET",
    path: "/api/containers",
    handler: "containers",
    safety: "read-only",
    description: "Every container with its racks, totals and miner status counts.",
    response: containersSchema,
  },
  {
    id: "op-centre-lite.container-layout",
    method: "GET",
    path: "/api/containers/:id/layout",
    handler: "container-layout",
    safety: "read-only",
    description: "The socket grid of one container, with the miner in each socket.",
    pathParams: z.object({ id: z.string() }),
    response: containerLayoutSchema,
    errors: { ERR_CONTAINER_NOT_FOUND: "404: no container with this id" },
  },
  {
    id: "op-centre-lite.history",
    method: "GET",
    path: "/api/history",
    handler: "history",
    safety: "read-only",
    description:
      "Hashrate or power over time, one point per `interval` bucket, site-wide or for one container or rack. " +
      `Returns the last \`limit\` buckets ending now (default ${HISTORY_DEFAULT_POINTS}), or every bucket between \`start\` and \`end\` (ms epoch).`,
    query: historyRequestSchema,
    response: historySchema,
    errors: {
      ERR_HISTORY_WINDOW_INCOMPLETE: "400: only one of `start` and `end` was given",
      ERR_HISTORY_WINDOW_INVALID: "400: `start` is after `end`",
      ERR_HISTORY_WINDOW_TOO_LARGE: `400: \`start\` to \`end\` spans more than ${HISTORY_MAX_POINTS} buckets of \`interval\``,
    },
  },
  {
    id: "op-centre-lite.power-meters",
    method: "GET",
    path: "/api/power-meters",
    handler: "power-meters",
    safety: "read-only",
    description: "Site meter power, the miners own power, and one entry per power meter.",
    response: powerMetersSchema,
  },
  {
    id: "op-centre-lite.miners",
    method: "GET",
    path: "/api/miners",
    handler: "miners",
    safety: "read-only",
    description: `One page of miners (default ${MINERS_DEFAULT_PAGE_SIZE}, at most ${MINERS_MAX_PAGE_SIZE}), optionally narrowed to a container or a search over id, serial, IP and position.`,
    query: minersQuerySchema,
    response: minersPageSchema,
  },
  {
    id: "op-centre-lite.miner-logs",
    method: "GET",
    path: "/api/miners/:id/logs",
    handler: "miner-logs",
    safety: "read-only",
    description:
      "The log archive of one miner, as a file download (the worker's `downloadLogs` result).",
    pathParams: z.object({ id: z.string() }),
    stream: true,
    contentType: MINER_LOGS_CONTENT_TYPE,
    errors: {
      ERR_MINER_NOT_FOUND: "404: no miner with this id",
      ERR_LOGS_UNSUPPORTED: "501: this miner's worker has no `downloadLogs` command",
      ERR_LOGS_FAILED: "502: the worker did not produce the archive",
    },
  },
  {
    id: "op-centre-lite.power-mode",
    method: "POST",
    path: "/api/commands/power-mode",
    handler: "power-mode",
    safety: "write",
    auth: true,
    description:
      "Set the power mode of a container or of selected miners. Miners that do not support the mode are skipped. Applies directly, with no approval step.",
    body: powerModeCommandSchema,
    response: commandResultSchema,
    errors: COMMAND_ERRORS,
  },
  {
    id: "op-centre-lite.power-pct",
    method: "POST",
    path: "/api/commands/power-pct",
    handler: "power-pct",
    safety: "write",
    auth: true,
    description:
      "Set the power percentage of a container or of selected miners. Applies directly, with no approval step.",
    body: powerPctCommandSchema,
    response: commandResultSchema,
    errors: COMMAND_ERRORS,
  },
];

const jsonSchema = (schema: z.ZodType): unknown => {
  const { $schema: _dropped, ...rest } = z.toJSONSchema(schema, { io: "input" });
  return rest;
};

/** OpenAPI-style parameters, as the Gateway's plugin loader reads them. */
const parametersOf = (location: "path" | "query", schema: z.ZodObject | undefined) => {
  if (schema === undefined) return [];
  return Object.entries(schema.shape).map(([name, fieldSchema]: [string, z.ZodType]) => {
    const required = location === "path" || !fieldSchema.safeParse(undefined).success;
    return { name, in: location, required, schema: jsonSchema(fieldSchema) };
  });
};

/** The route table in the mdk-plugin.json format. */
export const toPluginManifest = (meta: { name: string; version: string; description: string }) => ({
  ...meta,
  routes: ROUTE_TABLE.map((route) => {
    const parameters = [
      ...parametersOf("path", route.pathParams),
      ...parametersOf("query", route.query),
    ];
    const http: Record<string, unknown> = { method: route.method, path: route.path };
    if (parameters.length > 0) http.parameters = parameters;
    if (route.body !== undefined) {
      http.requestBody = {
        required: true,
        content: { "application/json": { schema: jsonSchema(route.body) } },
      };
    }
    if (route.stream === true) {
      http.responses = { 200: { content: { [route.contentType]: {} } } };
    } else {
      http.responses = {
        200: { content: { "application/json": { schema: jsonSchema(route.response) } } },
      };
    }

    const entry: Record<string, unknown> = {
      id: route.id,
      handler: `./controllers/${route.handler}.js`,
      safety: route.safety,
      description: route.description,
    };
    if (route.auth === true) entry.auth = true;
    if (route.stream === true) entry.stream = true;
    entry.http = http;
    if (route.errors !== undefined) entry.errors = route.errors;
    return entry;
  }),
});
