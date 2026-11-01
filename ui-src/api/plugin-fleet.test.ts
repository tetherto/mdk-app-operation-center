import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import { containersSchema, minerSchema, powerMetersSchema, siteSummarySchema } from "./contract";

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
type Client = {
  listWorkers: () => Promise<{ workers: Worker[] }>;
  getCapabilities: (id: string) => Promise<Capabilities>;
  pullTelemetry: (id: string, query: string) => Promise<Reply>;
};
type Topology = {
  minerIds: string[];
  meterIds: string[];
  deviceById: Map<string, unknown>;
  containers: unknown[];
};
type Snapshot = {
  ts: number;
  miners: Map<string, unknown>;
  meters: Map<string, { powerW: number; online: boolean }>;
};
type Fleet = { read: () => Promise<Snapshot>; recordSetPct: (id: string, pct: number) => void };
type Modules = {
  createTopology: (layout: unknown) => Topology;
  createFleet: (opts: { client: Client; topology: Topology; concurrency?: number }) => Fleet;
  createSnapshotCache: (opts: {
    ttlMs: number;
    read: () => Promise<Snapshot>;
    now?: () => number;
  }) => { get: () => Promise<Snapshot>; invalidate: () => void };
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
    async pullTelemetry(id) {
      opts.onPull?.(id);
      const reply = replies[id];
      if (reply === null) throw new Error("ERR_TELEMETRY_FAILED");
      return reply ?? null;
    },
  };
}

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

describe("fleet reader", () => {
  it("reads every device of the layout into contract miners and meters", async () => {
    const topology = createTopology(layout);
    const fleet = createFleet({ client: stubClient(), topology });
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
    const fleet = createFleet({ client, topology });
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
    const second = createFleet({ client: gone, topology });
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
    const fleet = createFleet({ client, topology });
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
    await createFleet({ client: slow, topology, concurrency: 2 }).read();
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
        return { ts, miners: new Map(), meters: new Map() };
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
        return { ts, miners: new Map(), meters: new Map() };
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
    const snapshot = await createFleet({ client: stubClient(), topology }).read();

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
