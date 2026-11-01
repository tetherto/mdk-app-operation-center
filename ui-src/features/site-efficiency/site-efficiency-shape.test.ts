import { describe, expect, it } from "vitest";

import type { PowerMeter, PowerMeters } from "../../api/contract";
import {
  SERIES_COLOR_COUNT,
  toSiteEfficiencyView,
  UNMETERED_SLICE_ID,
} from "./site-efficiency-shape";

const createMeter = (overrides: Partial<PowerMeter> = {}): PowerMeter => ({
  id: "meter-1",
  name: "PM-01",
  containerId: "container-1",
  powerW: 60_000,
  hashrateThs: 2_000,
  miners: 18,
  ...overrides,
});

const createMeters = (overrides: Partial<PowerMeters> = {}): PowerMeters => ({
  siteMeterPowerW: 120_000,
  minersPowerW: 110_000,
  hashrateThs: 4_000,
  meters: [
    createMeter(),
    createMeter({ id: "meter-2", name: "PM-02", containerId: "container-2" }),
  ],
  ...overrides,
});

const NAMES = new Map([["container-1", "Container 1"]]);

describe("toSiteEfficiencyView", () => {
  it("derives site efficiency from the site meter and mining efficiency from the miners", () => {
    const view = toSiteEfficiencyView(createMeters(), NAMES);

    expect(view.siteEfficiencyWPerThs).toBe(30);
    expect(view.miningEfficiencyWPerThs).toBe(27.5);
    expect(view.totalPowerMw).toBe(0.12);
  });

  it("leaves efficiency undefined without hashrate", () => {
    const view = toSiteEfficiencyView(createMeters({ hashrateThs: 0 }), NAMES);

    expect(view.siteEfficiencyWPerThs).toBeUndefined();
    expect(view.miningEfficiencyWPerThs).toBeUndefined();
  });

  it("shapes one card per meter, naming its container or falling back to the id", () => {
    const { meters } = toSiteEfficiencyView(createMeters(), NAMES);

    expect(meters.map((meter) => meter.containerName)).toEqual(["Container 1", "container-2"]);
    expect(meters[0]).toMatchObject({
      powerKw: 60,
      hashratePhs: 2,
      miners: 18,
      efficiencyWPerThs: 30,
    });
  });

  it("splits the total between the meters when they cover it all", () => {
    const { breakdown } = toSiteEfficiencyView(createMeters(), NAMES);

    expect(breakdown.map((slice) => [slice.name, slice.sharePct])).toEqual([
      ["PM-01", 50],
      ["PM-02", 50],
    ]);
  });

  it("adds what no meter measures as its own slice", () => {
    const { breakdown } = toSiteEfficiencyView(createMeters({ siteMeterPowerW: 150_000 }), NAMES);

    expect(breakdown.at(-1)).toEqual({
      id: UNMETERED_SLICE_ID,
      name: "Not metered",
      powerKw: 30,
      sharePct: 20,
      colorIndex: undefined,
    });
    expect(breakdown.reduce((sum, slice) => sum + slice.sharePct, 0)).toBeCloseTo(100);
  });

  it("keeps shares at or below 100% when the meters add up to more than the site meter", () => {
    const { breakdown } = toSiteEfficiencyView(createMeters({ siteMeterPowerW: 100_000 }), NAMES);

    expect(breakdown.map((slice) => slice.sharePct)).toEqual([50, 50]);
    expect(breakdown.some((slice) => slice.id === UNMETERED_SLICE_ID)).toBe(false);
  });

  it("cycles the meter colours", () => {
    const meters = Array.from({ length: SERIES_COLOR_COUNT + 1 }, (_, i) =>
      createMeter({ id: `meter-${i}`, powerW: 1 }),
    );
    const { breakdown } = toSiteEfficiencyView(
      createMeters({ siteMeterPowerW: meters.length, meters }),
      NAMES,
    );

    expect(breakdown.at(-1)?.colorIndex).toBe(0);
  });

  it("gives every slice a zero share when the site draws nothing", () => {
    const view = toSiteEfficiencyView(
      createMeters({ siteMeterPowerW: 0, meters: [createMeter({ powerW: 0 })] }),
      NAMES,
    );

    expect(view.breakdown.map((slice) => slice.sharePct)).toEqual([0]);
  });
});
