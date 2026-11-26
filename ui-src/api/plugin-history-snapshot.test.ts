import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import { historySchema } from "./contract";

// The plugin's snapshot-backed history (plugin/lib/history-snapshot.js): the
// series it builds from the Workers' stores, and when it hands the query back
// to the app's own samples.
const load = createRequire(import.meta.url);
const snapshotHistory: unknown = load("../../plugin/lib/history-snapshot.js");
const topologyModule: unknown = load("../../plugin/lib/topology.js");
const historyWindow: unknown = load("../../plugin/lib/history-window.js");

type Query = Record<string, unknown>;
type Series = { points: Array<{ ts: number; value: number }>; nominal?: number } | null;
type Client = Record<string, (...args: unknown[]) => Promise<unknown>>;
type Logger = { debug: (...args: unknown[]) => void };
type SnapshotHistory = {
  createSnapshotHistory: (deps: { client: Client; topology: unknown; logger?: Logger }) => {
    series: (query: Query, now?: number) => Promise<Series>;
  };
};
type Topology = { createTopology: (layout: unknown) => unknown };
type HistoryWindow = { resolveHistoryQuery: (query: Query) => Query };
const exportsFunction = (value: unknown, name: string): boolean =>
  typeof value === "object" &&
  value !== null &&
  name in value &&
  typeof Object.getOwnPropertyDescriptor(value, name)?.value === "function";
const isSnapshotHistory = (value: unknown): value is SnapshotHistory =>
  exportsFunction(value, "createSnapshotHistory");
const isTopology = (value: unknown): value is Topology => exportsFunction(value, "createTopology");
const isHistoryWindow = (value: unknown): value is HistoryWindow =>
  exportsFunction(value, "resolveHistoryQuery");
if (
  !isSnapshotHistory(snapshotHistory) ||
  !isTopology(topologyModule) ||
  !isHistoryWindow(historyWindow)
) {
  throw new Error("a plugin module has an unexpected shape");
}
const { createSnapshotHistory } = snapshotHistory;
const { createTopology } = topologyModule;
const { resolveHistoryQuery } = historyWindow;

const MIN = 60_000;
const T0 = Date.UTC(2026, 10, 2, 12, 0);
const NOW = T0 + 12 * MIN;

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
            { position: "1-1-2", deviceId: "wm-2" },
          ],
        },
      ],
    },
    {
      id: "c2",
      name: "Container 2",
      model: "S21",
      nominalHashrateThs: 200,
      meterDeviceId: null,
      racks: [{ id: "c2-r1", name: "Rack 1", sockets: [{ position: "2-1-1", deviceId: "am-1" }] }],
    },
  ],
};
const topology = createTopology(layout);

const workers = [
  { workerId: "miners-c1", state: "READY", deviceIds: ["wm-1", "wm-2"] },
  { workerId: "miners-c2", state: "READY", deviceIds: ["am-1"] },
  { workerId: "gone", state: "DEAD", deviceIds: ["wm-1"] },
];

/** Three 5 m buckets ending now: T0, T0 + 5 m, T0 + 10 m. */
const last3 = (metric: string, scope: Query = {}) =>
  resolveHistoryQuery({ metric, interval: "5m", limit: 3, ...scope });

const point = (ts: number, value: number) => ({ ts, value });

function clientWith(answer: unknown, calls: unknown[] = []): Client {
  return {
    async listWorkers() {
      return { workers };
    },
    async pullSnapshot(query: unknown) {
      calls.push(query);
      if (answer instanceof Error) throw answer;
      return answer;
    },
  };
}

describe("snapshot history", () => {
  it("sums each miner's reading nearest to the bucket start and skips empty buckets", async () => {
    const calls: unknown[] = [];
    const client = clientWith(
      {
        devices: {
          "wm-1": {
            ts: T0 + 5 * MIN - 20_000,
            metrics: {
              hashrate_rt: { points: [point(T0 + 10_000, 100), point(T0 + 5 * MIN - 20_000, 110)] },
            },
          },
          // No real-time channel stored: the average one stands in.
          "wm-2": {
            ts: T0,
            metrics: { hashrate_rt: { points: [] }, hashrate_avg: { points: [point(T0, 50)] } },
          },
        },
        snapshotTs: T0 + 5 * MIN - 20_000,
      },
      calls,
    );
    const history = createSnapshotHistory({ client, topology });

    const series = await history.series(last3("hashrate", { containerId: "c1" }), NOW);

    expect(historySchema.parse(series)).toEqual({
      metric: "hashrate",
      interval: "5m",
      unit: "TH/s",
      points: [point(T0, 150), point(T0 + 5 * MIN, 110)],
      nominal: 220,
    });
    expect(calls).toEqual([
      {
        workers: ["miners-c1"],
        metrics: ["hashrate_rt", "hashrate_avg"],
        from: T0,
        to: NOW,
        granularity: 5 * MIN,
      },
    ]);
  });

  it("reads every worker hosting the scope for a site-wide power series, counting a failed reading 0", async () => {
    const calls: unknown[] = [];
    const client = clientWith(
      {
        devices: {
          "wm-1": { ts: T0, metrics: { power: { points: [point(T0, 3000)] } } },
          "wm-2": {
            ts: T0,
            metrics: { power: { points: [{ ts: T0, error: "ERR_TELEMETRY_FAILED" }] } },
          },
          "am-1": {
            ts: T0 + 10 * MIN,
            metrics: { power: { points: [point(T0 + 10 * MIN, 5000)] } },
          },
        },
        snapshotTs: T0 + 10 * MIN,
      },
      calls,
    );
    const history = createSnapshotHistory({ client, topology });

    const series = await history.series(last3("power"), NOW);

    expect(historySchema.parse(series)).toEqual({
      metric: "power",
      interval: "5m",
      unit: "W",
      points: [point(T0, 3000), point(T0 + 10 * MIN, 5000)],
    });
    expect(calls[0]).toMatchObject({ workers: ["miners-c1", "miners-c2"], metrics: ["power"] });
  });

  it("keeps the reading nearest to a bucket when two land in it", async () => {
    const client = clientWith({
      devices: {
        "wm-1": {
          ts: T0,
          metrics: {
            power: { points: [point(T0 - 2 * MIN, 1), point(T0 + MIN, 2), point(T0 + 4 * MIN, 3)] },
          },
        },
      },
      snapshotTs: T0,
    });
    const history = createSnapshotHistory({ client, topology });

    const series = await history.series(last3("power", { rackId: "c1-r1" }), NOW);

    expect(series?.points).toEqual([point(T0, 2), point(T0 + 5 * MIN, 3)]);
  });

  describe("hands the query back to the app's samples", () => {
    const query = last3("hashrate", { containerId: "c1" });
    const expectFallback = async (client: Client) => {
      const reasons: unknown[] = [];
      const logger = { debug: (...args: unknown[]) => reasons.push(args) };
      const history = createSnapshotHistory({ client, topology, logger });
      expect(await history.series(query, NOW)).toBeNull();
      expect(reasons).toHaveLength(1);
    };

    it("when the client has no pullSnapshot", () =>
      expectFallback({
        async listWorkers() {
          return { workers };
        },
      }));

    it("when the client rejects it (MDK 0.13.0)", () =>
      expectFallback(clientWith(new Error("ERR_MDK_CLIENT_NO_SUCH_METHOD: pullSnapshot"))));

    it("when the Kernel answers an error", () =>
      expectFallback(clientWith({ error: "ERR_UNSUPPORTED_QUERY" })));

    it("when the Kernel answers nothing", () => expectFallback(clientWith(null)));

    it("when a worker keeps no store", () =>
      expectFallback(
        clientWith({
          devices: {},
          snapshotTs: null,
          errors: { "miners-c1": "ERR_TELEMETRY_STORE_DISABLED: snapshot" },
        }),
      ));

    it("when no worker hosts the scope", () =>
      expectFallback({
        ...clientWith({ devices: {} }),
        async listWorkers() {
          return { workers: [] };
        },
      }));
  });
});
