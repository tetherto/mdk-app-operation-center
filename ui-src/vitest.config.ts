import { defineConfig } from "vitest/config";

// Kept apart from vite.config.ts (the library build): tests run the source
// directly, in Node, without the MDK shared-module externals.
export default defineConfig({
  test: {
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules/**"],
    environment: "node",
    // The published @tetherto/mdk-* builds import without file extensions
    // (`export * from './apps'`), which Node's ESM loader refuses; inlining
    // them lets Vite resolve those imports instead.
    server: { deps: { inline: [/@tetherto\/mdk-/] } },
    // `npm run test:coverage` writes to the app root's coverage/, where CI's
    // coverage gate reads coverage-final.json.
    coverage: {
      provider: "v8",
      reportsDirectory: "../coverage",
      reporter: ["text-summary", "json"],
      include: ["**/*.{ts,tsx}"],
      exclude: [
        "**/*.test.{ts,tsx}",
        "**/*.d.ts",
        "node_modules/**",
        "scripts/**",
        "test-utils/**",
        "*.config.ts",
      ],
    },
  },
});
