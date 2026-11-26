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
  { name: "a site meter", layout: { ...valid(), siteMeterDeviceId: "dcs-1" }, ok: true },
  { name: "no site meter", layout: { ...valid(), siteMeterDeviceId: null }, ok: true },
  {
    name: "a site meter that is also a container's meter",
    layout: { ...valid(), siteMeterDeviceId: "meter-1" },
    ok: false,
  },
  {
    name: "a container env device",
    layout: mutate((l) => {
      Reflect.set(l.containers[0]!, "envDeviceId", "bitdeer-1");
    }),
    ok: true,
  },
  {
    name: "no container env device",
    layout: mutate((l) => {
      Reflect.set(l.containers[0]!, "envDeviceId", null);
    }),
    ok: true,
  },
  {
    name: "one site sensor shared by two containers",
    layout: mutate((l) => {
      Reflect.set(l.containers[0]!, "envDeviceId", "sensor-1");
      Reflect.set(l.containers[1]!, "envDeviceId", "sensor-1");
    }),
    ok: true,
  },
  {
    name: "an env device that is also a miner",
    layout: mutate((l) => {
      Reflect.set(l.containers[1]!, "envDeviceId", "wm-1");
    }),
    ok: false,
  },
  {
    name: "an env device that is also a meter",
    layout: mutate((l) => {
      Reflect.set(l.containers[1]!, "envDeviceId", "meter-1");
    }),
    ok: false,
  },
  {
    name: "an empty env device id",
    layout: mutate((l) => {
      Reflect.set(l.containers[0]!, "envDeviceId", "");
    }),
    ok: false,
  },
  {
    name: "a container device with PDU sockets, empty sockets included",
    layout: mutate((l) => {
      const c1 = l.containers[0]!;
      Reflect.set(c1, "containerDeviceId", "bitdeer-1");
      Reflect.set(c1.racks[0]!.sockets[0]!, "pdu", "1-1");
      Reflect.set(c1.racks[0]!.sockets[0]!, "socket", "a1");
      Reflect.set(c1.racks[0]!.sockets[1]!, "pdu", "1-1");
      Reflect.set(c1.racks[0]!.sockets[1]!, "socket", "a2");
    }),
    ok: true,
  },
  {
    name: "a container device that is also its env device",
    layout: mutate((l) => {
      Reflect.set(l.containers[0]!, "containerDeviceId", "bitdeer-1");
      Reflect.set(l.containers[0]!, "envDeviceId", "bitdeer-1");
    }),
    ok: true,
  },
  {
    name: "one PDU socket name in two containers",
    layout: mutate((l) => {
      Reflect.set(l.containers[0]!, "containerDeviceId", "bitdeer-1");
      Reflect.set(l.containers[1]!, "containerDeviceId", "bitdeer-2");
      for (const c of l.containers) {
        Reflect.set(c.racks[0]!.sockets[0]!, "pdu", "1-1");
        Reflect.set(c.racks[0]!.sockets[0]!, "socket", "a1");
      }
    }),
    ok: true,
  },
  {
    name: "no PDU socket (null)",
    layout: mutate((l) => {
      Reflect.set(l.containers[0]!.racks[0]!.sockets[0]!, "pdu", null);
      Reflect.set(l.containers[0]!.racks[0]!.sockets[0]!, "socket", null);
    }),
    ok: true,
  },
  {
    name: "one container device in two containers",
    layout: mutate((l) => {
      Reflect.set(l.containers[0]!, "containerDeviceId", "bitdeer-1");
      Reflect.set(l.containers[1]!, "containerDeviceId", "bitdeer-1");
    }),
    ok: false,
  },
  {
    name: "a container device that is also a meter",
    layout: mutate((l) => {
      Reflect.set(l.containers[1]!, "containerDeviceId", "meter-1");
    }),
    ok: false,
  },
  {
    name: "a pdu without a socket",
    layout: mutate((l) => {
      Reflect.set(l.containers[0]!, "containerDeviceId", "bitdeer-1");
      Reflect.set(l.containers[0]!.racks[0]!.sockets[0]!, "pdu", "1-1");
    }),
    ok: false,
  },
  {
    name: "a PDU socket in a container without a container device",
    layout: mutate((l) => {
      Reflect.set(l.containers[0]!.racks[0]!.sockets[0]!, "pdu", "1-1");
      Reflect.set(l.containers[0]!.racks[0]!.sockets[0]!, "socket", "a1");
    }),
    ok: false,
  },
  {
    name: "one PDU socket for two sockets of a container",
    layout: mutate((l) => {
      const c1 = l.containers[0]!;
      Reflect.set(c1, "containerDeviceId", "bitdeer-1");
      for (const s of [c1.racks[0]!.sockets[0]!, c1.racks[1]!.sockets[0]!]) {
        Reflect.set(s, "pdu", "1-1");
        Reflect.set(s, "socket", "a1");
      }
    }),
    ok: false,
  },
  {
    name: "an empty PDU name",
    layout: mutate((l) => {
      Reflect.set(l.containers[0]!, "containerDeviceId", "bitdeer-1");
      Reflect.set(l.containers[0]!.racks[0]!.sockets[0]!, "pdu", "");
      Reflect.set(l.containers[0]!.racks[0]!.sockets[0]!, "socket", "a1");
    }),
    ok: false,
  },
  { name: "an empty site meter id", layout: { ...valid(), siteMeterDeviceId: "" }, ok: false },
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

  it("names the socket whose PDU socket repeats", () => {
    const errors = validateLayout(
      mutate((l) => {
        const c1 = l.containers[0]!;
        Reflect.set(c1, "containerDeviceId", "bitdeer-1");
        for (const s of [c1.racks[0]!.sockets[0]!, c1.racks[1]!.sockets[0]!]) {
          Reflect.set(s, "pdu", "1-1");
          Reflect.set(s, "socket", "a1");
        }
      }),
    );
    expect(errors).toEqual([
      'layout.containers[0].racks[1].sockets[0]: duplicate PDU socket "1-1 / a1"',
    ]);
  });

  it("names the env device that is also a miner", () => {
    const errors = validateLayout(
      mutate((l) => {
        Reflect.set(l.containers[1]!, "envDeviceId", "wm-1");
      }),
    );
    expect(errors).toEqual([
      'layout.containers[1].envDeviceId: env device "wm-1" is also a miner or a meter',
    ]);
  });
});
