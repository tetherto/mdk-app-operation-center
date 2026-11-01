import { describe, expect, it } from "vitest";

import type { ContainerSummary, Miner, MinerStatusCounts, RackSummary } from "../../api/contract";
import {
  filterRackRows,
  pageOf,
  type RackExplorerRow,
  toMinerRow,
  toRackRows,
} from "./explorer-shape";

const STATUS: MinerStatusCounts = {
  offline: 0,
  error: 0,
  sleep: 0,
  low: 0,
  normal: 72,
  high: 0,
  empty: 0,
};

const createRack = (overrides: Partial<RackSummary> = {}): RackSummary => ({
  id: "rack-1-1",
  name: "Rack 1-1",
  containerId: "container-1",
  hashrateThs: 42_300,
  powerW: 1_426_000,
  minerStatus: STATUS,
  ...overrides,
});

const createContainer = (overrides: Partial<ContainerSummary> = {}): ContainerSummary => ({
  id: "container-1",
  name: "Container 1",
  model: "MicroBT WhatsMiner M56",
  hashrateThs: 42_300,
  powerW: 1_426_000,
  powerMode: "normal",
  powerPct: 100,
  supportedPowerModes: ["sleep", "low", "normal", "high"],
  minerStatus: STATUS,
  racks: [createRack()],
  ...overrides,
});

const createMiner = (overrides: Partial<Miner> = {}): Miner => ({
  id: "miner-1",
  serial: "SN-0001",
  ip: "10.0.1.1",
  containerId: "container-1",
  rackId: "rack-1-1",
  position: "1-1-1",
  status: "normal",
  powerMode: "normal",
  powerPct: 100,
  supportedPowerModes: ["sleep", "low", "normal", "high"],
  hashrateThs: 200,
  powerW: 3_400,
  frequencyMhz: 600,
  inletTempC: 30,
  chipTempC: 70,
  uptimeS: 3_600,
  lastUpdate: 0,
  ...overrides,
});

const createRackRow = (overrides: Partial<RackExplorerRow> = {}): RackExplorerRow => ({
  id: "rack-1-1",
  name: "Rack 1-1",
  containerId: "container-1",
  containerName: "Container 1",
  efficiencyWPerThs: 33.71,
  hashratePhs: 42.3,
  powerKw: 1426,
  ...overrides,
});

describe("toRackRows", () => {
  it("lists every rack of every container with its container name, in display units", () => {
    const rows = toRackRows([
      createContainer({
        racks: [createRack(), createRack({ id: "rack-1-2", name: "Rack 1-2" })],
      }),
      createContainer({
        id: "container-2",
        name: "Container 2",
        racks: [createRack({ id: "rack-2-1", name: "Rack 2-1", containerId: "container-2" })],
      }),
    ]);

    expect(rows.map((row) => [row.name, row.containerName])).toEqual([
      ["Rack 1-1", "Container 1"],
      ["Rack 1-2", "Container 1"],
      ["Rack 2-1", "Container 2"],
    ]);
    expect(rows[0]).toMatchObject({ hashratePhs: 42.3, powerKw: 1426 });
    expect(rows[0]?.efficiencyWPerThs).toBeCloseTo(33.71, 2);
  });

  it("leaves efficiency undefined for a rack without hashrate", () => {
    const [row] = toRackRows([createContainer({ racks: [createRack({ hashrateThs: 0 })] })]);

    expect(row?.efficiencyWPerThs).toBeUndefined();
  });
});

describe("filterRackRows", () => {
  const rows = [
    createRackRow(),
    createRackRow({
      id: "rack-2-1",
      name: "Rack 2-1",
      containerId: "container-2",
      containerName: "Container 2",
    }),
  ];

  it("keeps every rack without a filter", () => {
    expect(filterRackRows(rows, { search: "", containerId: undefined })).toHaveLength(2);
  });

  it("keeps the racks of the chosen container", () => {
    const kept = filterRackRows(rows, { search: "", containerId: "container-2" });

    expect(kept.map((row) => row.id)).toEqual(["rack-2-1"]);
  });

  it("matches the search in the rack or container name, ignoring case and spaces around it", () => {
    expect(filterRackRows(rows, { search: " rack 2 ", containerId: undefined })).toHaveLength(1);
    expect(filterRackRows(rows, { search: "CONTAINER 1", containerId: undefined })).toHaveLength(1);
  });

  it("applies the search and the container together", () => {
    expect(filterRackRows(rows, { search: "rack 1", containerId: "container-2" })).toEqual([]);
  });
});

describe("toMinerRow", () => {
  it("names the miner's container and derives its efficiency", () => {
    const row = toMinerRow(createMiner(), new Map([["container-1", "Container 1"]]));

    expect(row).toMatchObject({ containerName: "Container 1", hashrateThs: 200, powerW: 3400 });
    expect(row.efficiencyWPerThs).toBe(17);
  });

  it("falls back to the container id when the container is unknown", () => {
    expect(toMinerRow(createMiner(), new Map()).containerName).toBe("container-1");
  });

  it("leaves efficiency undefined for a miner without hashrate", () => {
    expect(
      toMinerRow(createMiner({ hashrateThs: 0 }), new Map()).efficiencyWPerThs,
    ).toBeUndefined();
  });
});

describe("pageOf", () => {
  const rows = Array.from({ length: 16 }, (_, i) => i);

  it("returns the rows of a 1-based page", () => {
    expect(pageOf(rows, 1, 10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(pageOf(rows, 2, 10)).toEqual([10, 11, 12, 13, 14, 15]);
  });

  it("returns no rows past the last page", () => {
    expect(pageOf(rows, 3, 10)).toEqual([]);
  });
});
