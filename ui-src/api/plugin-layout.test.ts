import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import { layoutSchema } from "./contract";

// The plugin validates the layout config in CommonJS (plugin/lib/layout.js)
// and the UI types it with zod (layoutSchema): one set of fixtures holds both
// to the same verdicts.
const load = createRequire(import.meta.url);
const layoutModule: unknown = load("../../plugin/lib/layout.js");
const isLayoutModule = (
  value: unknown,
): value is { validateLayout: (layout: unknown) => string[] } =>
  typeof value === "object" &&
  value !== null &&
  "validateLayout" in value &&
  typeof value.validateLayout === "function";
if (!isLayoutModule(layoutModule))
  throw new Error("plugin/lib/layout.js does not export validateLayout");
const { validateLayout } = layoutModule;

const socket = (position: string, deviceId: string | null) => ({ position, deviceId });
const valid = () => ({
  containers: [
    {
      id: "c1",
      name: "Container 1",
      model: "MicroBT WhatsMiner M56S",
      nominalHashrateThs: 110,
      meterDeviceId: "meter-1",
      racks: [
        { id: "c1-r1", name: "Rack 1", sockets: [socket("1-1-1", "wm-1"), socket("1-1-2", null)] },
        { id: "c1-r2", name: "Rack 2", sockets: [socket("1-2-1", "wm-2")] },
      ],
    },
    {
      id: "c2",
      name: "Container 2",
      model: "Bitmain Antminer S21",
      nominalHashrateThs: 200,
      meterDeviceId: null,
      racks: [{ id: "c2-r1", name: "Rack 1", sockets: [socket("2-1-1", "am-1")] }],
    },
  ],
});

type Layout = ReturnType<typeof valid>;
const mutate = (change: (layout: Layout) => void): Layout => {
  const layout = valid();
  change(layout);
  return layout;
};

const fixtures: Array<{ name: string; layout: unknown; ok: boolean }> = [
  { name: "a site with empty sockets and a container without a meter", layout: valid(), ok: true },
  { name: "no containers", layout: { containers: [] }, ok: true },
  {
    name: "a device in two sockets",
    layout: mutate((l) => {
      l.containers[1]!.racks[0]!.sockets[0]!.deviceId = "wm-1";
    }),
    ok: false,
  },
  {
    name: "a device that is both meter and miner",
    layout: mutate((l) => {
      l.containers[1]!.meterDeviceId = "wm-2";
    }),
    ok: false,
  },
  {
    name: "a repeated container id",
    layout: mutate((l) => {
      l.containers[1]!.id = "c1";
    }),
    ok: false,
  },
  {
    name: "a repeated rack id",
    layout: mutate((l) => {
      l.containers[1]!.racks[0]!.id = "c1-r1";
    }),
    ok: false,
  },
  {
    name: "a repeated socket position in one rack",
    layout: mutate((l) => {
      l.containers[0]!.racks[0]!.sockets[1]!.position = "1-1-1";
    }),
    ok: false,
  },
  {
    name: "an empty device id",
    layout: mutate((l) => {
      l.containers[0]!.racks[0]!.sockets[0]!.deviceId = "";
    }),
    ok: false,
  },
  {
    name: "a negative nominal hashrate",
    layout: mutate((l) => {
      l.containers[0]!.nominalHashrateThs = -1;
    }),
    ok: false,
  },
  {
    name: "a missing model",
    layout: mutate((l) => {
      Reflect.deleteProperty(l.containers[0]!, "model");
    }),
    ok: false,
  },
  {
    name: "sockets that are not a list",
    layout: mutate((l) => {
      Reflect.set(l.containers[0]!.racks[0]!, "sockets", {});
    }),
    ok: false,
  },
  { name: "not a mapping", layout: [], ok: false },
];

describe("layout config: plugin validator and zod schema agree", () => {
  for (const fixture of fixtures) {
    it(`${fixture.ok ? "accepts" : "rejects"} ${fixture.name}`, () => {
      expect(layoutSchema.safeParse(fixture.layout).success).toBe(fixture.ok);
      const errors = validateLayout(fixture.layout);
      expect(errors.length === 0).toBe(fixture.ok);
    });
  }

  it("names the path of the problem", () => {
    const errors = validateLayout(
      mutate((l) => {
        l.containers[1]!.racks[0]!.sockets[0]!.deviceId = "wm-1";
      }),
    );
    expect(errors).toEqual([
      'layout.containers[1].racks[0].sockets[0].deviceId: duplicate device id "wm-1"',
    ]);
  });
});
