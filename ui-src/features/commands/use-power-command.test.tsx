// @vitest-environment jsdom
import { act, cleanup, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LIVE_QUERY_KEY } from "../../api/query-keys";
import { createFakeGateway } from "../../test-utils/fake-gateway";
import { renderHookWithApp } from "../../test-utils/render";
import { COMMANDS_OFF_MESSAGE } from "./power-commands";
import { usePowerCommand } from "./use-power-command";

const notifications = vi.hoisted(() => ({
  notifySuccess: vi.fn<(...args: unknown[]) => void>(),
  notifyInfo: vi.fn<(...args: unknown[]) => void>(),
  notifyWarning: vi.fn<(...args: unknown[]) => void>(),
  notifyError: vi.fn<(...args: unknown[]) => void>(),
}));

// Only the toast hook is replaced: the toasts' store is the dashboard's, not the app's.
vi.mock("@tetherto/mdk-react-devkit", async (importOriginal) => {
  const devkit = await importOriginal<typeof import("@tetherto/mdk-react-devkit")>();
  return { ...devkit, useNotification: () => notifications };
});

const CONTAINER = { containerId: "container-1" };

const commandRequests = (requests: { method: string; path: string }[]) =>
  requests.filter((request) => request.method === "POST");

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("usePowerCommand", () => {
  it("sends a power mode and tells how many miners took it", async () => {
    const { result, gateway } = renderHookWithApp(() => usePowerCommand(CONTAINER, "Container 1"));

    act(() => result.current.send({ kind: "mode", mode: "low" }));

    await waitFor(() => expect(notifications.notifySuccess).toHaveBeenCalledTimes(1));
    expect(notifications.notifySuccess).toHaveBeenCalledWith(
      "Container 1 set to Low",
      "Sent to 72 miners.",
    );
    expect(commandRequests(gateway.requests)).toEqual([
      expect.objectContaining({
        path: "/api/commands/power-mode",
        body: { target: CONTAINER, mode: "low" },
      }),
    ]);
    await waitFor(() => expect(result.current.sending).toBe(false));
  });

  it("sends a power percentage to picked miners", async () => {
    const target = { minerIds: ["miner-1-1-1", "miner-1-1-2"] };
    const { result, gateway } = renderHookWithApp(() => usePowerCommand(target, "2 miners"));

    act(() => result.current.send({ kind: "pct", pct: 80 }));

    await waitFor(() => expect(notifications.notifySuccess).toHaveBeenCalledTimes(1));
    expect(notifications.notifySuccess).toHaveBeenCalledWith(
      "2 miners set to 80%",
      "Sent to 2 miners.",
    );
    expect(commandRequests(gateway.requests)).toEqual([
      expect.objectContaining({ path: "/api/commands/power-pct", body: { target, pct: 80 } }),
    ]);
  });

  it("warns when no miner took the command", async () => {
    // Container 4's Antminers have no low power mode.
    const { result } = renderHookWithApp(() =>
      usePowerCommand({ containerId: "container-4" }, "Container 4"),
    );

    act(() => result.current.send({ kind: "mode", mode: "low" }));

    await waitFor(() => expect(notifications.notifyWarning).toHaveBeenCalledTimes(1));
    expect(notifications.notifyWarning).toHaveBeenCalledWith(
      "Container 4: nothing changed",
      "No online miner accepts Low.",
    );
    expect(notifications.notifySuccess).not.toHaveBeenCalled();
  });

  it("says commands are off when the site answers 403 (hosted demo)", async () => {
    const gateway = createFakeGateway({ commandsEnabled: false });
    const { result } = renderHookWithApp(() => usePowerCommand(CONTAINER, "Container 1"), {
      gateway,
    });

    act(() => result.current.send({ kind: "mode", mode: "high" }));

    await waitFor(() => expect(notifications.notifyError).toHaveBeenCalledTimes(1));
    expect(notifications.notifyError).toHaveBeenCalledWith(
      "Could not change Container 1",
      COMMANDS_OFF_MESSAGE,
    );
  });

  it("describes any other failure from the route that failed", async () => {
    const gateway = createFakeGateway();
    gateway.fail("/api/commands/power-pct", 503);
    const { result } = renderHookWithApp(() => usePowerCommand(CONTAINER, "Container 1"), {
      gateway,
    });

    act(() => result.current.send({ kind: "pct", pct: 50 }));

    await waitFor(() => expect(notifications.notifyError).toHaveBeenCalledTimes(1));
    expect(notifications.notifyError).toHaveBeenCalledWith(
      "Could not change Container 1",
      "The app's backend is not reachable (HTTP 503). Try again in a moment.",
    );
  });

  describe("follow-up refetches", () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    const sendAndSettle = async () => {
      const rendered = renderHookWithApp(() => usePowerCommand(CONTAINER, "Container 1"));
      const invalidate = vi.spyOn(rendered.queryClient, "invalidateQueries");
      act(() => rendered.result.current.send({ kind: "mode", mode: "normal" }));
      await waitFor(() => expect(invalidate).toHaveBeenCalledTimes(1));
      return { ...rendered, invalidate };
    };

    it("refetches the live reads right away, then at 3, 6 and 9 seconds", async () => {
      const { invalidate } = await sendAndSettle();
      expect(invalidate).toHaveBeenLastCalledWith({ queryKey: LIVE_QUERY_KEY });

      act(() => {
        vi.advanceTimersByTime(3_000);
      });
      expect(invalidate).toHaveBeenCalledTimes(2);
      act(() => {
        vi.advanceTimersByTime(3_000);
      });
      expect(invalidate).toHaveBeenCalledTimes(3);
      act(() => {
        vi.advanceTimersByTime(3_000);
      });
      expect(invalidate).toHaveBeenCalledTimes(4);
      act(() => {
        vi.advanceTimersByTime(30_000);
      });
      expect(invalidate).toHaveBeenCalledTimes(4);
    });

    it("drops the pending refetches when it unmounts", async () => {
      const { invalidate, unmount } = await sendAndSettle();

      unmount();
      vi.advanceTimersByTime(10_000);

      expect(invalidate).toHaveBeenCalledTimes(1);
    });

    it("replaces the pending refetches when a new command goes out", async () => {
      const { invalidate, result } = await sendAndSettle();
      act(() => {
        vi.advanceTimersByTime(2_000);
      });

      act(() => result.current.send({ kind: "pct", pct: 90 }));
      await waitFor(() => expect(invalidate).toHaveBeenCalledTimes(2));
      // The first command's 3 s refetch (1 s away) was dropped: the next is the new one's.
      act(() => {
        vi.advanceTimersByTime(2_500);
      });
      expect(invalidate).toHaveBeenCalledTimes(2);
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(invalidate).toHaveBeenCalledTimes(3);
    });
  });
});
