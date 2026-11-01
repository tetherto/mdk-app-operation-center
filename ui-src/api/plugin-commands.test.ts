import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import { commandResultSchema } from "./contract";

const load = createRequire(import.meta.url);

type Caps = { supportedPowerModes: string[]; pctCommand: string | null; hasDownloadLogs: boolean };
type Snapshot = {
  ts: number;
  miners: Map<string, { status: string }>;
  meters: Map<string, unknown>;
};
type Sent = { id: string; command: string; params: Record<string, unknown> };
type Mdk = {
  sendCommand: (
    id: string,
    command: string,
    params: Record<string, unknown>,
  ) => Promise<{ commandId: string; status: string; error?: string }>;
  getCommandStatus: (
    commandId: string,
  ) => Promise<{ status: string; result?: unknown; error?: string | null }>;
};
type Modules = {
  createTopology: (layout: unknown) => unknown;
  createCommands: (opts: {
    topology: unknown;
    fleet: unknown;
    snapshots: { get: () => Promise<Snapshot>; invalidate: () => void };
    concurrency?: number;
    verify?: boolean;
  }) => {
    setPowerMode: (mdk: Mdk, target: unknown, mode: string) => Promise<unknown>;
    setPowerPct: (mdk: Mdk, target: unknown, pct: number) => Promise<unknown>;
  };
  createLogs: (opts: {
    topology: unknown;
    fleet: unknown;
  }) => (
    mdk: Mdk,
    id: string,
  ) => Promise<{ filename: string; contentType: string; data: Buffer } | null>;
};
const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null ? { ...value } : {};
const isModules = (value: Record<string, unknown>): value is Record<string, unknown> & Modules =>
  ["createTopology", "createCommands", "createLogs"].every(
    (name) => typeof value[name] === "function",
  );
const merged: Record<string, unknown> = {};
for (const file of ["topology", "commands", "logs"])
  Object.assign(merged, asRecord(load(`../../plugin/lib/${file}.js`)));
if (!isModules(merged)) throw new Error("plugin/lib command modules are missing an export");
const { createTopology, createCommands, createLogs } = merged;

const layout = {
  containers: [
    {
      id: "c1",
      name: "C1",
      model: "M",
      nominalHashrateThs: 100,
      meterDeviceId: "meter-1",
      racks: [
        {
          id: "r1",
          name: "R1",
          sockets: [
            { position: "1", deviceId: "wm-1" },
            { position: "2", deviceId: "wm-2" },
            { position: "3", deviceId: "am-1" },
            { position: "4", deviceId: "none-1" },
          ],
        },
      ],
    },
  ],
};
const CAPS: Record<string, Caps> = {
  "wm-1": {
    supportedPowerModes: ["sleep", "low", "normal", "high"],
    pctCommand: "setPowerPct",
    hasDownloadLogs: true,
  },
  "wm-2": {
    supportedPowerModes: ["sleep", "low", "normal", "high"],
    pctCommand: "setPowerPct",
    hasDownloadLogs: true,
  },
  "am-1": {
    supportedPowerModes: ["sleep", "normal", "high"],
    pctCommand: "setHashratePercent",
    hasDownloadLogs: false,
  },
  "none-1": { supportedPowerModes: [], pctCommand: null, hasDownloadLogs: false },
};
const snapshot = (): Snapshot => ({
  ts: 1,
  miners: new Map([
    ["wm-1", { status: "normal" }],
    ["wm-2", { status: "offline" }],
    ["am-1", { status: "normal" }],
    ["none-1", { status: "normal" }],
  ]),
  meters: new Map(),
});
function harness(
  opts: { verify?: boolean; outcome?: Record<string, string>; reject?: Set<string> } = {},
) {
  const sent: Sent[] = [];
  const recorded: Array<[string, number]> = [];
  let invalidated = 0;
  const fleet = {
    async capabilitiesOf(id: string) {
      return CAPS[id] ?? null;
    },
    recordSetPct(id: string, pct: number) {
      recorded.push([id, pct]);
    },
  };
  const snapshots = {
    get: async () => snapshot(),
    invalidate: () => {
      invalidated += 1;
    },
  };
  const topology = createTopology(layout);
  const mdk: Mdk = {
    async sendCommand(id, command, params) {
      sent.push({ id, command, params });
      if (opts.reject?.has(id))
        return { commandId: "", status: "REJECTED", error: "ERR_COMMAND_NOT_IN_CAPABILITIES" };
      return { commandId: `cmd-${id}`, status: "QUEUED" };
    },
    async getCommandStatus(commandId) {
      const id = commandId.slice(4);
      return { status: opts.outcome?.[id] ?? "SUCCESS", result: { success: true }, error: null };
    },
  };
  const commands = createCommands({
    topology,
    fleet,
    snapshots,
    verify: opts.verify,
    concurrency: 2,
  });
  const logs = createLogs({ topology, fleet });
  return { commands, logs, mdk, sent, recorded, invalidated: () => invalidated };
}

describe("power commands", () => {
  it("sends the mode to the container's reachable miners that support it, and invalidates the snapshot", async () => {
    const h = harness();
    const result = commandResultSchema.parse(
      await h.commands.setPowerMode(h.mdk, { containerId: "c1" }, "low"),
    );
    // wm-2 is offline, am-1 has no low, none-1 has no setPowerMode
    expect(h.sent).toEqual([{ id: "wm-1", command: "setPowerMode", params: { mode: "low" } }]);
    expect(result).toEqual({ accepted: true, minerCount: 1 });
    expect(h.invalidated()).toBe(1);

    const high = commandResultSchema.parse(
      await h.commands.setPowerMode(h.mdk, { minerIds: ["am-1", "wm-1", "ghost"] }, "high"),
    );
    expect(high).toEqual({ accepted: true, minerCount: 2 });
  });

  it("routes the percent to each worker's own command and remembers it per miner", async () => {
    const h = harness();
    const result = commandResultSchema.parse(
      await h.commands.setPowerPct(h.mdk, { containerId: "c1" }, 80),
    );
    expect(h.sent.map((s) => `${s.command}:${s.id}`).sort()).toEqual([
      "setHashratePercent:am-1",
      "setPowerPct:wm-1",
    ]);
    expect(h.sent.every((s) => s.params.pct === 80)).toBe(true);
    expect(result).toEqual({ accepted: true, minerCount: 2 });
    expect(h.recorded.sort((a, b) => a[0].localeCompare(b[0]))).toEqual([
      ["am-1", 80],
      ["wm-1", 80],
    ]);
  });

  it("counts nothing for an empty or unknown target, or a Kernel rejection", async () => {
    const h = harness({ reject: new Set(["wm-1"]) });
    expect(await h.commands.setPowerMode(h.mdk, { minerIds: ["ghost"] }, "low")).toEqual({
      accepted: false,
      minerCount: 0,
    });
    expect(await h.commands.setPowerMode(h.mdk, { containerId: "nope" }, "low")).toEqual({
      accepted: false,
      minerCount: 0,
    });
    expect(await h.commands.setPowerMode(h.mdk, { containerId: "c1" }, "low")).toEqual({
      accepted: false,
      minerCount: 0,
    });
    expect(h.sent).toHaveLength(1);
  });

  it("with verify counts only the commands that finished with SUCCESS", async () => {
    const h = harness({ verify: true, outcome: { "am-1": "FAILED" } });
    expect(await h.commands.setPowerMode(h.mdk, { containerId: "c1" }, "high")).toEqual({
      accepted: true,
      minerCount: 1,
    });
  });
});

describe("miner logs", () => {
  it("runs downloadLogs as the caller and decodes the inline archive", async () => {
    const h = harness();
    const archive = Buffer.from("mock archive bytes");
    const mdk: Mdk = {
      ...h.mdk,
      async getCommandStatus() {
        return {
          status: "SUCCESS",
          result: {
            success: true,
            filename: "whatsminer-logs.tgz",
            contentType: "application/gzip",
            encoding: "base64",
            size: archive.length,
            data: archive.toString("base64"),
          },
        };
      },
    };
    const logs = await h.logs(mdk, "wm-1");
    expect(logs?.filename).toBe("whatsminer-logs.tgz");
    expect(logs?.contentType).toBe("application/gzip");
    expect(logs?.data.equals(archive)).toBe(true);
    expect(h.sent).toEqual([{ id: "wm-1", command: "downloadLogs", params: {} }]);
  });

  it("is null for a device outside the layout's miners, 501 without the command, 502 on failure", async () => {
    const h = harness();
    expect(await h.logs(h.mdk, "ghost")).toBeNull();
    expect(await h.logs(h.mdk, "meter-1")).toBeNull();
    await expect(h.logs(h.mdk, "am-1")).rejects.toMatchObject({
      statusCode: 501,
      message: "ERR_LOGS_UNSUPPORTED",
    });
    const failing: Mdk = {
      ...h.mdk,
      async getCommandStatus() {
        return { status: "FAILED", result: null, error: "ERR_LOG_BACKUP_FAILED" };
      },
    };
    await expect(h.logs(failing, "wm-1")).rejects.toMatchObject({
      statusCode: 502,
      message: "ERR_LOGS_FAILED",
    });
  });
});
