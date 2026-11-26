// @vitest-environment jsdom
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type ContainerLayout, containerLayoutSchema } from "../../api/contract";
import { APP_PATHS } from "../../app-routes";
import { createFakeGateway, type FakeGateway } from "../../test-utils/fake-gateway";
import { renderWithApp } from "../../test-utils/render";
import type { HistoryView } from "../history/use-history";
import { ContainerDetailPage } from "./container-detail-page";

// lightweight-charts draws on a canvas jsdom does not have: the card is
// replaced by its title and what it was given.
vi.mock("../history/history-chart-card", () => ({
  HistoryChartCard: ({
    title,
    view,
    axisFormat,
  }: {
    title: string;
    view: HistoryView;
    axisFormat: string;
  }) => (
    <section aria-label={title}>
      {title}: {view.status} by {axisFormat}
    </section>
  ),
}));

/** jsdom has no object URLs: a saved file gets a fake one. */
class TestUrl extends URL {
  static override createObjectURL = () => "blob:file";
  static override revokeObjectURL = () => undefined;
}

const saved: string[] = [];

beforeEach(() => {
  saved.length = 0;
  vi.stubGlobal("URL", TestUrl);
  // Radix measures some controls with it; jsdom has none.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe = () => undefined;
      unobserve = () => undefined;
      disconnect = () => undefined;
    },
  );
  vi.stubGlobal("matchMedia", (media: string) => ({
    matches: false,
    media,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
  // Radix Select asks these of its trigger and its items.
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = () => undefined;
  Element.prototype.scrollIntoView = () => undefined;
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    saved.push(this.download);
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const renderPage = (path: string, gateway: FakeGateway = createFakeGateway()) =>
  renderWithApp(<ContainerDetailPage />, {
    gateway,
    routePath: APP_PATHS.CONTAINER_DETAIL,
    initialPath: `/${path}`,
  });

const LAYOUT_PATH = "/api/containers/container-1/layout";

/** Answers container 1's layout with the mock site's, changed by `change`. */
const serveLayout = (gateway: FakeGateway, change: (layout: ContainerLayout) => ContainerLayout) =>
  gateway.use((request) =>
    request.path === LAYOUT_PATH
      ? {
          kind: "json",
          body: change(containerLayoutSchema.parse(gateway.site.containerLayout("container-1"))),
        }
      : undefined,
  );

const socketButton = (position: string) =>
  screen.getByRole("button", { name: new RegExp(`^Socket ${position},`) });

const sidePanel = () => screen.getByRole("complementary", { name: "Container 1" });

describe("ContainerDetailPage", () => {
  it("shows a spinner, then the container with its model and miner count", async () => {
    renderPage("explorer/containers/container-1");

    expect(screen.getByRole("heading", { name: "container-1" })).toBeTruthy();
    expect(await screen.findByRole("heading", { name: "Container 1" })).toBeTruthy();
    expect(screen.getByText("MicroBT WhatsMiner M56 · 72 miners")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Site Overview" })).toBeTruthy();
    // No tab in the URL opens Layout.
    expect(screen.getByRole("tab", { name: "Layout", selected: true })).toBeTruthy();
  });

  it("says when the site has no such container", async () => {
    renderPage("explorer/containers/container-9/layout");

    expect(await screen.findByText("Container not found")).toBeTruthy();
    expect(screen.getByText('This site has no container "container-9".')).toBeTruthy();
  });

  it("says why the container could not load", async () => {
    const gateway = createFakeGateway();
    gateway.fail(LAYOUT_PATH, 502);
    renderPage("explorer/containers/container-1/layout", gateway);

    expect(
      await screen.findByText("Could not load the container", undefined, { timeout: 15_000 }),
    ).toBeTruthy();
    expect(screen.getByText(/not reachable \(HTTP 502\)/)).toBeTruthy();
  }, 20_000);

  it("opens Layout for a tab it does not know", async () => {
    renderPage("explorer/containers/container-1/nope");

    expect(await screen.findByRole("tab", { name: "Layout", selected: true })).toBeTruthy();
  });

  it("switches tabs and keeps the tab in the URL", async () => {
    const user = userEvent.setup();
    renderPage("explorer/containers/container-1/layout");
    await screen.findByRole("heading", { name: "Container 1" });

    await user.click(screen.getByRole("tab", { name: "Charts" }));
    expect(await screen.findByRole("tab", { name: "Charts", selected: true })).toBeTruthy();
    expect(await screen.findByText("Hash Rate: ready by dd/MM")).toBeTruthy();
    expect(await screen.findByText("Power Consumption: ready by dd/MM")).toBeTruthy();

    await user.click(screen.getByRole("tab", { name: "Heatmap" }));
    expect(await screen.findByLabelText("Colour scale")).toBeTruthy();

    await user.click(screen.getByRole("tab", { name: "Power Adjustment" }));
    expect(await screen.findByRole("button", { name: "Select All" })).toBeTruthy();
  });

  it("shows the hosted demo notice under the tabs when commands are off", async () => {
    renderPage(
      "explorer/containers/container-1/layout",
      createFakeGateway({ commandsEnabled: false }),
    );

    const notice = await screen.findByText(/can't send commands to miners/);
    expect(notice.getAttribute("role")).toBe("status");
  });
});

describe("Layout tab", () => {
  it("shows the selected miner's readings beside the grid", async () => {
    const user = userEvent.setup();
    renderPage("explorer/containers/container-1/layout");
    await screen.findByRole("heading", { name: "Container 1" });

    expect(within(sidePanel()).getByText("Select a socket")).toBeTruthy();
    expect(within(sidePanel()).getByText("Select a socket to see its miner.")).toBeTruthy();

    await user.click(socketButton("1-1-2"));

    expect(within(sidePanel()).getByText("Rack 1-1 · Socket 1-1-2")).toBeTruthy();
    expect(within(sidePanel()).getByText("Hash Rate")).toBeTruthy();
    expect(within(sidePanel()).getByText("10.1.1.12")).toBeTruthy();
    expect(within(sidePanel()).getByText("Mining")).toBeTruthy();
    expect(socketButton("1-1-2").getAttribute("aria-pressed")).toBe("true");

    await user.click(socketButton("1-1-2"));
    expect(within(sidePanel()).getByText("Select a socket")).toBeTruthy();
  });

  it("labels each socket with its miner, status, PDU power and readings", async () => {
    renderPage("explorer/containers/container-1/layout");
    await screen.findByRole("heading", { name: "Container 1" });

    expect(socketButton("1-1-1").getAttribute("aria-label")).toMatch(
      /^Socket 1-1-1, HT00101001, Offline, Socket Off, 0\.0 kW, 0\.0 A$/,
    );
    expect(
      screen.getByRole("img", { name: "Socket 1-1-19: no miner, Socket Off, 0.0 A" }),
    ).toBeTruthy();
    expect(screen.getByRole("list", { name: "Legend" }).querySelectorAll("li")).toHaveLength(10);
    expect(screen.getByText("Mining with Error")).toBeTruthy();
  });

  it("leaves out what the PDU does not report", async () => {
    const gateway = createFakeGateway();
    serveLayout(gateway, (layout) => ({
      ...layout,
      racks: layout.racks.map((rack) => ({
        ...rack,
        sockets: rack.sockets.map((socket) => ({ ...socket, currentA: null, enabled: null })),
      })),
    }));
    renderPage("explorer/containers/container-1/layout", gateway);
    await screen.findByRole("heading", { name: "Container 1" });

    expect(screen.getByRole("img", { name: "Socket 1-1-19: no miner" })).toBeTruthy();
    expect(socketButton("1-1-1").getAttribute("aria-label")).toMatch(/, - A$/);
    expect(socketButton("1-1-1").getAttribute("data-power")).toBe("unknown");
  });
});

describe("Workbench", () => {
  const grid = () => {
    const found = document.querySelector<HTMLElement>(".op-centre-lite-socket-grid");
    if (found === null) throw new Error("no grid");
    return found;
  };

  it("zooms the grid in steps and resets it", async () => {
    const user = userEvent.setup();
    renderPage("explorer/containers/container-1/layout");
    await screen.findByRole("heading", { name: "Container 1" });
    const button = (name: string) => screen.getByRole("button", { name });

    expect(button("Reset").hasAttribute("disabled")).toBe(true);
    await user.click(button("Zoom In"));
    await user.click(button("Zoom In"));
    expect(grid().style.zoom).toBe("1.5");
    expect(button("Zoom In").hasAttribute("disabled")).toBe(true);

    await user.click(button("Reset"));
    expect(grid().style.zoom).toBe("1");

    await user.click(button("Zoom Out"));
    expect(grid().style.zoom).toBe("0.75");
    expect(button("Zoom Out").hasAttribute("disabled")).toBe(true);
  });

  it("lists every socket in position order in Ordered View", async () => {
    const user = userEvent.setup();
    renderPage("explorer/containers/container-1/layout");
    await screen.findByRole("heading", { name: "Container 1" });

    expect(screen.getByRole("region", { name: "Rack 1-2" })).toBeTruthy();
    const ordered = screen.getByRole("button", { name: "Ordered View" });
    await user.click(ordered);

    expect(ordered.getAttribute("aria-pressed")).toBe("true");
    expect(grid().dataset.ordered).toBe("true");
    expect(screen.queryByRole("region", { name: "Rack 1-2" })).toBeNull();
    expect(socketButton("1-4-18")).toBeTruthy();

    await user.click(ordered);
    expect(screen.getByRole("region", { name: "Rack 1-2" })).toBeTruthy();
  });

  it("prints the page and exports the sockets as CSV", async () => {
    const user = userEvent.setup();
    const print = vi.fn<() => void>();
    vi.stubGlobal("print", print);
    renderPage("explorer/containers/container-1/layout");
    await screen.findByRole("heading", { name: "Container 1" });

    await user.click(screen.getByRole("button", { name: "Print" }));
    expect(print).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Export" }));
    expect(saved).toEqual(["container-1-sockets.csv"]);
  });
});

describe("Heatmap tab", () => {
  it("colours sockets by inlet temperature and switches the metric", async () => {
    const user = userEvent.setup();
    renderPage("explorer/containers/container-1/heatmap");
    await screen.findByRole("heading", { name: "Container 1" });

    const legend = screen.getByLabelText("Colour scale");
    expect(within(legend).getByText("Inlet temperature")).toBeTruthy();
    expect(within(legend).getByText(/coolest$/)).toBeTruthy();
    expect(within(legend).getByText(/hottest$/)).toBeTruthy();
    expect(socketButton("1-1-1").getAttribute("data-heat")).toBe("none");
    expect(socketButton("1-1-2").getAttribute("data-heat")).toMatch(/^(light|dark)$/);

    await user.click(screen.getByRole("combobox", { name: "Metric" }));
    await user.click(await screen.findByRole("option", { name: "Hash rate" }));

    expect(within(legend).getByText("Hash rate")).toBeTruthy();
    expect(within(legend).getByText(/highest$/)).toBeTruthy();
  });

  it("shows the selected miner's controls, readings and serial, and downloads its logs", async () => {
    const user = userEvent.setup();
    renderPage("explorer/containers/container-1/heatmap");
    await screen.findByRole("heading", { name: "Container 1" });

    expect(within(sidePanel()).getByText("Select a socket to see its miner.")).toBeTruthy();
    await user.click(socketButton("1-1-2"));

    const panel = sidePanel();
    expect(within(panel).getByText("Rack 1-1 · Socket 1-1-2")).toBeTruthy();
    expect(
      within(panel).getByRole("combobox", { name: "Set power mode of HT00101002" }),
    ).toBeTruthy();
    expect(within(panel).queryByRole("combobox", { name: /power percentage/ })).toBeNull();
    expect(within(panel).getByText("Efficiency")).toBeTruthy();
    expect(within(panel).getByText("Env Temp")).toBeTruthy();
    expect(within(panel).getByText("HT00101002")).toBeTruthy();

    await user.click(within(panel).getByRole("button", { name: "Download Logs" }));
    await waitFor(() => expect(saved).toEqual(["miner-1-1-2-logs.txt"]));
  });

  it("falls back where a miner has no serial, and shows no scale with no reporting miner", async () => {
    const user = userEvent.setup();
    const gateway = createFakeGateway();
    serveLayout(gateway, (layout) => ({
      ...layout,
      racks: layout.racks.map((rack) => ({
        ...rack,
        sockets: rack.sockets.map((socket) => ({
          ...socket,
          miner:
            socket.miner === null
              ? null
              : {
                  ...socket.miner,
                  serial: "",
                  status: "offline",
                  envTempC: null,
                  uptimeS: 0,
                  lastUpdate: 0,
                },
        })),
      })),
    }));
    renderPage("explorer/containers/container-1/heatmap", gateway);
    await screen.findByRole("heading", { name: "Container 1" });

    const legend = screen.getByLabelText("Colour scale");
    expect(within(legend).queryByText(/median$/)).toBeNull();

    await user.click(socketButton("1-1-2"));
    const info = within(sidePanel()).getByRole("region", { name: "Miner Info" });
    expect(within(info).getByText("-")).toBeTruthy();
    expect(
      within(sidePanel()).getByRole("combobox", { name: "Set power mode of miner-1-1-2" }),
    ).toBeTruthy();
  });
});
