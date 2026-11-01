import { describe, expect, it } from "vitest";

import type { SiteSummary } from "../../api/contract";
import { toSiteStats } from "./site-summary-shape";

const createSummary = (overrides: Partial<SiteSummary> = {}): SiteSummary => ({
  miners: { total: 288, online: 279, error: 3, offline: 6 },
  hashrateThs: 56_000,
  powerW: 952_000,
  ...overrides,
});

describe("toSiteStats", () => {
  it("converts hashrate to PH/s and power to MW", () => {
    const stats = toSiteStats(createSummary());

    expect(stats.hashratePhs).toBe(56);
    expect(stats.consumptionMw).toBe(0.952);
  });

  it("derives efficiency as W per TH/s", () => {
    const stats = toSiteStats(createSummary({ hashrateThs: 50_000, powerW: 850_000 }));

    expect(stats.efficiencyWPerThs).toBe(17);
  });

  it("leaves efficiency undefined when the site has no hashrate", () => {
    const stats = toSiteStats(createSummary({ hashrateThs: 0, powerW: 20_000 }));

    expect(stats.efficiencyWPerThs).toBeUndefined();
    expect(stats.hashratePhs).toBe(0);
  });

  it("passes the miner counts through", () => {
    expect(toSiteStats(createSummary()).miners).toEqual({
      total: 288,
      online: 279,
      error: 3,
      offline: 6,
    });
  });
});
