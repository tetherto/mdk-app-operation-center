/**
 * The Operation Center Lite route contract: every request and response body of
 * the app's Gateway routes (plugin/mdk-plugin.json), as zod schemas. The UI
 * parses every response with these, and the contract test checks the plugin's
 * mock site against them, so the UI, the mock and the real plugin cannot drift.
 *
 * Units are fixed per field and named in the field: TH/s, W, °C, ms epoch, s.
 * Shaping for display (PH/s, MW, W/TH/s) happens in the feature hooks.
 */
import { z } from "zod";

// --- Shared value vocabularies ------------------------------------------------

export const POWER_MODES = ["sleep", "low", "normal", "high"] as const;
export const MINER_STATUSES = ["offline", "error", "sleep", "low", "normal", "high"] as const;
export const HISTORY_METRICS = ["hashrate", "power"] as const;
/** Bucket sizes of a history series: one point per bucket (the workers' stat-5m ... stat-1D logs). */
export const HISTORY_INTERVALS = ["5m", "30m", "3h", "1d"] as const;

export const powerModeSchema = z.enum(POWER_MODES);
export const minerStatusSchema = z.enum(MINER_STATUSES);
export const historyMetricSchema = z.enum(HISTORY_METRICS);
export const historyIntervalSchema = z.enum(HISTORY_INTERVALS);

export type PowerMode = z.infer<typeof powerModeSchema>;
export type MinerStatus = z.infer<typeof minerStatusSchema>;
export type HistoryMetric = z.infer<typeof historyMetricSchema>;
export type HistoryInterval = z.infer<typeof historyIntervalSchema>;

const nonNegative = z.number().nonnegative();
const percent = z.number().min(0).max(100);
const epochMs = z.number().int().nonnegative();

/** Miner count per status, plus `empty` sockets. */
export const minerStatusCountsSchema = z.object({
  offline: z.number().int().nonnegative(),
  error: z.number().int().nonnegative(),
  sleep: z.number().int().nonnegative(),
  low: z.number().int().nonnegative(),
  normal: z.number().int().nonnegative(),
  high: z.number().int().nonnegative(),
  empty: z.number().int().nonnegative(),
});
export type MinerStatusCounts = z.infer<typeof minerStatusCountsSchema>;

/** Body of every non-2xx response, as the Gateway sends it. */
export const apiErrorSchema = z.object({
  statusCode: z.number().int(),
  error: z.string(),
  message: z.string(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

// --- GET /api/config -----------------------------------------------------------

export const siteConfigSchema = z.object({
  siteName: z.string(),
  /** False on the hosted demo: the UI shows live data but disables every command. */
  commandsEnabled: z.boolean(),
  /** Where the hosted demo's "Download the App" button points; null shows no button. */
  downloadUrl: z.url({ protocol: /^https?$/ }).nullable(),
});
export type SiteConfig = z.infer<typeof siteConfigSchema>;

// --- GET /api/site/summary -----------------------------------------------------

export const siteSummarySchema = z.object({
  miners: z.object({
    total: z.number().int().nonnegative(),
    online: z.number().int().nonnegative(),
    error: z.number().int().nonnegative(),
    offline: z.number().int().nonnegative(),
  }),
  hashrateThs: nonNegative,
  powerW: nonNegative,
});
export type SiteSummary = z.infer<typeof siteSummarySchema>;

// --- GET /api/containers -------------------------------------------------------

export const rackSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  containerId: z.string(),
  hashrateThs: nonNegative,
  powerW: nonNegative,
  minerStatus: minerStatusCountsSchema,
});
export type RackSummary = z.infer<typeof rackSummarySchema>;

export const containerSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Miner model shown under the container name, e.g. "MicroBT WhatsMiner M56". */
  model: z.string(),
  hashrateThs: nonNegative,
  powerW: nonNegative,
  /** The container-wide power mode; null when its miners run in mixed modes. */
  powerMode: powerModeSchema.nullable(),
  /** The container-wide power percentage; null when mixed. */
  powerPct: percent.nullable(),
  /** Power modes every miner in the container accepts (vendors differ). */
  supportedPowerModes: z.array(powerModeSchema),
  minerStatus: minerStatusCountsSchema,
  racks: z.array(rackSummarySchema),
});
export type ContainerSummary = z.infer<typeof containerSummarySchema>;

export const containersSchema = z.object({ containers: z.array(containerSummarySchema) });
export type Containers = z.infer<typeof containersSchema>;

// --- GET /api/history ----------------------------------------------------------

/** Most buckets one history request returns. */
export const HISTORY_MAX_POINTS = 1000;
/** Buckets returned when the query gives no window: the last day at 5-minute buckets. */
export const HISTORY_DEFAULT_POINTS = 288;

const historyFields = {
  metric: historyMetricSchema,
  interval: historyIntervalSchema,
  /** Narrow the series to one container; without it the series is site-wide. */
  containerId: z.string().optional(),
  /** Narrow the series to one rack. */
  rackId: z.string().optional(),
};
const historyLimit = z.number().int().min(1).max(HISTORY_MAX_POINTS);

/**
 * `GET /api/history` query as the route accepts it: one point per `interval`
 * bucket, either the last `limit` buckets ending now (default
 * {@link HISTORY_DEFAULT_POINTS}), or every bucket between `start` and `end`
 * (ms epoch). Which window applies is resolved by the plugin.
 */
export const historyRequestSchema = z.object({
  ...historyFields,
  limit: historyLimit.optional(),
  start: epochMs.optional(),
  end: epochMs.optional(),
});

/** A history query the UI sends: exactly one of the two window forms. */
export const historyQuerySchema = z.union([
  z.object({ ...historyFields, limit: historyLimit.optional() }),
  z.object({ ...historyFields, start: epochMs, end: epochMs }),
]);
export type HistoryQuery = z.infer<typeof historyQuerySchema>;

/** One bucket: `ts` is the bucket start, `value` its average. */
export const historyPointSchema = z.object({ ts: epochMs, value: nonNegative });
export type HistoryPoint = z.infer<typeof historyPointSchema>;

export const historySchema = z.discriminatedUnion("metric", [
  z.object({
    metric: z.literal("hashrate"),
    interval: historyIntervalSchema,
    unit: z.literal("TH/s"),
    points: z.array(historyPointSchema),
    /** Nominal hashrate of the same scope, TH/s. */
    nominal: nonNegative,
  }),
  z.object({
    metric: z.literal("power"),
    interval: historyIntervalSchema,
    unit: z.literal("W"),
    points: z.array(historyPointSchema),
  }),
]);
export type History = z.infer<typeof historySchema>;

// --- GET /api/power-meters -----------------------------------------------------

export const powerMeterSchema = z.object({
  id: z.string(),
  name: z.string(),
  containerId: z.string(),
  powerW: nonNegative,
  /** Hashrate of the miners behind this meter. */
  hashrateThs: nonNegative,
  miners: z.number().int().nonnegative(),
});
export type PowerMeter = z.infer<typeof powerMeterSchema>;

export const powerMetersSchema = z.object({
  /** Site meter total. Site efficiency = this / hashrate. */
  siteMeterPowerW: nonNegative,
  /** Sum of the miners' own power readings. Mining efficiency = this / hashrate. */
  minersPowerW: nonNegative,
  hashrateThs: nonNegative,
  meters: z.array(powerMeterSchema),
});
export type PowerMeters = z.infer<typeof powerMetersSchema>;

// --- Miners --------------------------------------------------------------------

export const minerSchema = z.object({
  id: z.string(),
  serial: z.string(),
  ip: z.string(),
  containerId: z.string(),
  rackId: z.string(),
  /** Socket position in the rack, e.g. "1-1-3". */
  position: z.string(),
  status: minerStatusSchema,
  powerMode: powerModeSchema,
  /**
   * Power percentage: the worker's reading, or else the last value the app
   * applied; null when neither is known.
   */
  powerPct: percent.nullable(),
  supportedPowerModes: z.array(powerModeSchema),
  hashrateThs: nonNegative,
  powerW: nonNegative,
  frequencyMhz: nonNegative,
  inletTempC: z.number(),
  chipTempC: z.number(),
  uptimeS: nonNegative,
  /** Last successful poll. */
  lastUpdate: epochMs,
});
export type Miner = z.infer<typeof minerSchema>;

/** `GET /api/containers/:id/layout`: the socket grid of one container. */
export const containerLayoutSchema = z.object({
  container: containerSummarySchema.pick({
    id: true,
    name: true,
    model: true,
    hashrateThs: true,
    powerW: true,
  }),
  racks: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      sockets: z.array(z.object({ position: z.string(), miner: minerSchema.nullable() })),
    }),
  ),
});
export type ContainerLayout = z.infer<typeof containerLayoutSchema>;

/** Miners per page when the query gives no `pageSize`. */
export const MINERS_DEFAULT_PAGE_SIZE = 20;
/** Largest `pageSize` a miners query accepts. */
export const MINERS_MAX_PAGE_SIZE = 200;

/** `GET /api/miners` query, for the Explorer Miners tab. */
export const minersQuerySchema = z.object({
  containerId: z.string().optional(),
  /** Matches id, serial, IP or position. */
  search: z.string().optional(),
  /** 1-based. */
  page: z.number().int().positive().optional(),
  /** Default {@link MINERS_DEFAULT_PAGE_SIZE}. */
  pageSize: z.number().int().min(1).max(MINERS_MAX_PAGE_SIZE).optional(),
});
export type MinersQuery = z.infer<typeof minersQuerySchema>;

export const minersPageSchema = z.object({
  items: z.array(minerSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});
export type MinersPage = z.infer<typeof minersPageSchema>;

/**
 * `GET /api/miners/:id/logs` streams the miner's log archive as a download
 * (the worker's `downloadLogs` result). The response is bytes, not JSON: the
 * content type is what the worker reports, declared as this in the route table.
 */
export const MINER_LOGS_CONTENT_TYPE = "application/octet-stream";

// --- Commands --------------------------------------------------------------------

/** Which miners a command acts on: a whole container, or selected miners. */
export const commandTargetSchema = z.union([
  z.object({ containerId: z.string() }),
  z.object({ minerIds: z.array(z.string()).min(1) }),
]);
export type CommandTarget = z.infer<typeof commandTargetSchema>;

export const powerModeCommandSchema = z.object({
  target: commandTargetSchema,
  mode: powerModeSchema,
});
export type PowerModeCommand = z.infer<typeof powerModeCommandSchema>;

export const powerPctCommandSchema = z.object({ target: commandTargetSchema, pct: percent });
export type PowerPctCommand = z.infer<typeof powerPctCommandSchema>;

/**
 * Response of both command routes. Commands apply directly, with no approval
 * step: the design has none. 403 when `commandsEnabled` is false. A target that
 * matches no miners is not an error: `accepted: false`, `minerCount: 0`.
 */
export const commandResultSchema = z.object({
  accepted: z.boolean(),
  minerCount: z.number().int().nonnegative(),
});
export type CommandResult = z.infer<typeof commandResultSchema>;

// --- Site layout (app config) ----------------------------------------------------

/**
 * The site's physical layout, from the app's `layout` config (mdk-app.yaml
 * defaults, overridden by `config` in mdk.yaml). MDK devices carry no position,
 * so this is where containers, racks and sockets come from. Names follow the
 * MiningOS vocabulary (`info.container`, `info.pos` = `<rack>_<slot>`), so a
 * MiningOS export maps onto it directly.
 *
 * The plugin validates it at boot (plugin/lib/config.js) with the same rules;
 * api/contract.test.ts holds both to one set of fixtures.
 */
export const layoutSocketSchema = z.object({
  /** Position in the rack, e.g. "1-3". Unique within the rack. */
  position: z.string().min(1),
  /** The MDK device in this socket; null for an empty socket. Unique across the site. */
  deviceId: z.string().min(1).nullable(),
});
export type LayoutSocket = z.infer<typeof layoutSocketSchema>;

export const layoutRackSchema = z.object({
  /** Unique across the site. */
  id: z.string().min(1),
  name: z.string().min(1),
  sockets: z.array(layoutSocketSchema),
});
export type LayoutRack = z.infer<typeof layoutRackSchema>;

export const layoutContainerSchema = z.object({
  /** Unique across the site. */
  id: z.string().min(1),
  name: z.string().min(1),
  /** Miner model shown under the container name, e.g. "MicroBT WhatsMiner M56". */
  model: z.string().min(1),
  /** Nominal hashrate of one miner in this container, TH/s. */
  nominalHashrateThs: nonNegative,
  /** The power meter device behind this container; null when it has none. */
  meterDeviceId: z.string().min(1).nullable(),
  racks: z.array(layoutRackSchema),
});
export type LayoutContainer = z.infer<typeof layoutContainerSchema>;

const unique = (
  ctx: z.RefinementCtx,
  kind: string,
  values: string[],
  path: (string | number)[],
) => {
  const seen = new Set<string>();
  values.forEach((value, i) => {
    if (seen.has(value)) {
      ctx.addIssue({ code: "custom", message: `duplicate ${kind} "${value}"`, path: [...path, i] });
    }
    seen.add(value);
  });
};

export const layoutSchema = z
  .object({ containers: z.array(layoutContainerSchema) })
  .superRefine((layout, ctx) => {
    unique(
      ctx,
      "container id",
      layout.containers.map((c) => c.id),
      ["containers"],
    );
    unique(
      ctx,
      "rack id",
      layout.containers.flatMap((c) => c.racks.map((r) => r.id)),
      ["containers"],
    );
    layout.containers.forEach((container, ci) => {
      container.racks.forEach((rack, ri) => {
        unique(
          ctx,
          "socket position",
          rack.sockets.map((s) => s.position),
          ["containers", ci, "racks", ri, "sockets"],
        );
      });
    });
    const deviceIds = layout.containers.flatMap((c) => [
      ...(c.meterDeviceId === null ? [] : [c.meterDeviceId]),
      ...c.racks.flatMap((r) =>
        r.sockets.flatMap((s) => (s.deviceId === null ? [] : [s.deviceId])),
      ),
    ]);
    unique(ctx, "device id", deviceIds, ["containers"]);
  });
export type Layout = z.infer<typeof layoutSchema>;
