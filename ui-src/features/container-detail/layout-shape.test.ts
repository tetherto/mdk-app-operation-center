import { MdkFetchError } from "@tetherto/mdk-ui-foundation";
import { describe, expect, it } from "vitest";

import type { ContainerLayout, Miner } from "../../api/contract";
import {
  findMiner,
  isUnknownContainer,
  toContainerLayoutView,
  toLayoutView,
  toMinerDetails,
} from "./layout-shape";

const createMiner = (overrides: Partial<Miner> = {}): Miner => ({
  id: "miner-1-1-1",
  serial: "WM1101",
  ip: "10.1.1.21",
  containerId: "container-1",
  rackId: "container-1-rack-1",
  position: "1-1-1",
  status: "normal",
  powerMode: "normal",
  powerPct: 80,
  supportedPowerModes: ["sleep", "low", "normal", "high"],
  hashrateThs: 101.84,
  powerW: 3247.6,
  frequencyMhz: 785,
  inletTempC: 34.83,
  chipTempC: 92.9,
  uptimeS: 1175,
  lastUpdate: 0,
  ...overrides,
});

const createLayout = (): ContainerLayout => ({
  container: {
    id: "container-1",
    name: "Container 1",
    model: "MicroBT WhatsMiner M56S",
    hashrateThs: 2000,
    powerW: 60_000,
  },
  racks: [
    {
      id: "container-1-rack-1",
      name: "Rack 1",
      sockets: [
        { position: "1-1-1", miner: createMiner() },
        { position: "1-1-2", miner: createMiner({ id: "miner-1-1-2", status: "error" }) },
      ],
    },
    {
      id: "container-1-rack-2",
      name: "Rack 2",
      sockets: [
        { position: "1-2-9", miner: null },
        { position: "1-2-10", miner: createMiner({ id: "miner-1-2-10", status: "sleep" }) },
      ],
    },
  ],
});

describe("toLayoutView", () => {
  it("shapes the container's totals in display units", () => {
    const { container } = toLayoutView(createLayout());

    expect(container).toMatchObject({ name: "Container 1", hashratePhs: 2, powerKw: 60 });
    expect(container.efficiencyWPerThs).toBe(30);
  });

  it("numbers each socket by the last part of its position", () => {
    const { racks } = toLayoutView(createLayout());

    expect(racks[1]?.sockets.map((socket) => socket.slot)).toEqual(["9", "10"]);
  });

  it("gives a socket its miner's status, or empty without one", () => {
    const { racks } = toLayoutView(createLayout());

    expect(racks.flatMap((rack) => rack.sockets.map((socket) => socket.state))).toEqual([
      "normal",
      "error",
      "empty",
      "sleep",
    ]);
  });

  it("counts the sockets per state, leaving out the states no socket shows", () => {
    expect(Object.fromEntries(toLayoutView(createLayout()).stateCounts)).toEqual({
      normal: 1,
      error: 1,
      empty: 1,
      sleep: 1,
    });
  });
});

describe("findMiner", () => {
  const view = toLayoutView(createLayout());

  it("finds a miner in any rack", () => {
    expect(findMiner(view, "miner-1-2-10")?.status).toBe("sleep");
  });

  it("finds nothing for an unknown or missing id", () => {
    expect(findMiner(view, "miner-9")).toBeUndefined();
    expect(findMiner(view, undefined)).toBeUndefined();
  });
});

describe("toMinerDetails", () => {
  it("lists the miner in display units", () => {
    const values = Object.fromEntries(
      toMinerDetails(createMiner()).map(({ label, value }) => [label, value]),
    );

    expect(values).toMatchObject({
      Serial: "WM1101",
      IP: "10.1.1.21",
      Status: "Normal",
      "Power mode": "Normal",
      "Power %": "80%",
      "Hash rate": "101.84 TH/s",
      Consumption: "3,248 W",
      "Inlet temp": "34.8 °C",
    });
  });

  it("shows the fallback for an unknown power percentage", () => {
    const row = toMinerDetails(createMiner({ powerPct: null })).find((r) => r.label === "Power %");

    expect(row?.value).toBe("-");
  });
});

describe("toContainerLayoutView", () => {
  const layout = toLayoutView(createLayout());
  const url = "/apps/op-centre-lite/api/containers/container-1/layout";

  it("shows the layout, even when a background refetch failed", () => {
    expect(toContainerLayoutView(layout, new Error("boom"), url)).toEqual({
      status: "ready",
      layout,
    });
  });

  it("calls a 404 an unknown container", () => {
    expect(toContainerLayoutView(undefined, new MdkFetchError(404, "Not Found"), url)).toEqual({
      status: "not-found",
    });
  });

  it("reports any other failure with its reason", () => {
    expect(toContainerLayoutView(undefined, new Error("boom"), url)).toEqual({
      status: "error",
      message: "boom",
    });
  });

  it("is loading without a layout or an error", () => {
    expect(toContainerLayoutView(undefined, null, url)).toEqual({ status: "loading" });
  });
});

describe("isUnknownContainer", () => {
  it("is true for a 404 only", () => {
    expect(isUnknownContainer(new MdkFetchError(404, "Not Found"))).toBe(true);
    expect(isUnknownContainer(new MdkFetchError(500, "Server Error"))).toBe(false);
    expect(isUnknownContainer(new Error("boom"))).toBe(false);
  });
});
