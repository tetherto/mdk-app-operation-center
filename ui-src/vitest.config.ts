import { defineConfig } from "vitest/config";

// Kept apart from vite.config.ts (the library build): tests run the source
// directly, in Node, without the MDK shared-module externals.
export default defineConfig({
  test: {
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules/**"],
    environment: "node",
    // MDK friction (0.13.0 on npm): the published ESM dist imports directories
    // without an extension (`export * from "./apps"`), which Node's loader
    // rejects. Inlining sends them through Vite's resolver instead.
    server: { deps: { inline: [/@tetherto\/mdk-/] } },
  },
});
