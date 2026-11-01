/**
 * End-to-end check of the app on a running stack (scripts/e2e.sh boots the
 * dev stack and runs this): signs in, calls every route, parses each body
 * with the contract, sends a command and reads it back, downloads a log
 * archive. Exits 1 on the first failure.
 *
 *   MDK_GATEWAY   http://localhost:3847
 *   E2E_USER      dev
 *   E2E_PASSWORD  the user's password
 */
import { z } from "zod";

import {
  commandResultSchema,
  containerLayoutSchema,
  containersSchema,
  historySchema,
  minersPageSchema,
  powerMetersSchema,
  siteConfigSchema,
  siteSummarySchema,
} from "../api/contract.ts";

const gateway = process.env.MDK_GATEWAY ?? "http://localhost:3847";
const user = process.env.E2E_USER ?? "dev";
const password = process.env.E2E_PASSWORD;
if (password === undefined) throw new Error("E2E_PASSWORD is required");
const mount = `${gateway}/apps/op-centre-lite`;

const loginSchema = z.object({ accessToken: z.string() });
const login = await fetch(`${gateway}/auth/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ username: user, password }),
});
if (!login.ok) throw new Error(`login failed: ${login.status} ${await login.text()}`);
const { accessToken } = loginSchema.parse(await login.json());
const auth = { authorization: `Bearer ${accessToken}` };

let failures = 0;
const check = (name: string, ok: boolean, detail = "") => {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? ` (${detail})` : ""}`);
  if (!ok) failures += 1;
};

const get = async <T>(path: string, schema: z.ZodType<T>): Promise<T> => {
  const res = await fetch(`${mount}${path}`, { headers: auth });
  if (!res.ok) throw new Error(`GET ${path}: ${res.status} ${await res.text()}`);
  return schema.parse(await res.json());
};
const post = async <T>(path: string, body: unknown, schema: z.ZodType<T>): Promise<T> => {
  const res = await fetch(`${mount}${path}`, {
    method: "POST",
    headers: { ...auth, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path}: ${res.status} ${await res.text()}`);
  return schema.parse(await res.json());
};
const status = async (path: string, headers: Record<string, string> = auth) =>
  (await fetch(`${mount}${path}`, { headers })).status;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Reads
check("unauthenticated request is refused", (await status("/api/config", {})) === 401);
const config = await get("/api/config", siteConfigSchema);
check("config", config.siteName.length > 0);
const summary = await get("/api/site/summary", siteSummarySchema);
const { containers } = await get("/api/containers", containersSchema);
const occupied = containers.reduce(
  (sum, c) =>
    sum + Object.entries(c.minerStatus).reduce((n, [k, v]) => (k === "empty" ? n : n + v), 0),
  0,
);
check(
  "summary counts every miner of the layout",
  summary.miners.total === occupied,
  `${summary.miners.total} miners`,
);
check(
  "every miner is reachable on the mock stack",
  summary.miners.offline === 0 && summary.miners.error === 0,
);
check(
  "containers carry racks and supported modes",
  containers.every((c) => c.racks.length > 0 && c.supportedPowerModes.length > 0),
);
const meters = await get("/api/power-meters", powerMetersSchema);
check(
  "one meter per container with a reading",
  meters.meters.length === containers.length && meters.meters.every((m) => m.powerW > 0),
);
const first = containers[0]!;
const layout = await get(`/api/containers/${first.id}/layout`, containerLayoutSchema);
check("container layout lists every socket", layout.racks.flatMap((r) => r.sockets).length > 0);
check("unknown container is 404", (await status("/api/containers/nope/layout")) === 404);
const page = await get("/api/miners?pageSize=5&page=2", minersPageSchema);
check(
  "miners page",
  page.items.length === 5 && page.page === 2 && page.total === summary.miners.total,
);
const found = await get(
  `/api/miners?search=${encodeURIComponent(page.items[0]!.serial)}`,
  minersPageSchema,
);
check(
  "miners search by serial",
  found.total >= 1 && found.items[0]!.serial === page.items[0]!.serial,
);
const history = await get("/api/history?metric=hashrate&interval=5m&limit=3", historySchema);
check(
  "history has the sampler's first point and a nominal",
  history.points.length >= 1 && history.metric === "hashrate" && history.nominal > 0,
);
check(
  "history window errors are 400",
  (await status("/api/history?metric=power&interval=5m&start=5")) === 400,
);

// Commands: the last container (Antminer on the dev stack) reads its mode back at once.
const target = containers.at(-1)!;
const mode = target.supportedPowerModes.includes("low") ? "low" : "high";
const result = await post(
  "/api/commands/power-mode",
  { target: { containerId: target.id }, mode },
  commandResultSchema,
);
check(
  "power mode accepted for the container",
  result.accepted && result.minerCount > 0,
  `${result.minerCount} miners`,
);
const readsBack = async (attempt = 0): Promise<boolean> => {
  const now = await get("/api/containers", containersSchema);
  if (now.containers.find((c) => c.id === target.id)?.powerMode === mode) return true;
  if (attempt >= 40) return false;
  await sleep(500);
  return readsBack(attempt + 1);
};
const readBack = await readsBack();
check(`next read shows the container in ${mode}`, readBack);
const miner = layout.racks[0]!.sockets.find((s) => s.miner !== null)!.miner!;
const pct = await post(
  "/api/commands/power-pct",
  { target: { minerIds: [miner.id, "nope"] }, pct: 75 },
  commandResultSchema,
);
check("power percent accepted for one miner", pct.accepted && pct.minerCount === 1);
const after = await get(`/api/miners?search=${encodeURIComponent(miner.id)}`, minersPageSchema);
check("the miner reports the percent set", after.items[0]?.powerPct === 75);
check(
  "empty target is not accepted",
  !(
    await post(
      "/api/commands/power-mode",
      { target: { minerIds: ["nope"] }, mode: "normal" },
      commandResultSchema,
    )
  ).accepted,
);

// Logs: a download for a miner, 404 for anything else.
const logs = await fetch(`${mount}/api/miners/${miner.id}/logs`, { headers: auth });
const bytes = Buffer.from(await logs.arrayBuffer());
check(
  "miner logs download as an attachment",
  logs.ok &&
    (logs.headers.get("content-disposition") ?? "").startsWith("attachment") &&
    bytes.length > 0,
  `${logs.headers.get("content-type")}, ${bytes.length} bytes`,
);
check("logs of an unknown miner are 404", (await status("/api/miners/nope/logs")) === 404);
check(
  "logs of a meter are 404",
  (await status(`/api/miners/${meters.meters[0]!.id}/logs`)) === 404,
);

if (failures > 0) {
  console.error(`${failures} check(s) failed`);
  process.exit(1);
}
console.log("e2e: every check passed");
