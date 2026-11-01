/**
 * Writes plugin/mdk-plugin.json from api/route-table.ts. With `--check` it only
 * compares and exits 1 when the file is stale (CI runs that).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { toPluginManifest } from "../api/route-table.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));
const manifestPath = `${root}plugin/mdk-plugin.json`;
const pkg = z
  .object({ name: z.string(), version: z.string() })
  .parse(JSON.parse(readFileSync(`${root}package.json`, "utf8")));

const manifest = toPluginManifest({
  name: pkg.name,
  version: pkg.version,
  description:
    "Operation Center Lite routes: site summary, containers, history, power meters, miners and power commands.",
});
const next = `${JSON.stringify(manifest, null, 2)}\n`;

if (process.argv.includes("--check")) {
  const current = readFileSync(manifestPath, "utf8");
  if (current !== next) {
    console.error("plugin/mdk-plugin.json is stale: run `npm run gen:routes`");
    process.exit(1);
  }
  console.log("plugin/mdk-plugin.json is up to date");
} else {
  writeFileSync(manifestPath, next);
  console.log(`wrote ${manifestPath} (${manifest.routes.length} routes)`);
}
