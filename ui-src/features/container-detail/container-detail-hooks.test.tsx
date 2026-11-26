// @vitest-environment jsdom
import { act, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { containerLayoutSchema, type Miner } from "../../api/contract";
import { createFakeGateway } from "../../test-utils/fake-gateway";
import { renderHookWithApp } from "../../test-utils/render";
import { DEFAULT_HEATMAP_METRIC } from "./heatmap-shape";
import { type LayoutSocket, type LayoutView, toLayoutView } from "./layout-shape";
import { DEFAULT_PCT, PCT_MAX } from "./power-adjustment-shape";
import { useContainerCharts } from "./use-container-charts";
import { useContainerLayout } from "./use-container-layout";
import { useHeatmap } from "./use-heatmap";
import { useMinerLogsDownload } from "./use-miner-logs-download";
import { usePowerAdjustment } from "./use-power-adjustment";
import { usePowerSelection } from "./use-power-selection";
import { useSocketSelection } from "./use-socket-selection";

/** Container 1 of the plugin's mock site, as the page shapes it. */
const layoutOf = (gateway = createFakeGateway()): LayoutView =>
  toLayoutView(containerLayoutSchema.parse(gateway.site.containerLayout("container-1")));

const LAYOUT = layoutOf();

const socketAt = (layout: LayoutView, position: string): LayoutSocket => {
  const socket = layout.racks.flatMap((rack) => rack.sockets).find((s) => s.position === position);
  if (socket === undefined) throw new Error(`no socket ${position}`);
  return socket;
};

const minerAt = (layout: LayoutView, position: string): Miner => {
  const { miner } = socketAt(layout, position);
  if (miner === null) throw new Error(`no miner at ${position}`);
  return miner;
};

// 1-1-1 is offline, 1-1-2 and 1-1-3 are mining, 1-1-19 is empty.
const OFFLINE = minerAt(LAYOUT, "1-1-1");
const MINING = minerAt(LAYOUT, "1-1-2");
const MINING_TOO = minerAt(LAYOUT, "1-1-3");

describe("useContainerLayout", () => {
  it("loads the container's layout and shapes it", async () => {
    const { result } = renderHookWithApp(() => useContainerLayout("container-1"));

    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    if (result.current.status !== "ready") throw new Error("not ready");
    expect(result.current.layout.container.name).toBe("Container 1");
    expect(result.current.layout.racks).toHaveLength(4);
  });

  it("reports an unknown container as not found, without retrying", async () => {
    const { result, gateway } = renderHookWithApp(() => useContainerLayout("container-9"));

    await waitFor(() => expect(result.current.status).toBe("not-found"));
    const reads = gateway.requests.filter((r) => r.path === "/api/containers/container-9/layout");
    expect(reads).toHaveLength(1);
  });

  it("reports a failed read with an operator-facing reason after its retries", async () => {
    const gateway = createFakeGateway();
    gateway.fail("/api/containers/container-1/layout", 503);
    const { result } = renderHookWithApp(() => useContainerLayout("container-1"), { gateway });

    await waitFor(() => expect(result.current.status).toBe("error"), { timeout: 15_000 });
    if (result.current.status !== "error") throw new Error("no error");
    expect(result.current.message).toContain("not reachable (HTTP 503)");
    const reads = gateway.requests.filter((r) => r.path === "/api/containers/container-1/layout");
    expect(reads).toHaveLength(4);
  }, 20_000);
});

describe("useSocketSelection", () => {
  it("selects a miner, follows the layout, and clears on a second pick", () => {
    const { result } = renderHookWithApp(() => useSocketSelection(LAYOUT));

    expect(result.current.selected).toBeUndefined();
    expect(result.current.isSelected(MINING)).toBe(false);

    act(() => result.current.onSelect(MINING));
    expect(result.current.selected?.miner.id).toBe(MINING.id);
    expect(result.current.selected?.rack.name).toBe("Rack 1-1");
    expect(result.current.isSelected(MINING)).toBe(true);
    expect(result.current.isSelected(MINING_TOO)).toBe(false);

    act(() => result.current.onSelect(MINING_TOO));
    expect(result.current.selected?.miner.id).toBe(MINING_TOO.id);

    act(() => result.current.onSelect(MINING_TOO));
    expect(result.current.selected).toBeUndefined();
  });
});

describe("usePowerSelection", () => {
  it("toggles miners, selects every reachable one and clears", () => {
    const { result } = renderHookWithApp(() => usePowerSelection(LAYOUT));
    // 72 miners in container 1, 2 of them offline.
    expect(result.current.selectableCount).toBe(70);
    expect(result.current.miners).toEqual([]);

    act(() => result.current.onToggle(MINING_TOO));
    act(() => result.current.onToggle(MINING));
    expect(result.current.miners.map((m) => m.id)).toEqual([MINING.id, MINING_TOO.id]);
    expect(result.current.ids.has(MINING.id)).toBe(true);

    act(() => result.current.onToggle(MINING));
    expect(result.current.miners.map((m) => m.id)).toEqual([MINING_TOO.id]);

    act(() => result.current.onSelectAll());
    expect(result.current.miners).toHaveLength(70);
    expect(result.current.ids.has(OFFLINE.id)).toBe(false);

    act(() => result.current.onClear());
    expect(result.current.miners).toEqual([]);
  });

  it("drops an offline miner from the selection", () => {
    const { result } = renderHookWithApp(() => usePowerSelection(LAYOUT));

    act(() => result.current.onToggle(OFFLINE));

    expect(result.current.miners).toEqual([]);
    expect(result.current.ids.size).toBe(0);
  });
});

describe("useHeatmap", () => {
  it("colours mining miners on the scale and leaves sockets without readings out", () => {
    const { result } = renderHookWithApp(() => useHeatmap(LAYOUT));

    expect(result.current.metric).toBe(DEFAULT_HEATMAP_METRIC);
    expect(result.current.scale).toBeDefined();
    expect(result.current.faceOf(socketAt(LAYOUT, "1-1-19"))).toBeUndefined();
    expect(result.current.faceOf(socketAt(LAYOUT, "1-1-1"))).toEqual({
      lines: ["—"],
      heat: "none",
    });
    const face = result.current.faceOf(socketAt(LAYOUT, "1-1-2"));
    expect(face?.lines[0]).toMatch(/^\d+°$/);
    expect(face?.heat).toEqual(expect.objectContaining({ fill: expect.stringMatching(/^#/) }));
  });

  it("switches the metric the scale reads", () => {
    const { result } = renderHookWithApp(() => useHeatmap(LAYOUT));

    act(() => result.current.onMetricChange("hashrateThs"));

    expect(result.current.metric).toBe("hashrateThs");
    expect(result.current.scale?.high).toBeGreaterThan(100);
    expect(result.current.faceOf(socketAt(LAYOUT, "1-1-2"))?.lines[0]).not.toContain("°");
  });
});

describe("usePowerAdjustment", () => {
  const renderAdjustment = (gateway = createFakeGateway()) =>
    renderHookWithApp(
      () => {
        const selection = usePowerSelection(LAYOUT);
        return { selection, adjustment: usePowerAdjustment(selection) };
      },
      { gateway },
    );

  it("keeps the field and the slider in step, clamped to 0-200%", () => {
    const { result } = renderAdjustment();
    const adjustment = () => result.current.adjustment;

    expect(adjustment().pct).toBe(DEFAULT_PCT);
    expect(adjustment().fieldText).toBe(String(DEFAULT_PCT));

    act(() => adjustment().onFieldChange("150"));
    expect(adjustment().pct).toBe(150);
    expect(adjustment().fieldText).toBe("150");

    // Clearing the field keeps the last percentage while it shows what was typed.
    act(() => adjustment().onFieldChange(""));
    expect(adjustment().pct).toBe(150);
    expect(adjustment().fieldText).toBe("");

    act(() => adjustment().onFieldBlur());
    expect(adjustment().fieldText).toBe("150");

    act(() => adjustment().onFieldChange("999"));
    expect(adjustment().pct).toBe(PCT_MAX);

    act(() => adjustment().onSlide(42.6));
    expect(adjustment().pct).toBe(43);
    expect(adjustment().fieldText).toBe("43");
  });

  it("names the selection and the percentage it shares", async () => {
    const { result } = renderAdjustment();

    expect(result.current.adjustment.name).toBe("0 miners");
    expect(result.current.adjustment.sharedPct).toBeNull();
    expect(result.current.adjustment.canApply).toBe(false);

    act(() => result.current.selection.onToggle(MINING));
    expect(result.current.adjustment.name).toBe(MINING.serial);
    expect(result.current.adjustment.sharedPct).toBe(100);
    await waitFor(() => expect(result.current.adjustment.canApply).toBe(true));
    expect(result.current.adjustment.commandsOff).toBe(false);

    act(() => result.current.selection.onToggle(MINING_TOO));
    expect(result.current.adjustment.name).toBe("2 miners");
  });

  it("asks before sending, and sends the percentage to the picked miners", async () => {
    const { result, gateway } = renderAdjustment();
    act(() => result.current.selection.onToggle(MINING));
    act(() => result.current.adjustment.onSlide(80));

    act(() => result.current.adjustment.onApply());
    expect(result.current.adjustment.pending).toEqual({ kind: "pct", pct: 80 });

    act(() => result.current.adjustment.onCancel());
    expect(result.current.adjustment.pending).toBeUndefined();

    act(() => result.current.adjustment.onApply());
    const choice = result.current.adjustment.pending;
    if (choice === undefined) throw new Error("nothing pending");
    act(() => result.current.adjustment.onConfirm(choice));

    expect(result.current.adjustment.pending).toBeUndefined();
    await waitFor(() =>
      expect(gateway.requests.some((r) => r.path === "/api/commands/power-pct")).toBe(true),
    );
    const command = gateway.requests.find((r) => r.path === "/api/commands/power-pct");
    expect(command?.method).toBe("POST");
    expect(command?.body).toEqual({ target: { minerIds: [MINING.id] }, pct: 80 });
    await waitFor(() => expect(result.current.adjustment.sending).toBe(false));
  });

  it("reports commands off on a site that cannot send them", async () => {
    const { result } = renderAdjustment(createFakeGateway({ commandsEnabled: false }));
    act(() => result.current.selection.onToggle(MINING));

    await waitFor(() => expect(result.current.adjustment.commandsOff).toBe(true));
    expect(result.current.adjustment.canApply).toBe(false);
  });
});

/** jsdom has no object URLs: a saved file gets a fake one. */
class TestUrl extends URL {
  static override createObjectURL = () => "blob:logs";
  static override revokeObjectURL = () => undefined;
}

describe("useMinerLogsDownload", () => {
  const saved: string[] = [];

  beforeEach(() => {
    saved.length = 0;
    vi.stubGlobal("URL", TestUrl);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      saved.push(this.download);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("saves the archive under the name the route gives", async () => {
    const { result } = renderHookWithApp(() => useMinerLogsDownload());

    act(() => result.current.download(MINING));

    expect(result.current.isDownloading(MINING.id)).toBe(true);
    expect(result.current.isDownloading(MINING_TOO.id)).toBe(false);
    await waitFor(() => expect(result.current.isDownloading(MINING.id)).toBe(false));
    expect(saved).toEqual([`${MINING.id}-logs.txt`]);
  });

  it("reports a failed download in a toast and saves nothing", async () => {
    const gateway = createFakeGateway();
    gateway.fail(`/api/miners/${MINING.id}/logs`, 502);
    const { result } = renderHookWithApp(() => useMinerLogsDownload(), { gateway });

    act(() => result.current.download(MINING));

    expect(await screen.findByText(`Could not download the logs of ${MINING.serial}`)).toBeTruthy();
    await waitFor(() => expect(result.current.isDownloading(MINING.id)).toBe(false));
    expect(saved).toEqual([]);
  });

  it("keeps showing the newer download when an older one ends", async () => {
    const { result } = renderHookWithApp(() => useMinerLogsDownload());

    act(() => {
      result.current.download(MINING);
      result.current.download(MINING_TOO);
    });

    expect(result.current.isDownloading(MINING_TOO.id)).toBe(true);
    await waitFor(() => expect(result.current.isDownloading(MINING_TOO.id)).toBe(false));
    expect(saved).toHaveLength(2);
  });
});

describe("useContainerCharts", () => {
  const DAY_MS = 86_400_000;

  it("shows the last seven days of the container, by day", async () => {
    const { result, gateway } = renderHookWithApp(() => useContainerCharts(LAYOUT));

    expect(result.current.rackId).toBeUndefined();
    expect(result.current.hashrate.axisFormat).toBe("dd/MM");
    const { from, to } = result.current.range;
    if (from === undefined || to === undefined) throw new Error("no range");
    expect(Math.round((to.getTime() - from.getTime()) / DAY_MS)).toBe(7);

    await waitFor(() => expect(result.current.hashrate.view.status).toBe("ready"));
    await waitFor(() => expect(result.current.power.view.status).toBe("ready"));
    const reads = gateway.requests.filter((r) => r.path === "/api/history");
    expect(
      reads.map((r) => r.query.get("metric") ?? "").sort((a, b) => a.localeCompare(b)),
    ).toEqual(["hashrate", "power"]);
    expect(reads.every((r) => r.query.get("containerId") === "container-1")).toBe(true);
    expect(reads.every((r) => !r.query.has("rackId"))).toBe(true);
  });

  it("reads one rack once it is picked", async () => {
    const { result, gateway } = renderHookWithApp(() => useContainerCharts(LAYOUT));

    act(() => result.current.onRackChange("container-1-rack-2"));

    expect(result.current.rackId).toBe("container-1-rack-2");
    await waitFor(() =>
      expect(gateway.requests.some((r) => r.query.get("rackId") === "container-1-rack-2")).toBe(
        true,
      ),
    );
  });

  it("shows the first click of a range, then the picked days, then the last seven again", () => {
    const { result } = renderHookWithApp(() => useContainerCharts(LAYOUT));
    const day = new Date(2026, 0, 10);

    act(() => result.current.onRangeChange({ from: day, to: undefined }));
    expect(result.current.range).toEqual({ from: day, to: undefined });
    expect(result.current.hashrate.axisFormat).toBe("dd/MM");

    // A single past day labels hours.
    act(() => result.current.onRangeChange({ from: day, to: day }));
    expect(result.current.range).toEqual({ from: day, to: day });
    expect(result.current.hashrate.axisFormat).toBe("HH:mm");
    expect(result.current.power.axisFormat).toBe("HH:mm");

    act(() => result.current.onRangeChange(undefined));
    expect(result.current.hashrate.axisFormat).toBe("dd/MM");
    expect(result.current.range.from?.getTime()).not.toBe(day.getTime());
  });

  it("moves the last seven days on at midnight", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    try {
      vi.setSystemTime(new Date(2026, 4, 20, 23, 59, 58));
      const { result } = renderHookWithApp(() => useContainerCharts(LAYOUT));
      expect(result.current.range.to?.getDate()).toBe(20);

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(result.current.range.to?.getDate()).toBe(21);
      expect(result.current.range.from?.getDate()).toBe(15);
    } finally {
      vi.useRealTimers();
    }
  });
});
