import { createRequire } from "node:module";

import { beforeEach, describe, expect, it } from "vitest";

import {
  commandResultSchema,
  containerLayoutSchema,
  containersSchema,
  historySchema,
  layoutSchema,
  minersPageSchema,
  powerMetersSchema,
  siteConfigSchema,
  siteSummarySchema,
} from "./contract";

// The plugin's mock site is the executable version of the contract: every body
// it returns must parse with the schema the UI parses it with.
type MockSite = {
  config: () => unknown;
  summary: () => unknown;
  containers: () => unknown;
  powerMeters: () => unknown;
  history: (query: object, now?: number) => unknown;
  containerLayout: (id: string) => unknown;
  miners: (query: object) => unknown;
  minerLogs: (id: string) => { filename: string; contentType: string; data: unknown } | null;
  setPowerMode: (target: object, mode: string) => unknown;
  setPowerPct: (target: object, pct: number) => unknown;
};
const mockModule: unknown = createRequire(import.meta.url)("../../plugin/lib/mock-site.js");
const isMockModule = (value: unknown): value is { createMockSite: () => MockSite } =>
  typeof value === "object" &&
  value !== null &&
  "createMockSite" in value &&
  typeof value.createMockSite === "function";
if (!isMockModule(mockModule))
  throw new Error("plugin/lib/mock-site.js does not export createMockSite");
const { createMockSite } = mockModule;

let site: MockSite;
beforeEach(() => {
  site = createMockSite();
});

describe("plugin mock site matches the contract", () => {
  it("serves config, summary, containers and power meters", () => {
    expect(() => siteConfigSchema.parse(site.config())).not.toThrow();
    expect(() => siteSummarySchema.parse(site.summary())).not.toThrow();
    expect(() => containersSchema.parse(site.containers())).not.toThrow();
    expect(() => powerMetersSchema.parse(site.powerMeters())).not.toThrow();
  });

  it("serves the last `limit` buckets ending now", () => {
    const now = Date.UTC(2026, 9, 21, 12, 7);
    const history = historySchema.parse(
      site.history({ metric: "hashrate", interval: "5m", limit: 12 }, now),
    );
    const [first, second] = history.points;

    expect(history.points).toHaveLength(12);
    expect(history.points.at(-1)?.ts).toBe(Date.UTC(2026, 9, 21, 12, 5));
    expect((second?.ts ?? 0) - (first?.ts ?? 0)).toBe(5 * 60_000);
  });

  it("serves every bucket of a custom window, scoped to a container", () => {
    const start = Date.UTC(2026, 9, 20);
    const query = { metric: "power", interval: "3h", start, end: start + 24 * 3_600_000 };
    const history = historySchema.parse(site.history({ ...query, containerId: "container-2" }));

    expect(history.metric).toBe("power");
    expect(history.points).toHaveLength(9);
  });

  it("serves a container layout, and null for an unknown container", () => {
    const layout = containerLayoutSchema.parse(site.containerLayout("container-1"));

    expect(layout.racks.length).toBeGreaterThan(0);
    expect(site.containerLayout("nope")).toBeNull();
  });

  it("serves paged and searched miners, and a miner's log file", () => {
    const page = minersPageSchema.parse(site.miners({ search: "10.1.1", pageSize: 3 }));
    const first = page.items[0];

    expect(page.items).toHaveLength(3);
    expect(first).toBeDefined();
    const logs = site.minerLogs(first?.id ?? "");
    expect(logs?.filename).toBe(`${first?.id}-logs.txt`);
    expect(logs?.contentType).toMatch(/^text\/plain/);
    expect(Buffer.isBuffer(logs?.data)).toBe(true);
    expect(site.minerLogs("nope")).toBeNull();
  });
});

// The layout the dev stack and a deployed site write into the app config.
const socket = (position: string, deviceId: string | null) => ({ position, deviceId });
const layoutFixture = {
  containers: [
    {
      id: "container-1",
      name: "Container 1",
      model: "MicroBT WhatsMiner M56",
      nominalHashrateThs: 212,
      meterDeviceId: "meter-1",
      racks: [
        { id: "c1-r1", name: "Rack 1", sockets: [socket("1-1", "wm-1"), socket("1-2", null)] },
        { id: "c1-r2", name: "Rack 2", sockets: [socket("1-1", "wm-2")] },
      ],
    },
    {
      id: "container-2",
      name: "Container 2",
      model: "Bitmain Antminer S21",
      nominalHashrateThs: 200,
      meterDeviceId: null,
      racks: [{ id: "c2-r1", name: "Rack 1", sockets: [socket("1-1", "am-1")] }],
    },
  ],
};

describe("layout config schema", () => {
  it("accepts a site with empty sockets and a container without a meter", () => {
    expect(layoutSchema.safeParse(layoutFixture).success).toBe(true);
    expect(layoutSchema.safeParse({ containers: [] }).success).toBe(true);
  });

  it("rejects a device that sits in two sockets, or is both a meter and a miner", () => {
    const twice = structuredClone(layoutFixture);
    twice.containers[1]!.racks[0]!.sockets[0]!.deviceId = "wm-1";
    expect(layoutSchema.safeParse(twice).success).toBe(false);

    const meterAndMiner = structuredClone(layoutFixture);
    meterAndMiner.containers[1]!.meterDeviceId = "wm-2";
    expect(layoutSchema.safeParse(meterAndMiner).success).toBe(false);
  });

  it("rejects repeated container ids, rack ids and socket positions", () => {
    const rack = structuredClone(layoutFixture);
    rack.containers[1]!.racks[0]!.id = "c1-r1";
    expect(layoutSchema.safeParse(rack).success).toBe(false);

    const container = structuredClone(layoutFixture);
    container.containers[1]!.id = "container-1";
    expect(layoutSchema.safeParse(container).success).toBe(false);

    const position = structuredClone(layoutFixture);
    position.containers[0]!.racks[0]!.sockets[1]!.position = "1-1";
    const result = layoutSchema.safeParse(position);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["containers", 0, "racks", 0, "sockets", 1]);
  });
});

describe("plugin mock site commands", () => {
  it("applies a power mode to a container and reports it on the next read", () => {
    const result = commandResultSchema.parse(
      site.setPowerMode({ containerId: "container-1" }, "low"),
    );
    const container = containersSchema
      .parse(site.containers())
      .containers.find((c) => c.id === "container-1");

    expect(result.accepted).toBe(true);
    expect(container?.powerMode).toBe("low");
  });

  it("skips miners that do not support the mode", () => {
    // container-4 is the Antminer, which has no low mode.
    const result = commandResultSchema.parse(
      site.setPowerMode({ containerId: "container-4" }, "low"),
    );

    expect(result).toEqual({ accepted: false, minerCount: 0 });
  });

  it("accepts nothing for a target that matches no miners", () => {
    const result = commandResultSchema.parse(site.setPowerPct({ minerIds: ["nope"] }, 80));

    expect(result).toEqual({ accepted: false, minerCount: 0 });
  });
});
