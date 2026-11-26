// @vitest-environment jsdom
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeGateway } from "../../test-utils/fake-gateway";
import { renderWithApp } from "../../test-utils/render";
import { PowerCommandControls } from "./power-command-controls";
import { COMMANDS_OFF_MESSAGE } from "./power-commands";

const notifications = vi.hoisted(() => ({
  notifySuccess: vi.fn<(...args: unknown[]) => void>(),
  notifyInfo: vi.fn<(...args: unknown[]) => void>(),
  notifyWarning: vi.fn<(...args: unknown[]) => void>(),
  notifyError: vi.fn<(...args: unknown[]) => void>(),
}));

vi.mock("@tetherto/mdk-react-devkit", async (importOriginal) => {
  const devkit = await importOriginal<typeof import("@tetherto/mdk-react-devkit")>();
  return { ...devkit, useNotification: () => notifications };
});

// Radix Select reaches for pointer capture and scrolling, which jsdom lacks.
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = () => undefined;
  Element.prototype.scrollIntoView = () => undefined;
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

const MODE_TRIGGER = "Set power mode of Container 1";
const PCT_TRIGGER = "Set power percentage of Container 1";

const renderControls = (
  props: Partial<Parameters<typeof PowerCommandControls>[0]> = {},
  gateway = createFakeGateway(),
) =>
  renderWithApp(
    <PowerCommandControls
      target={props.target ?? { containerId: "container-1" }}
      targetName={props.targetName ?? "Container 1"}
      supportedPowerModes={props.supportedPowerModes ?? ["sleep", "low", "normal", "high"]}
      currentMode={props.currentMode === undefined ? "normal" : props.currentMode}
      currentPct={props.currentPct === undefined ? 100 : props.currentPct}
      withPct={props.withPct}
      className="controls"
    />,
    { gateway },
  );

const enabledTrigger = async (name: string) => {
  const trigger = screen.getByRole("combobox", { name });
  await waitFor(() => expect(trigger).not.toHaveProperty("disabled", true));
  return trigger;
};

const posts = (requests: { method: string }[]) =>
  requests.filter((request) => request.method === "POST");

describe("PowerCommandControls", () => {
  it("marks the current mode, asks before applying a pick, then sends it", async () => {
    const user = userEvent.setup();
    const { gateway } = renderControls();

    await user.click(await enabledTrigger(MODE_TRIGGER));
    expect(screen.getByRole("option", { name: "Normal (current)" })).toBeTruthy();
    await user.click(screen.getByRole("option", { name: "Low" }));

    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("Set Container 1 to Low?")).toBeTruthy();
    expect(
      within(dialog).getByText(
        "This applies right away to every online miner in Container 1 that supports it.",
      ),
    ).toBeTruthy();
    await user.click(within(dialog).getByRole("button", { name: "Apply" }));

    await waitFor(() => expect(notifications.notifySuccess).toHaveBeenCalledTimes(1));
    expect(notifications.notifySuccess).toHaveBeenCalledWith(
      "Container 1 set to Low",
      "Sent to 72 miners.",
    );
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(posts(gateway.requests)).toEqual([
      expect.objectContaining({
        path: "/api/commands/power-mode",
        body: { target: { containerId: "container-1" }, mode: "low" },
      }),
    ]);
  });

  it("sends nothing when the operator cancels", async () => {
    const user = userEvent.setup();
    const { gateway } = renderControls({ currentPct: 80 });

    await user.click(await enabledTrigger(PCT_TRIGGER));
    expect(screen.getByRole("option", { name: "80% (current)" })).toBeTruthy();
    await user.click(screen.getByRole("option", { name: "60%" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("Set Container 1 to 60%?")).toBeTruthy();
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(posts(gateway.requests)).toEqual([]);
    expect(notifications.notifySuccess).not.toHaveBeenCalled();
  });

  it("words the dialog for miners picked one by one and sends a percentage", async () => {
    const user = userEvent.setup();
    const target = { minerIds: ["miner-1-1-1", "miner-1-1-2"] };
    const { gateway } = renderControls({
      target,
      targetName: "2 miners",
      currentMode: null,
      currentPct: null,
    });

    await user.click(await enabledTrigger("Set power percentage of 2 miners"));
    expect(screen.queryByText(/\(current\)/)).toBeNull();
    await user.click(screen.getByRole("option", { name: "90%" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("This applies right away to 2 miners.")).toBeTruthy();
    await user.click(within(dialog).getByRole("button", { name: "Apply" }));

    await waitFor(() => expect(notifications.notifySuccess).toHaveBeenCalledTimes(1));
    expect(posts(gateway.requests)).toEqual([
      expect.objectContaining({ path: "/api/commands/power-pct", body: { target, pct: 90 } }),
    ]);
  });

  it("offers only the mode select without the percentage", async () => {
    renderControls({ withPct: false });

    await enabledTrigger(MODE_TRIGGER);
    expect(screen.queryByRole("combobox", { name: PCT_TRIGGER })).toBeNull();
  });

  it("turns the mode select off for a target with no supported modes", async () => {
    renderControls({ supportedPowerModes: [] });

    await enabledTrigger(PCT_TRIGGER);
    expect(screen.getByRole("combobox", { name: MODE_TRIGGER })).toHaveProperty("disabled", true);
  });

  it("turns both selects off, with the reason, on a site with commands off", async () => {
    const { container } = renderControls({}, createFakeGateway({ commandsEnabled: false }));

    const hint = await screen.findByText(COMMANDS_OFF_MESSAGE);
    const mode = screen.getByRole("combobox", { name: MODE_TRIGGER });
    const pct = screen.getByRole("combobox", { name: PCT_TRIGGER });
    expect(mode).toHaveProperty("disabled", true);
    expect(pct).toHaveProperty("disabled", true);
    expect(mode.getAttribute("aria-describedby")).toBe(hint.id);
    expect(pct.getAttribute("aria-describedby")).toBe(hint.id);
    expect(container.querySelector(".controls")?.getAttribute("title")).toBe(COMMANDS_OFF_MESSAGE);
  });

  it("keeps both selects off while the config loads", () => {
    const { container } = renderControls();

    expect(screen.getByRole("combobox", { name: MODE_TRIGGER })).toHaveProperty("disabled", true);
    expect(screen.getByRole("combobox", { name: PCT_TRIGGER })).toHaveProperty("disabled", true);
    expect(container.querySelector(".controls")?.hasAttribute("title")).toBe(false);
    expect(screen.queryByText(COMMANDS_OFF_MESSAGE)).toBeNull();
  });
});
