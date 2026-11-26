import { MdkFetchError } from "@tetherto/mdk-ui-foundation";
import { describe, expect, it } from "vitest";

import type { ContainerLayout, Miner } from "../../api/contract";
import {
  findMiner,
  heatmapMetricsOf,
  isUnknownContainer,
  layoutMetricsOf,
  minerNameOf,
  orderedSockets,
  socketLabelOf,
  socketStateOf,
  toContainerLayoutView,
  toLayoutView,
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
  envTempC: null,
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
        { position: "1-1-1", miner: createMiner(), currentA: 10.1, enabled: true },
        {
          position: "1-1-2",
          miner: createMiner({ id: "miner-1-1-2", status: "error" }),
          currentA: 0,
          enabled: false,
        },
      ],
    },
    {
      id: "container-1-rack-2",
      name: "Rack 2",
      sockets: [
        { position: "1-2-9", miner: null, currentA: 0, enabled: true },
        {
          position: "1-2-10",
          miner: createMiner({ id: "miner-1-2-10", status: "sleep" }),
          currentA: null,
          enabled: null,
        },
      ],
    },
  ],
});

describe("toLayoutView", () => {
  it("shapes the container's totals in display units, with its miner count", () => {
    const { container } = toLayoutView(createLayout());

    expect(container).toMatchObject({
      name: "Container 1",
      hashratePhs: 2,
      powerKw: 60,
      minerCount: 3,
    });
    expect(container.efficiencyWPerThs).toBe(30);
  });

  it("gives a socket its miner's state and the PDU's power and current, never guessed", () => {
    const { racks } = toLayoutView(createLayout());

    expect(
      racks.flatMap((rack) =>
        rack.sockets.map(({ state, power, currentA }) => `${state}/${power}/${currentA}`),
      ),
    ).toEqual([
      "normal/on/10.1",
      // The miner still draws power, but the PDU says the socket is off.
      "mining-error/off/0",
      // Empty, but powered.
      "empty/on/0",
      // No PDU reading: unknown, though the miner draws power.
      "sleep/unknown/null",
    ]);
  });
});

describe("socketStateOf", () => {
  it("tells a miner that errors but still hashes from one that stopped", () => {
    expect(socketStateOf(createMiner({ status: "error", hashrateThs: 50 }))).toBe("mining-error");
    expect(socketStateOf(createMiner({ status: "error", hashrateThs: 0 }))).toBe("error");
    expect(socketStateOf(null)).toBe("empty");
  });
});

describe("orderedSockets", () => {
  it("lists every socket by position, numbers in numeric order", () => {
    const layout = createLayout();
    layout.racks[0]?.sockets.push({
      position: "1-1-10",
      miner: null,
      currentA: null,
      enabled: null,
    });

    expect(orderedSockets(toLayoutView(layout)).map((socket) => socket.position)).toEqual([
      "1-1-1",
      "1-1-2",
      "1-1-10",
      "1-2-9",
      "1-2-10",
    ]);
  });
});

describe("findMiner", () => {
  const view = toLayoutView(createLayout());

  it("finds a miner in any rack, with the rack the grid shows it in", () => {
    const placed = findMiner(view, "miner-1-2-10");
    expect(placed?.miner.status).toBe("sleep");
    expect(placed?.rack.name).toBe("Rack 2");
  });

  it("finds nothing for an unknown or missing id", () => {
    expect(findMiner(view, "miner-9")).toBeUndefined();
    expect(findMiner(view, undefined)).toBeUndefined();
  });
});

describe("socketLabelOf", () => {
  it("names the miner's rack, then its socket", () => {
    const rack = { id: "rack-x", name: "PDU 1-3", sockets: [] };
    expect(socketLabelOf({ miner: createMiner({ position: "2" }), rack })).toBe(
      "PDU 1-3 · Socket 2",
    );
  });

  it("names the rack the grid shows the miner in, whatever its rackId says", () => {
    const view = toLayoutView(createLayout());
    const placed = findMiner(view, "miner-1-2-10");
    expect(placed && socketLabelOf(placed)).toBe("Rack 2 · Socket 1-1-1");
  });
});

describe("minerNameOf", () => {
  it("names a miner by its serial", () => {
    expect(minerNameOf(createMiner({ serial: "WM1101" }))).toBe("WM1101");
  });

  it("falls back to the id while the miner reports no serial", () => {
    expect(minerNameOf(createMiner({ id: "miner-7", serial: "" }))).toBe("miner-7");
  });
});

const valuesOf = (rows: { label: string; value: string }[]) =>
  Object.fromEntries(rows.map(({ label, value }) => [label, value]));

describe("layoutMetricsOf", () => {
  it("lists the Layout tab's readings, the status coloured as its socket", () => {
    const rows = layoutMetricsOf(createMiner());

    expect(valuesOf(rows)).toEqual({
      "Hash Rate": "101.84 TH/s",
      Consumption: "3.25 kW",
      Status: "Mining",
      IP: "10.1.1.21",
    });
    expect(rows.find((row) => row.label === "Status")?.state).toBe("normal");
  });
});

describe("heatmapMetricsOf", () => {
  it("lists the Heatmap tab's readings, with the container's ambient as Env Temp", () => {
    const now = 1_792_000_000_000;
    const rows = heatmapMetricsOf(
      createMiner({ uptimeS: 5 * 86_400, lastUpdate: now - 59_000, envTempC: 27.36 }),
      now,
    );

    expect(valuesOf(rows)).toMatchObject({
      Efficiency: "31.89 W/TH/s",
      Frequency: "785 MHz",
      Temperature: "92.9 °C",
      "Inlet Temp": "34.8 °C",
      "Env Temp": "27.4 °C",
      "Power Mode": "Normal",
      Uptime: "5 days",
      Status: "Mining",
      "Last Update": "59 s ago",
    });
  });

  it("shows - for Env Temp when the container has no reading", () => {
    const rows = heatmapMetricsOf(createMiner({ envTempC: null }), 1_792_000_000_000);
    expect(valuesOf(rows)["Env Temp"]).toBe("-");
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
