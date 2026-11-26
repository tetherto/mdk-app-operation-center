import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import {
  containerLayoutSchema,
  containersSchema,
  minerSchema,
  powerMetersSchema,
  siteSummarySchema,
} from "./contract";

// The worker-side modules are plain CommonJS factories (no ambient context),
// loaded here against stubbed Kernel replies in the shapes the Kernel sends.
const load = createRequire(import.meta.url);

type Capabilities = {
  capabilities: {
    telemetry: Array<{ name: string }>;
    commands: Array<{ name: string; params?: Array<{ name: string; enum?: string[] }> }>;
  };
};
type Reply = { deviceId: string; metrics: Record<string, unknown>; timestamp: number } | null;
type Worker = { workerId: string; state: string; deviceIds: string[] };
type Thing = { id: string; info?: Record<string, unknown>; last?: Record<string, unknown> };
type ListQuery = { type: "list"; limit: number; status: boolean };
type Client = {
  listWorkers: () => Promise<{ workers: Worker[] }>;
  getCapabilities: (id: string) => Promise<Capabilities>;
  pullTelemetry: (id: string, query: string | ListQuery) => Promise<Reply | { things: Thing[] }>;
  pullWorkerQuery?: (
    query: ListQuery & { workers: string[] },
  ) => Promise<{ workers: Record<string, { things: Thing[] }>; errors?: Record<string, string> }>;
};
type Topology = {
  minerIds: string[];
  meterIds: string[];
  envIds: string[];
  deviceById: Map<string, unknown>;
  containers: Array<{
    id: string;
    envDeviceId: string | null;
    containerDeviceId: string | null;
    racks: Array<{
      sockets: Array<{ position: string; pdu: string | null; socket: string | null }>;
    }>;
  }>;
};
type Snapshot = {
  ts: number;
  miners: Map<string, unknown>;
  meters: Map<string, { powerW: number; online: boolean }>;
  envTempC: Map<string, number | null>;
  pduSockets: Map<string, Map<string, { currentA: number | null; enabled: boolean | null }>>;
};
type Fleet = { read: () => Promise<Snapshot>; recordSetPct: (id: string, pct: number) => void };
type Modules = {
  createTopology: (layout: unknown) => Topology;
  createFleet: (opts: {
    client: Client;
    topology: Topology;
    concurrency?: number;
    liveFallback?: boolean;
    logger?: { warn: (...args: unknown[]) => void };
  }) => Fleet;
  createSnapshotCache: (opts: {
    ttlMs: number;
    read: () => Promise<Snapshot>;
    now?: () => number;
  }) => { get: () => Promise<Snapshot>; invalidate: () => void };
  envTempOf: (reply: unknown) => number | null;
  pduSocketsOf: (
    reply: unknown,
  ) => Map<string, { currentA: number | null; enabled: boolean | null }>;
  containerLayout: (t: Topology, s: Snapshot, id: string) => unknown;
  fingerprint: (caps: unknown) => {
    kind: string;
    supportedPowerModes: string[];
    pctCommand: string | null;
    hasDownloadLogs: boolean;
  };
  siteSummary: (t: Topology, s: Snapshot) => unknown;
  containers: (t: Topology, s: Snapshot) => unknown;
  powerMeters: (t: Topology, s: Snapshot) => unknown;
  miners: (
    t: Topology,
    s: Snapshot,
    q: Record<string, unknown>,
  ) => { items: unknown[]; total: number };
};
const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null ? { ...value } : {};
const EXPORTS = [
  "createTopology",
  "createFleet",
  "createSnapshotCache",
  "envTempOf",
  "pduSocketsOf",
  "containerLayout",
  "fingerprint",
  "siteSummary",
  "containers",
  "powerMeters",
  "miners",
];
const isModules = (value: Record<string, unknown>): value is Record<string, unknown> & Modules =>
  EXPORTS.every((name) => typeof value[name] === "function");
const modules = (): Modules => {
  const merged: Record<string, unknown> = {};
  for (const file of ["topology", "fleet", "snapshot", "normalize", "aggregate"]) {
    Object.assign(merged, asRecord(load(`../../plugin/lib/${file}.js`)));
  }
  if (!isModules(merged)) throw new Error("plugin/lib modules are missing an export");
  return merged;
};
const {
  createTopology,
  createFleet,
  createSnapshotCache,
  envTempOf,
  pduSocketsOf,
  containerLayout,
  fingerprint,
  siteSummary,
  containers,
  powerMeters,
  miners,
} = modules();

const WHATSMINER_CAPS: Capabilities = {
  capabilities: {
    telemetry: [{ name: "hashrate_rt" }, { name: "power" }, { name: "miner_stats" }],
    commands: [
      {
        name: "setPowerMode",
        params: [{ name: "mode", enum: ["low", "normal", "high", "sleep"] }],
      },
      { name: "setPowerPct", params: [{ name: "pct" }] },
      { name: "downloadLogs", params: [] },
    ],
  },
};
const ANTMINER_CAPS: Capabilities = {
  capabilities: {
    telemetry: [{ name: "hashrate_rt" }, { name: "ambient_temp" }],
    commands: [
      { name: "setPowerMode", params: [{ name: "mode", enum: ["normal", "sleep", "high"] }] },
      { name: "setHashratePercent", params: [{ name: "pct" }] },
    ],
  },
};
const METER_CAPS: Capabilities = {
  capabilities: { telemetry: [{ name: "active_power" }], commands: [] },
};

const whatsminerReply = (id: string, over: Record<string, unknown> = {}): Reply => ({
  deviceId: id,
  timestamp: 1_700_000_000_000,
  metrics: {
    hashrate_rt: 101.84,
    hashrate_avg: 101.5,
    power: 3247.64,
    temperature: 92.9,
    status: "mining",
    uptime: 1175,
    power_mode: "normal",
    device_info: { type: "M56S", "miner-sn": "WM1101", minersn: "WM1101", ip: "10.1.1.21" },
    miner_stats: { freq_avg: 788, env_temp: 34.8 },
    hashboards: [{ chip_frequency: 785 }, { chip_frequency: 791 }],
    ...over,
  },
});
const antminerReply = (id: string, over: Record<string, unknown> = {}): Reply => ({
  deviceId: id,
  timestamp: 1_700_000_000_000,
  metrics: {
    hashrate_rt: 198.45,
    hashrate_ideal: 200,
    power: 3420,
    temperature: 97,
    ambient_temp: 32.5,
    status: "mining",
    uptime: 1074,
    power_mode: "normal",
    device_info: { model: "Antminer S21", ip: "10.1.4.21", serial_number: "AM4101" },
    miner_stats: { summary: {}, stats: { freq_level: 90 } },
    hashboards: [{ freq_mhz: 575 }, { freq_mhz: 575 }],
    ...over,
  },
});

const layout = {
  containers: [
    {
      id: "c1",
      name: "Container 1",
      model: "MicroBT WhatsMiner M56S",
      nominalHashrateThs: 110,
      meterDeviceId: "meter-1",
      racks: [
        {
          id: "c1-r1",
          name: "Rack 1",
          sockets: [
            { position: "1-1-1", deviceId: "wm-1" },
            { position: "1-1-2", deviceId: "wm-2" },
            { position: "1-1-3", deviceId: "wm-3" },
            { position: "1-1-4", deviceId: null },
          ],
        },
      ],
    },
    {
      id: "c2",
      name: "Container 2",
      model: "Bitmain Antminer S21",
      nominalHashrateThs: 200,
      meterDeviceId: null,
      racks: [{ id: "c2-r1", name: "Rack 1", sockets: [{ position: "2-1-1", deviceId: "am-1" }] }],
    },
  ],
};

function stubClient(
  opts: {
    workers?: Worker[];
    replies?: Record<string, Reply>;
    failList?: Error;
    onPull?: (id: string) => void;
    // A worker-infra Worker's `list` answer; unset, the Worker serves no cache.
    things?: Thing[];
  } = {},
): Client {
  const workers = opts.workers ?? [
    { workerId: "w1", state: "READY", deviceIds: ["wm-1", "wm-2", "wm-3", "am-1", "meter-1"] },
  ];
  const replies: Record<string, Reply> = {
    "wm-1": whatsminerReply("wm-1"),
    "wm-2": whatsminerReply("wm-2", { power_mode: "low", status: "mining" }),
    "wm-3": null,
    "am-1": antminerReply("am-1"),
    "meter-1": { deviceId: "meter-1", timestamp: 1, metrics: { active_power: 62_792 } },
    ...opts.replies,
  };
  return {
    async listWorkers() {
      if (opts.failList) throw opts.failList;
      return { workers };
    },
    async getCapabilities(id) {
      if (id.startsWith("wm")) return WHATSMINER_CAPS;
      if (id.startsWith("am")) return ANTMINER_CAPS;
      return METER_CAPS;
    },
    async pullTelemetry(id, query) {
      if (typeof query === "object") {
        if (opts.things === undefined) throw new Error("ERR_TELEMETRY_TYPE_UNKNOWN: list");
        return { things: opts.things };
      }
      opts.onPull?.(id);
      const reply = replies[id];
      if (reply === null) throw new Error("ERR_TELEMETRY_FAILED");
      return reply ?? null;
    },
  };
}

describe("topology env devices", () => {
  it("indexes each env device once, shared or not, and leaves a container without one at null", () => {
    const [c1, c2] = layout.containers;
    const topology = createTopology({
      containers: [
        { ...c1, envDeviceId: "sensor-1" },
        { ...c2, envDeviceId: "sensor-1" },
        { ...c2, id: "c3", racks: [], envDeviceId: null },
        { ...c2, id: "c4", racks: [] },
      ],
    });
    expect(topology.envIds).toEqual(["sensor-1"]);
    expect(topology.deviceById.get("sensor-1")).toEqual({ kind: "env" });
    expect(topology.containers.map((c) => [c.id, c.envDeviceId])).toEqual([
      ["c1", "sensor-1"],
      ["c2", "sensor-1"],
      ["c3", null],
      ["c4", null],
    ]);
  });
});

describe("topology container devices", () => {
  it("keeps each container's device and each socket's PDU socket, null when unmapped", () => {
    const [c1, c2] = layout.containers;
    const rack = c1!.racks[0]!;
    const topology = createTopology({
      containers: [
        {
          ...c1,
          containerDeviceId: "bd-1",
          envDeviceId: "bd-1",
          racks: [
            {
              ...rack,
              sockets: [
                { ...rack.sockets[0]!, pdu: "1-1", socket: "a1" },
                ...rack.sockets.slice(1),
              ],
            },
          ],
        },
        c2,
      ],
    });
    const [first, second] = topology.containers;
    expect(first!.containerDeviceId).toBe("bd-1");
    expect(second!.containerDeviceId).toBeNull();
    expect(first!.racks[0]!.sockets.slice(0, 2)).toEqual([
      { position: "1-1-1", deviceId: "wm-1", pdu: "1-1", socket: "a1" },
      { position: "1-1-2", deviceId: "wm-2", pdu: null, socket: null },
    ]);
    expect(topology.deviceById.get("bd-1")).toEqual({ kind: "container", containerId: "c1" });
  });
});

describe("capability fingerprint", () => {
  it("tells miners from meters and reads the power commands", () => {
    expect(fingerprint(WHATSMINER_CAPS)).toEqual({
      kind: "miner",
      supportedPowerModes: ["sleep", "low", "normal", "high"],
      pctCommand: "setPowerPct",
      hasDownloadLogs: true,
    });
    expect(fingerprint(ANTMINER_CAPS)).toEqual({
      kind: "miner",
      supportedPowerModes: ["sleep", "normal", "high"],
      pctCommand: "setHashratePercent",
      hasDownloadLogs: false,
    });
    expect(fingerprint(METER_CAPS).kind).toBe("meter");
    expect(
      fingerprint({
        capabilities: {
          telemetry: [{ name: "hashrate_rt" }],
          commands: [{ name: "setPowerMode", params: [{ name: "mode" }] }],
        },
      }).supportedPowerModes,
    ).toEqual(["sleep", "normal", "high"]);
  });
});

describe("fleet reader, live fallback", () => {
  it("reads every device of the layout into contract miners and meters", async () => {
    const topology = createTopology(layout);
    const fleet = createFleet({ client: stubClient(), topology, liveFallback: true });
    const snapshot = await fleet.read();

    const wm = minerSchema.parse(snapshot.miners.get("wm-1"));
    expect(wm).toMatchObject({
      id: "wm-1",
      containerId: "c1",
      rackId: "c1-r1",
      position: "1-1-1",
      serial: "WM1101",
      ip: "10.1.1.21",
      status: "normal",
      powerMode: "normal",
      powerPct: null,
      hashrateThs: 101.84,
      powerW: 3247.64,
      frequencyMhz: 788,
      inletTempC: 34.8,
      chipTempC: 92.9,
      uptimeS: 1175,
      lastUpdate: 1_700_000_000_000,
    });
    expect(wm.supportedPowerModes).toEqual(["sleep", "low", "normal", "high"]);

    const am = minerSchema.parse(snapshot.miners.get("am-1"));
    expect(am).toMatchObject({
      serial: "AM4101",
      ip: "10.1.4.21",
      powerPct: 90,
      frequencyMhz: 575,
      inletTempC: 32.5,
      status: "normal",
    });

    expect(minerSchema.parse(snapshot.miners.get("wm-2")).status).toBe("low");
    expect(snapshot.meters.get("meter-1")).toEqual({ id: "meter-1", powerW: 62_792, online: true });
  });

  it("reports a failed pull and an unregistered device as offline, keeping the last identity", async () => {
    const topology = createTopology(layout);
    const client = stubClient({
      workers: [{ workerId: "w1", state: "READY", deviceIds: ["wm-1", "wm-3", "meter-1"] }],
    });
    const fleet = createFleet({ client, topology, liveFallback: true });
    const first = await fleet.read();
    expect(minerSchema.parse(first.miners.get("wm-3"))).toMatchObject({
      status: "offline",
      hashrateThs: 0,
      serial: "",
      powerMode: "normal",
    });
    expect(minerSchema.parse(first.miners.get("am-1"))).toMatchObject({
      status: "offline",
      supportedPowerModes: [],
    });

    // wm-1 drops off the registry: still a miner of the site, now offline, with the serial it had.
    const gone = stubClient({
      workers: [{ workerId: "w1", state: "READY", deviceIds: ["meter-1"] }],
    });
    const second = createFleet({ client: gone, topology, liveFallback: true });
    const snapshot = await second.read();
    expect(minerSchema.parse(snapshot.miners.get("wm-1")).status).toBe("offline");
    const again = await fleet.read();
    expect(minerSchema.parse(again.miners.get("wm-1")).serial).toBe("WM1101");
  });

  it("maps the worker's statuses and remembers the percent the app set", async () => {
    const topology = createTopology(layout);
    const client = stubClient({
      replies: {
        "wm-1": whatsminerReply("wm-1", { status: "error" }),
        "wm-2": whatsminerReply("wm-2", { status: "sleeping", power_mode: "sleep" }),
        "am-1": antminerReply("am-1", { status: "not_mining" }),
      },
    });
    const fleet = createFleet({ client, topology, liveFallback: true });
    fleet.recordSetPct("wm-2", 80);
    const snapshot = await fleet.read();
    expect(minerSchema.parse(snapshot.miners.get("wm-1")).status).toBe("error");
    expect(minerSchema.parse(snapshot.miners.get("wm-2"))).toMatchObject({
      status: "sleep",
      powerPct: 80,
    });
    expect(minerSchema.parse(snapshot.miners.get("am-1")).status).toBe("error");
  });

  it("bounds the pulls in flight", async () => {
    const topology = createTopology(layout);
    let inFlight = 0;
    let peak = 0;
    const client = stubClient();
    const slow: Client = {
      ...client,
      async pullTelemetry(id, query) {
        inFlight += 1;
        peak = Math.max(peak, inFlight);
        await new Promise((resolve) => setTimeout(resolve, 5));
        inFlight -= 1;
        return client.pullTelemetry(id, query);
      },
    };
    await createFleet({ client: slow, topology, concurrency: 2, liveFallback: true }).read();
    expect(peak).toBe(2);
  });

  it("answers 503 when the Kernel cannot be reached, and passes its refusals through", async () => {
    const topology = createTopology(layout);
    const down = createFleet({
      client: stubClient({ failList: new Error("ERR_MDK_CLIENT_UNAVAILABLE: no route") }),
      topology,
    });
    await expect(down.read()).rejects.toMatchObject({
      message: "ERR_KERNEL_UNAVAILABLE",
      statusCode: 503,
    });
    const refused = createFleet({
      client: stubClient({ failList: new Error("ERR_KERNEL_ACTION_FORBIDDEN: workers list") }),
      topology,
    });
    await expect(refused.read()).rejects.toThrow("ERR_KERNEL_ACTION_FORBIDDEN");
  });
});

// mdk-core snaps as a worker-infra Worker keeps them (`thing.last`).
const minerSnap = (over: Record<string, unknown> = {}, config: Record<string, unknown> = {}) => ({
  stats: {
    status: "mining",
    power_w: 3247.64,
    hashrate_mhs: { t_5m: 101_840_000, avg: 101_500_000 },
    temperature_c: { avg: 92.9, ambient: 34.8 },
    frequency_mhz: { avg: 788 },
    uptime_ms: 1_175_000,
    ...over,
  },
  config: { power_mode: "normal", network_config: { ip_address: "10.1.1.21" }, ...config },
});
const cachedThings = (): Thing[] => [
  { id: "wm-1", info: { serialNum: "WM1101" }, last: { ts: 1_700_000_000_000, snap: minerSnap() } },
  { id: "wm-2", last: { ts: 1, snap: minerSnap({}, { power_mode: "eco" }) } },
  { id: "wm-3", last: { ts: 1, snap: { success: false, stats: { status: "offline" } } } },
  { id: "am-1", last: {} },
  { id: "meter-1", last: { ts: 1, snap: { stats: { status: "ok", power_w: 62_792 } } } },
];

describe("fleet reader, worker cache", () => {
  it("reads every device from one cached list per Worker, never pulling a device", async () => {
    const topology = createTopology(layout);
    const pulled: string[] = [];
    const client = stubClient({ things: cachedThings(), onPull: (id) => pulled.push(id) });
    const snapshot = await createFleet({ client, topology, liveFallback: true }).read();

    expect(pulled).toEqual([]);
    expect(minerSchema.parse(snapshot.miners.get("wm-1"))).toMatchObject({
      serial: "WM1101",
      ip: "10.1.1.21",
      status: "normal",
      powerMode: "normal",
      hashrateThs: 101.84,
      powerW: 3247.64,
      frequencyMhz: 788,
      inletTempC: 34.8,
      chipTempC: 92.9,
      uptimeS: 1175,
      lastUpdate: 1_700_000_000_000,
    });
    expect(minerSchema.parse(snapshot.miners.get("wm-2")).status).toBe("low");
    // A failed last collection and a device never collected are offline.
    expect(minerSchema.parse(snapshot.miners.get("wm-3")).status).toBe("offline");
    expect(minerSchema.parse(snapshot.miners.get("am-1")).status).toBe("offline");
    expect(snapshot.meters.get("meter-1")).toEqual({ id: "meter-1", powerW: 62_792, online: true });
  });

  it("maps the cached statuses like the pulled ones", async () => {
    const topology = createTopology(layout);
    const things = cachedThings();
    things[0] = { id: "wm-1", last: { ts: 1, snap: minerSnap({ status: "error" }) } };
    things[1] = {
      id: "wm-2",
      last: { ts: 1, snap: minerSnap({ status: "sleeping" }, { power_mode: "sleep" }) },
    };
    const snapshot = await createFleet({ client: stubClient({ things }), topology }).read();
    expect(minerSchema.parse(snapshot.miners.get("wm-1")).status).toBe("error");
    expect(minerSchema.parse(snapshot.miners.get("wm-2")).status).toBe("sleep");
  });

  // MDK 0.14: a `list` addressed to a device answers for that device only;
  // the Worker's whole list comes from the Worker-scoped pullWorkerQuery.
  const mdk014Client = (opts: { failWorker?: boolean } = {}): Client & { queried: string[][] } => {
    const things = cachedThings();
    const queried: string[][] = [];
    return {
      ...stubClient({ things }),
      queried,
      async pullTelemetry(id) {
        return { things: things.filter((thing) => thing.id === id) };
      },
      async pullWorkerQuery({ workers }) {
        queried.push(workers);
        if (opts.failWorker) {
          return {
            workers: {},
            errors: Object.fromEntries(workers.map((w) => [w, "ERR_WORKER_UNREACHABLE"])),
          };
        }
        return { workers: Object.fromEntries(workers.map((w) => [w, { things }])) };
      },
    };
  };

  it("reads the Worker's whole list through pullWorkerQuery when the client has it", async () => {
    const topology = createTopology(layout);
    const client = mdk014Client();
    const snapshot = await createFleet({ client, topology }).read();
    expect(client.queried).toEqual([["w1"]]);
    expect(minerSchema.parse(snapshot.miners.get("wm-1")).status).toBe("normal");
    expect(minerSchema.parse(snapshot.miners.get("wm-2")).status).toBe("low");
    expect(snapshot.meters.get("meter-1")).toEqual({ id: "meter-1", powerW: 62_792, online: true });
  });

  it("falls back to the device-addressed list on a 0.13 client, which answers every method name", async () => {
    // The app runtime's client is a Proxy: any name is a function, and one the
    // client lacks throws ERR_MDK_CLIENT_NO_SUCH_METHOD when called.
    const base = stubClient({ things: cachedThings() });
    const methods = new Map<string | symbol, unknown>(Object.entries(base));
    const client = new Proxy(base, {
      get: (_target, prop) =>
        methods.get(prop) ??
        (async () => {
          throw new Error(`ERR_MDK_CLIENT_NO_SUCH_METHOD: ${String(prop)}`);
        }),
    });
    const snapshot = await createFleet({ client, topology: createTopology(layout) }).read();
    expect(minerSchema.parse(snapshot.miners.get("wm-1")).status).toBe("normal");
    expect(minerSchema.parse(snapshot.miners.get("wm-2")).status).toBe("low");
    expect(snapshot.meters.get("meter-1")).toEqual({ id: "meter-1", powerW: 62_792, online: true });
  });

  it("reads a Worker that pullWorkerQuery reports under errors as offline, logging the Kernel's code", async () => {
    const topology = createTopology(layout);
    const warnings: unknown[][] = [];
    const logger = { warn: (...args: unknown[]) => warnings.push(args) };
    const snapshot = await createFleet({
      client: mdk014Client({ failWorker: true }),
      topology,
      logger,
    }).read();
    for (const miner of snapshot.miners.values())
      expect(minerSchema.parse(miner).status).toBe("offline");
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.slice(1)).toEqual(["w1", "ERR_WORKER_UNREACHABLE"]);
  });

  it("logs a Worker without a list cache as such, once per reason", async () => {
    const topology = createTopology(layout);
    const warnings: unknown[][] = [];
    const logger = { warn: (...args: unknown[]) => warnings.push(args) };
    const fleet = createFleet({ client: stubClient(), topology, logger });
    await fleet.read();
    await fleet.read();
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.slice(1)).toEqual(["w1", "ERR_TELEMETRY_TYPE_UNKNOWN: list"]);
  });

  it("leaves the devices of a Worker without a cache offline unless liveFallback is on", async () => {
    const topology = createTopology(layout);
    const pulled: string[] = [];
    const snapshot = await createFleet({
      client: stubClient({ onPull: (id) => pulled.push(id) }),
      topology,
    }).read();
    expect(pulled).toEqual([]);
    for (const miner of snapshot.miners.values())
      expect(minerSchema.parse(miner).status).toBe("offline");
    expect(snapshot.meters.get("meter-1")).toEqual({ id: "meter-1", powerW: 0, online: false });
  });
});

const envReply = (id: string, metrics: Record<string, unknown>): Reply => ({
  deviceId: id,
  timestamp: 1,
  metrics,
});
// Container 1 reads the Bitdeer container worker; container 2 has no env device.
const envWorkers: Worker[] = [
  {
    workerId: "w1",
    state: "READY",
    deviceIds: ["wm-1", "wm-2", "wm-3", "am-1", "meter-1", "bd-1"],
  },
];
const envLayout = {
  containers: [{ ...layout.containers[0]!, envDeviceId: "bd-1" }, layout.containers[1]!],
};

describe("env temperature", () => {
  it("reads a container's ambient from its snap, a sensor's from temp_c, else the temperature channel", () => {
    // Bitdeer and Antspace: stats.ambient_temp_c; Bitdeer's temperature channel answers 0 without a reading.
    expect(
      envTempOf(
        envReply("bd-1", {
          snap: { stats: { status: "running", ambient_temp_c: 27.4 } },
          temperature: 27.4,
        }),
      ),
    ).toBe(27.4);
    expect(
      envTempOf(envReply("bd-1", { snap: { stats: { status: "running" } }, temperature: 0 })),
    ).toBeNull();
    // A container alarm does not void its ambient reading.
    expect(
      envTempOf(envReply("bd-1", { snap: { stats: { status: "error", ambient_temp_c: 31 } } })),
    ).toBe(31);
    // Seneca: stats.temp_c, voided when the probe is faulted.
    expect(envTempOf(envReply("s-1", { snap: { stats: { status: "ok", temp_c: 24.5 } } }))).toBe(
      24.5,
    );
    expect(
      envTempOf(envReply("s-1", { snap: { stats: { status: "error", temp_c: 850 } } })),
    ).toBeNull();
    // No snap: the temperature channel; a failed channel is no reading.
    expect(envTempOf(envReply("s-1", { temperature: 23 }))).toBe(23);
    expect(
      envTempOf(
        envReply("s-1", { snap: { error: "ERR_OFFLINE" }, temperature: { error: "ERR_OFFLINE" } }),
      ),
    ).toBeNull();
    expect(envTempOf(null)).toBeNull();
  });

  it("gives every miner and the container summary its container's reading, null without an env device", async () => {
    const topology = createTopology(envLayout);
    const client = stubClient({
      workers: [
        { workerId: "w1", state: "READY", deviceIds: ["wm-1", "wm-2", "wm-3", "am-1", "meter-1"] },
        { workerId: "w2", state: "READY", deviceIds: ["bd-1"] },
      ],
      replies: {
        "bd-1": envReply("bd-1", {
          snap: { stats: { status: "running", ambient_temp_c: 27.4, humidity_percent: 41 } },
          temperature: 27.4,
        }),
      },
    });
    const snapshot = await createFleet({ client, topology, liveFallback: true }).read();

    expect(snapshot.envTempC).toEqual(
      new Map([
        ["c1", 27.4],
        ["c2", null],
      ]),
    );
    expect(minerSchema.parse(snapshot.miners.get("wm-1")).envTempC).toBe(27.4);
    // The miner is offline; the container's reading is still the container's.
    expect(minerSchema.parse(snapshot.miners.get("wm-3"))).toMatchObject({
      status: "offline",
      envTempC: 27.4,
    });
    expect(minerSchema.parse(snapshot.miners.get("am-1")).envTempC).toBeNull();
    const body = containersSchema.parse(containers(topology, snapshot));
    expect(body.containers.map((c) => [c.id, c.envTempC])).toEqual([
      ["c1", 27.4],
      ["c2", null],
    ]);
  });

  it("reads null while the env device is unregistered or its pull fails", async () => {
    const topology = createTopology(envLayout);
    const unregistered = await createFleet({
      client: stubClient(),
      topology,
      liveFallback: true,
    }).read();
    expect(unregistered.envTempC.get("c1")).toBeNull();
    expect(minerSchema.parse(unregistered.miners.get("wm-1")).envTempC).toBeNull();

    const failing = stubClient({
      workers: [
        { workerId: "w1", state: "READY", deviceIds: ["wm-1", "wm-2", "wm-3", "am-1", "meter-1"] },
        { workerId: "w2", state: "READY", deviceIds: ["bd-1"] },
      ],
      replies: { "bd-1": null },
    });
    const failed = await createFleet({ client: failing, topology, liveFallback: true }).read();
    expect(failed.envTempC.get("c1")).toBeNull();
  });

  it("reads the env device from its Worker's cache", async () => {
    const topology = createTopology(envLayout);
    const things = [
      ...cachedThings(),
      {
        id: "bd-1",
        last: {
          ts: 1,
          snap: { stats: { status: "running", ambient_temp_c: 26.9, power_w: 0 }, config: {} },
        },
      },
    ];
    const snapshot = await createFleet({
      client: stubClient({ workers: envWorkers, things }),
      topology,
    }).read();
    expect(snapshot.envTempC.get("c1")).toBe(26.9);
    expect(minerSchema.parse(snapshot.miners.get("wm-1")).envTempC).toBe(26.9);
  });

  it("reads a cached sensor's temp_c unless its probe is faulted", async () => {
    const topology = createTopology(envLayout);
    const sensor = (stats: Record<string, unknown>) => ({
      id: "bd-1",
      last: { ts: 1, snap: { stats, config: {} } },
    });
    const ok = await createFleet({
      client: stubClient({
        workers: envWorkers,
        things: [...cachedThings(), sensor({ status: "ok", temp_c: 24.5 })],
      }),
      topology,
    }).read();
    expect(ok.envTempC.get("c1")).toBe(24.5);
    const faulted = await createFleet({
      client: stubClient({
        workers: envWorkers,
        things: [...cachedThings(), sensor({ status: "error", temp_c: 850 })],
      }),
      topology,
    }).read();
    expect(faulted.envTempC.get("c1")).toBeNull();
  });
});

// Container 1's sockets on PDU 1-1 of the Bitdeer worker bd-1 (wm-3's is not
// mapped, the empty socket is); container 2 has no container device.
const pduLayout = {
  containers: [
    {
      ...layout.containers[0]!,
      containerDeviceId: "bd-1",
      racks: [
        {
          ...layout.containers[0]!.racks[0]!,
          sockets: [
            { position: "1-1-1", deviceId: "wm-1", pdu: "1-1", socket: "a1" },
            { position: "1-1-2", deviceId: "wm-2", pdu: "1-1", socket: "a2" },
            { position: "1-1-3", deviceId: "wm-3" },
            { position: "1-1-4", deviceId: null, pdu: "1-1", socket: "a3" },
          ],
        },
      ],
    },
    layout.containers[1]!,
  ],
};
const bitdeerPdus = (pdus: unknown[]): Reply =>
  envReply("bd-1", {
    snap: { stats: { status: "running", container_specific: { pdu_data: pdus } } },
  });
const PDU_1_1 = {
  pdu: "1-1",
  power_w: 14_000,
  current_a: 20.2,
  sockets: [
    { socket: "a1", enabled: true, power_w: 7000, current_a: 10.1 },
    { socket: "a2", enabled: false, power_w: 0, current_a: 0 },
    { socket: "a3", enabled: true, power_w: 0, current_a: 0 },
  ],
};
const socketsOf = (body: unknown) =>
  containerLayoutSchema
    .parse(body)
    .racks.flatMap((r) => r.sockets.map((s) => [s.position, s.currentA, s.enabled]));

describe("PDU sockets", () => {
  it("reads each socket's current and on/off from the snap's pdu_data, none from an offline PDU", () => {
    const sockets = pduSocketsOf(
      bitdeerPdus([
        PDU_1_1,
        { pdu: "1-2", power_w: 0, current_a: 0, sockets: [], offline: true },
        { pdu: "2-1", sockets: [{ socket: "1", enabled: "yes", current_a: "7" }] },
      ]),
    );
    expect([...sockets]).toEqual([
      ["1-1 / a1", { currentA: 10.1, enabled: true }],
      ["1-1 / a2", { currentA: 0, enabled: false }],
      ["1-1 / a3", { currentA: 0, enabled: true }],
      ["2-1 / 1", { currentA: null, enabled: null }],
    ]);
    expect(pduSocketsOf(envReply("bd-1", { snap: { error: "ERR_OFFLINE" } })).size).toBe(0);
    expect(pduSocketsOf(null).size).toBe(0);
  });

  it("returns each mapped socket's reading on the container layout, null where there is none", async () => {
    const topology = createTopology(pduLayout);
    const client = stubClient({
      workers: envWorkers,
      replies: { "bd-1": bitdeerPdus([PDU_1_1]) },
    });
    const snapshot = await createFleet({ client, topology, liveFallback: true }).read();

    expect(socketsOf(containerLayout(topology, snapshot, "c1"))).toEqual([
      ["1-1-1", 10.1, true],
      ["1-1-2", 0, false],
      // Not mapped to a PDU socket: no reading, and no guess from the miner's power.
      ["1-1-3", null, null],
      // Empty, but powered.
      ["1-1-4", 0, true],
    ]);
    // No container device.
    expect(socketsOf(containerLayout(topology, snapshot, "c2"))).toEqual([["2-1-1", null, null]]);
  });

  it("reads null for every socket while the PDU is offline, the device unregistered or its pull failed", async () => {
    const topology = createTopology(pduLayout);
    const allNull = [
      ["1-1-1", null, null],
      ["1-1-2", null, null],
      ["1-1-3", null, null],
      ["1-1-4", null, null],
    ];
    const read = async (client: Client) =>
      socketsOf(
        containerLayout(
          topology,
          await createFleet({ client, topology, liveFallback: true }).read(),
          "c1",
        ),
      );

    expect(
      await read(
        stubClient({
          workers: envWorkers,
          replies: { "bd-1": bitdeerPdus([{ ...PDU_1_1, sockets: [], offline: true }]) },
        }),
      ),
    ).toEqual(allNull);
    expect(await read(stubClient())).toEqual(allNull);
    expect(await read(stubClient({ workers: envWorkers, replies: { "bd-1": null } }))).toEqual(
      allNull,
    );
  });

  it("reads the PDU sockets from the container Worker's cache", async () => {
    const topology = createTopology(pduLayout);
    const things = [
      ...cachedThings(),
      {
        id: "bd-1",
        last: {
          ts: 1,
          snap: {
            stats: {
              status: "running",
              power_w: 14_000,
              container_specific: { pdu_data: [PDU_1_1] },
            },
            config: {},
          },
        },
      },
    ];
    const snapshot = await createFleet({
      client: stubClient({ workers: envWorkers, things }),
      topology,
    }).read();
    expect(socketsOf(containerLayout(topology, snapshot, "c1"))).toEqual([
      ["1-1-1", 10.1, true],
      ["1-1-2", 0, false],
      ["1-1-3", null, null],
      ["1-1-4", 0, true],
    ]);
  });
});

describe("snapshot cache", () => {
  it("reuses a fresh snapshot, shares one read in flight, serves a stale one while refreshing, and waits after invalidate", async () => {
    let reads = 0;
    let clock = 0;
    let release: () => void = () => {};
    const cache = createSnapshotCache({
      ttlMs: 1000,
      now: () => clock,
      read: async () => {
        reads += 1;
        const ts = reads;
        if (ts > 1)
          await new Promise<void>((resolve) => {
            release = resolve;
          });
        return {
          ts,
          miners: new Map(),
          meters: new Map(),
          envTempC: new Map(),
          pduSockets: new Map(),
        };
      },
    });
    const [a, b] = await Promise.all([cache.get(), cache.get()]);
    expect(a).toBe(b);
    expect(reads).toBe(1);
    clock = 500;
    expect(await cache.get()).toBe(a);

    // Past the TTL: the stale snapshot is answered at once and one refresh starts.
    clock = 1500;
    expect((await cache.get()).ts).toBe(1);
    expect((await cache.get()).ts).toBe(1);
    expect(reads).toBe(2);
    release();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect((await cache.get()).ts).toBe(2);

    // After invalidate the next read is waited for.
    cache.invalidate();
    const fresh = cache.get();
    release();
    expect((await fresh).ts).toBe(3);
  });
});

describe("snapshot cache after a command", () => {
  it("invalidate retires a read in flight so the next get() waits for one started after it", async () => {
    let reads = 0;
    const releases: Array<() => void> = [];
    const cache = createSnapshotCache({
      ttlMs: 0,
      read: async () => {
        reads += 1;
        const ts = reads;
        await new Promise<void>((resolve) => releases.push(resolve));
        return {
          ts,
          miners: new Map(),
          meters: new Map(),
          envTempC: new Map(),
          pduSockets: new Map(),
        };
      },
    });
    const first = cache.get(); // read 1 in flight
    cache.invalidate(); // the command lands while it runs
    const second = cache.get(); // must not reuse read 1
    expect(reads).toBe(2);
    releases[0]!();
    releases[1]!();
    expect((await first).ts).toBe(1);
    expect((await second).ts).toBe(2);
    // Read 1 resolved after the invalidate and was not kept: the cache holds
    // read 2, served at once (ttl 0) while read 3 refreshes behind it.
    const third = await cache.get();
    expect(third.ts).toBe(2);
    expect(reads).toBe(3);
    releases[2]!();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect((await cache.get()).ts).toBe(3);
  });
});

describe("aggregation over a fleet snapshot", () => {
  it("builds the summary, containers, meters and miners page of the contract", async () => {
    const topology = createTopology(layout);
    const snapshot = await createFleet({
      client: stubClient(),
      topology,
      liveFallback: true,
    }).read();

    const summary = siteSummarySchema.parse(siteSummary(topology, snapshot));
    expect(summary.miners).toEqual({ total: 4, online: 3, error: 0, offline: 1 });

    const { containers: list } = containersSchema.parse(containers(topology, snapshot));
    const c1 = list[0]!;
    expect(c1.minerStatus).toMatchObject({ normal: 1, low: 1, offline: 1, empty: 1 });
    expect(c1.powerMode).toBeNull();
    expect(c1.supportedPowerModes).toEqual(["sleep", "low", "normal", "high"]);
    expect(c1.racks[0]!.minerStatus.empty).toBe(1);
    expect(list[1]!.powerMode).toBe("normal");
    expect(list[1]!.powerPct).toBe(90);

    const meters = powerMetersSchema.parse(powerMeters(topology, snapshot));
    expect(meters.meters).toEqual([
      {
        id: "meter-1",
        name: "meter-1",
        containerId: "c1",
        powerW: 62_792,
        hashrateThs: c1.hashrateThs,
        miners: 3,
      },
    ]);
    expect(meters.siteMeterPowerW).toBe(62_792);

    expect(miners(topology, snapshot, { search: "10.1.4" }).total).toBe(1);
    expect(
      miners(topology, snapshot, { containerId: "c1", pageSize: 2, page: 2 }).items,
    ).toHaveLength(1);
    expect(miners(topology, snapshot, { search: "WM-2" }).total).toBe(1);
  });
});

describe("site meter", () => {
  const withSiteMeter = { ...layout, siteMeterDeviceId: "dcs-1" };
  const workers: Worker[] = [
    { workerId: "w1", state: "READY", deviceIds: ["wm-1", "wm-2", "wm-3", "am-1", "meter-1"] },
    { workerId: "dcs", state: "READY", deviceIds: ["dcs-1"] },
  ];
  const dcs = (stats: Record<string, unknown>): Thing => ({
    id: "dcs-1",
    last: { ts: 1, snap: { stats } },
  });

  it("reads the site meter from its Worker's cache and makes it the total consumption", async () => {
    const topology = createTopology(withSiteMeter);
    const client = stubClient({
      workers,
      things: [...cachedThings(), dcs({ status: "running", power_w: 80_000 })],
    });
    const snapshot = await createFleet({ client, topology }).read();
    expect(snapshot.meters.get("dcs-1")).toEqual({ id: "dcs-1", powerW: 80_000, online: true });

    const meters = powerMetersSchema.parse(powerMeters(topology, snapshot));
    expect(meters.siteMeterPowerW).toBe(80_000);
    // The site meter is not a container's meter: no card of its own.
    expect(meters.meters.map((m) => m.id)).toEqual(["meter-1"]);
  });

  it("totals 0 while the site meter has no reading, not the container meters' sum", async () => {
    const topology = createTopology(withSiteMeter);
    const client = stubClient({
      workers,
      things: [...cachedThings(), dcs({ status: "offline" })],
    });
    const snapshot = await createFleet({ client, topology }).read();
    expect(powerMetersSchema.parse(powerMeters(topology, snapshot)).siteMeterPowerW).toBe(0);
  });
});
