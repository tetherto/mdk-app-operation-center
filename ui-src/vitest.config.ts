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
    // `npm run test:coverage`. CI's coverage gate reads the repo-root
    // coverage/coverage-final.json, so the report is written one level up.
    // allowExternal measures the plugin (../plugin), which the plugin-*.test.ts
    // suites exercise; only files the tests load are counted.
    coverage: {
      provider: "v8",
      allowExternal: true,
      exclude: ["**/node_modules/**", "**/*.test.ts", "**/*.test.tsx"],
      reportsDirectory: "../coverage",
      reporter: ["text-summary", "json"],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});
