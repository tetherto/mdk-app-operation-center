import { mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { historySchema } from "./contract";

const load = createRequire(import.meta.url);

type Record_ = { ts: number; scope: string; hashrateThs: number; powerW: number; miners: number };
type Store = {
  open: () => Promise<void>;
  append: (records: Record_[]) => Promise<void>;
  query: (scope: string, start: number, end: number) => Promise<Record_[]>;
  prune: () => Promise<void>;
  close: () => Promise<void>;
  location: string | null;
};
type Snapshot = { ts: number; miners: Map<string, unknown>; meters: Map<string, unknown> };
type Modules = {
  createHistoryStore: (opts: {
    dir?: string | null;
    retentionMs: number;
    now?: () => number;
  }) => Store;
  createTopology: (layout: unknown) => unknown;
  sampleOf: (topology: unknown, snapshot: Snapshot) => Record_[];
  createSampler: (opts: {
    topology: unknown;
    snapshots: { fresh: () => Promise<Snapshot> };
    store: Store;
    intervalMs: number;
  }) => { tick: () => Promise<void>; start: () => void; stop: () => void };
  historySeries: (opts: {
    topology: unknown;
    store: Store;
    query: Record<string, unknown>;
    now?: number;
  }) => Promise<unknown>;
};
const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null ? { ...value } : {};
const isModules = (value: Record<string, unknown>): value is Record<string, unknown> & Modules =>
  ["createHistoryStore", "createTopology", "sampleOf", "createSampler", "historySeries"].every(
    (name) => typeof value[name] === "function",
  );
const merged: Record<string, unknown> = {};
for (const file of ["history-store", "topology", "sampler", "history"]) {
  Object.assign(merged, asRecord(load(`../../plugin/lib/${file}.js`)));
}
if (!isModules(merged)) throw new Error("plugin/lib history modules are missing an export");
const { createHistoryStore, createTopology, sampleOf, createSampler, historySeries } = merged;

const DAY = 24 * 60 * 60_000;
const layout = {
  containers: [
    {
      id: "c1",
      name: "C1",
      model: "M",
      nominalHashrateThs: 100,
      meterDeviceId: null,
      racks: [
        {
          id: "r1",
          name: "R1",
          sockets: [
            { position: "1", deviceId: "a" },
            { position: "2", deviceId: "b" },
            { position: "3", deviceId: null },
          ],
        },
      ],
    },
    {
      id: "c2",
      name: "C2",
      model: "M",
      nominalHashrateThs: 200,
      meterDeviceId: null,
      racks: [{ id: "r2", name: "R2", sockets: [{ position: "1", deviceId: "c" }] }],
    },
  ],
};
const miner = (id: string, hashrateThs: number, powerW: number) => ({
  id,
  hashrateThs,
  powerW,
  status: "normal",
  supportedPowerModes: [],
});
const snapshotAt = (ts: number, scale = 1): Snapshot => ({
  ts,
  miners: new Map([
    ["a", miner("a", 100 * scale, 3000)],
    ["b", miner("b", 90 * scale, 2900)],
    ["c", miner("c", 200 * scale, 3400)],
  ]),
  meters: new Map(),
});

const dirs: string[] = [];
const stores: Store[] = [];
afterEach(async () => {
  await Promise.all(stores.splice(0).map((store) => store.close()));
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});
const tempDir = () => {
  const dir = mkdtempSync(join(tmpdir(), "opcl-history-"));
  dirs.push(dir);
  return dir;
};
const openStore = async (opts: { dir: string | null; retentionMs: number; now?: () => number }) => {
  const store = createHistoryStore(opts);
  await store.open();
  stores.push(store);
  return store;
};
const sample = (ts: number, scope = "site", hashrateThs = 1): Record_ => ({
  ts,
  scope,
  hashrateThs,
  powerW: 1,
  miners: 1,
});

describe("history store", () => {
  it("keeps samples in a Hyperbee across a reopen and prunes expired ones", async () => {
    const dir = tempDir();
    let clock = 10 * DAY;
    const store = createHistoryStore({ dir, retentionMs: 2 * DAY, now: () => clock });
    await store.open();
    expect(store.location).toBe(join(dir, "history"));
    expect(await store.query("site", 0, clock)).toEqual([]);
    await store.append([sample(clock - 3 * DAY, "site", 1)]);
    await store.append([sample(clock - 60_000, "site", 2)]);
    expect(await store.query("site", 0, clock)).toHaveLength(2);
    await store.close();

    // open prunes what fell out of the retention window
    const reopened = await openStore({ dir, retentionMs: 2 * DAY, now: () => clock });
    expect(await reopened.query("site", 0, clock)).toEqual([sample(clock - 60_000, "site", 2)]);

    // a day after the last prune, the next append prunes again, every scope included
    await reopened.append([sample(clock, "rack:gone")]);
    clock += 2 * DAY + 1;
    await reopened.append([sample(clock, "site", 3)]);
    expect(await reopened.query("rack:gone", 0, clock)).toEqual([]);
    expect(await reopened.query("site", 0, Infinity)).toEqual([sample(clock, "site", 3)]);
  });

  it("answers a window of one scope by range read", async () => {
    const store = await openStore({ dir: tempDir(), retentionMs: Infinity });
    await store.append(Array.from({ length: 100 }, (_, i) => sample(i * 10, "rack:r1", i)));
    await store.append([sample(100, "rack:r10"), sample(100, "rack:r")]);
    expect((await store.query("rack:r1", 0, 10)).map((r) => r.ts)).toEqual([0]);
    expect((await store.query("rack:r1", 95, 125)).map((r) => r.ts)).toEqual([100, 110, 120]);
    expect((await store.query("rack:r1", 990, 20_000)).map((r) => r.ts)).toEqual([990]);
    expect(await store.query("rack:r1", 1000, 20_000)).toEqual([]);
    expect(await store.query("rack:r1", -50, 0)).toEqual([]);
    expect((await store.query("rack:r10", 0, Infinity)).map((r) => r.scope)).toEqual(["rack:r10"]);
    expect((await store.query("rack:r", 0, Infinity)).map((r) => r.scope)).toEqual(["rack:r"]);
    expect(await store.query("other", 0, 10)).toEqual([]);
  });

  it("refuses a data dir another store holds open", async () => {
    const dir = tempDir();
    await openStore({ dir, retentionMs: DAY });
    const second = createHistoryStore({ dir, retentionMs: DAY });
    await expect(second.open()).rejects.toThrow(/could not be locked/);
    await second.close().catch(() => {});
  });

  it("works in memory without a data dir", async () => {
    const store = await openStore({ dir: null, retentionMs: DAY });
    await store.append([sample(5, "rack:r1")]);
    expect(await store.query("rack:r1", 0, 10)).toHaveLength(1);
    expect(await store.query("rack:r1", 6, 10)).toHaveLength(0);
    expect(store.location).toBeNull();
  });
});

describe("sampler", () => {
  it("records the site, every container and every rack from one fresh snapshot", async () => {
    const topology = createTopology(layout);
    const records = sampleOf(topology, snapshotAt(1000));
    expect(records.map((r) => r.scope)).toEqual([
      "site",
      "container:c1",
      "rack:r1",
      "container:c2",
      "rack:r2",
    ]);
    expect(records[0]).toEqual({
      ts: 1000,
      scope: "site",
      hashrateThs: 390,
      powerW: 9300,
      miners: 3,
    });
    expect(records[2]).toMatchObject({ scope: "rack:r1", hashrateThs: 190, miners: 2 });

    const store = await openStore({ dir: null, retentionMs: DAY });
    let reads = 0;
    const sampler = createSampler({
      topology,
      snapshots: {
        fresh: async () => {
          reads += 1;
          return snapshotAt(reads);
        },
      },
      store,
      intervalMs: 60_000,
    });
    await sampler.tick();
    await sampler.tick();
    expect(reads).toBe(2);
    expect(await store.query("site", 0, 10)).toHaveLength(2);

    const failing = createSampler({
      topology,
      snapshots: {
        fresh: async () => {
          throw new Error("ERR_KERNEL_UNAVAILABLE");
        },
      },
      store,
      intervalMs: 60_000,
    });
    await expect(failing.tick()).resolves.toBeUndefined();
  });
});

describe("history series", () => {
  it("averages samples per bucket, skips empty buckets and sums the nominal hashrate of the scope", async () => {
    const topology = createTopology(layout);
    const now = Date.UTC(2026, 9, 23, 12, 7);
    const store = await openStore({ dir: tempDir(), retentionMs: 30 * DAY, now: () => now });
    const bucket = (minutesAgo: number) =>
      Math.floor((now - minutesAgo * 60_000) / 300_000) * 300_000;
    await store.append(sampleOf(topology, snapshotAt(bucket(10) + 10_000, 1)));
    await store.append(sampleOf(topology, snapshotAt(bucket(10) + 70_000, 3)));
    await store.append(sampleOf(topology, snapshotAt(bucket(0) + 1_000, 2)));

    const site = historySchema.parse(
      await historySeries({
        topology,
        store,
        query: { metric: "hashrate", interval: "5m", limit: 4 },
        now,
      }),
    );
    expect(site.metric === "hashrate" && site.nominal).toBe(400);
    expect(site.points).toEqual([
      { ts: bucket(10), value: 780 },
      { ts: bucket(0), value: 780 },
    ]);

    const rack = historySchema.parse(
      await historySeries({
        topology,
        store,
        query: { metric: "power", interval: "5m", limit: 4, rackId: "r2" },
        now,
      }),
    );
    expect(rack.points.map((p) => p.value)).toEqual([3400, 3400]);

    const container = historySchema.parse(
      await historySeries({
        topology,
        store,
        query: {
          metric: "hashrate",
          interval: "5m",
          start: bucket(10),
          end: bucket(0),
          containerId: "c1",
        },
        now,
      }),
    );
    expect(container.metric === "hashrate" && container.nominal).toBe(200);
    expect(container.points).toHaveLength(2);
    expect(container.points[0]!.value).toBe(380);
  });
});
