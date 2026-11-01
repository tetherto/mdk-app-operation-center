import { describe, expect, it } from "vitest";

import type { ContainerSummary, MinerStatusCounts, RackSummary } from "../../api/contract";
import { countMiners, toContainerCard, toStatusTileCounts } from "./container-card-shape";

const createStatus = (overrides: Partial<MinerStatusCounts> = {}): MinerStatusCounts => ({
  offline: 1,
  error: 2,
  sleep: 3,
  low: 4,
  normal: 60,
  high: 5,
  empty: 5,
  ...overrides,
});

const createRack = (overrides: Partial<RackSummary> = {}): RackSummary => ({
  id: "rack-1-1",
  name: "Rack 1-1",
  containerId: "container-1",
  hashrateThs: 42_500,
  powerW: 1_434_000,
  minerStatus: createStatus(),
  ...overrides,
});

const createContainer = (overrides: Partial<ContainerSummary> = {}): ContainerSummary => ({
  id: "container-1",
  name: "Container 1",
  model: "MicroBT WhatsMiner M56",
  hashrateThs: 168_900,
  powerW: 5_701_000,
  powerMode: "normal",
  powerPct: 100,
  supportedPowerModes: ["sleep", "low", "normal", "high"],
  minerStatus: createStatus(),
  racks: [createRack()],
  ...overrides,
});

describe("toContainerCard", () => {
  it("carries the power settings the controls offer and mark", () => {
    const card = toContainerCard(
      createContainer({ supportedPowerModes: ["low", "normal"], powerMode: "low", powerPct: null }),
    );

    expect(card.power).toEqual({ supportedModes: ["low", "normal"], mode: "low", pct: null });
  });

  it("converts power to kW and hashrate to PH/s", () => {
    const card = toContainerCard(createContainer());

    expect(card.powerKw).toBe(5701);
    expect(card.hashratePhs).toBe(168.9);
  });

  it("derives efficiency as W per TH/s for the container and each rack", () => {
    const card = toContainerCard(
      createContainer({
        hashrateThs: 100_000,
        powerW: 3_000_000,
        racks: [createRack({ hashrateThs: 40_000, powerW: 1_400_000 })],
      }),
    );

    expect(card.efficiencyWPerThs).toBe(30);
    expect(card.racks[0]?.efficiencyWPerThs).toBe(35);
  });

  it("leaves efficiency undefined without hashrate", () => {
    const card = toContainerCard(
      createContainer({ hashrateThs: 0, racks: [createRack({ hashrateThs: 0 })] }),
    );

    expect(card.efficiencyWPerThs).toBeUndefined();
    expect(card.racks[0]?.efficiencyWPerThs).toBeUndefined();
  });

  it("keeps the racks in order with their names", () => {
    const card = toContainerCard(
      createContainer({
        racks: [
          createRack({ id: "a", name: "Rack 1-1" }),
          createRack({ id: "b", name: "Rack 1-2" }),
        ],
      }),
    );

    expect(card.racks.map((rack) => rack.name)).toEqual(["Rack 1-1", "Rack 1-2"]);
  });
});

describe("toStatusTileCounts", () => {
  it("renames empty sockets to the key the status tiles read", () => {
    expect(toStatusTileCounts(createStatus({ empty: 7 }))).toEqual({
      offline: 1,
      error: 2,
      sleep: 3,
      low: 4,
      normal: 60,
      high: 5,
      disconnected: 7,
    });
  });
});

describe("countMiners", () => {
  it("counts every status except empty sockets", () => {
    expect(countMiners(createStatus())).toBe(75);
  });
});
