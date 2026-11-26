// @vitest-environment jsdom
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { saveFile } from "../../lib/save-file";
import { createFakeGateway, type FakeRequest } from "../../test-utils/fake-gateway";
import { renderWithApp } from "../../test-utils/render";
import { ExplorerPage } from "./explorer-page";

vi.mock("../../lib/save-file", () => ({
  saveFile: vi.fn<(fileName: string, blob: Blob) => void>(),
}));

/** Shows where the router is, so a row click's navigation can be checked. */
const LocationProbe = () => {
  const location = useLocation();
  return <output aria-label="location">{`${location.pathname}${location.search}`}</output>;
};

const renderExplorer = (options: Parameters<typeof renderWithApp>[1] = {}) =>
  renderWithApp(
    <>
      <ExplorerPage />
      <LocationProbe />
    </>,
    { initialPath: "/explorer", ...options },
  );

const minersRequests = (requests: FakeRequest[]) =>
  requests.filter((request) => request.path === "/api/miners");

const bodyRows = () => screen.getAllByRole("button").filter((el) => el.tagName === "TR");

const firstCellTexts = () => bodyRows().map((row) => row.querySelector("td")?.textContent ?? "");

const savedFiles = async () =>
  Promise.all(
    vi.mocked(saveFile).mock.calls.map(async ([fileName, blob]) => ({
      fileName,
      text: await blob.text(),
    })),
  );

beforeAll(() => {
  // Radix Select asks for pointer capture and scrolls its items into view; jsdom has neither.
  Object.defineProperty(Element.prototype, "hasPointerCapture", {
    configurable: true,
    value: () => false,
  });
  Object.defineProperty(Element.prototype, "releasePointerCapture", {
    configurable: true,
    value: () => undefined,
  });
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: () => undefined,
  });
});

beforeEach(() => {
  vi.mocked(saveFile).mockClear();
});

// Vitest runs without globals here, so Testing Library does not unmount between tests on its own.
afterEach(() => {
  cleanup();
});

describe("ExplorerPage", () => {
  it("shows a spinner while the containers load", () => {
    const { container } = renderExplorer();

    expect(screen.getByText("Explorer")).toBeTruthy();
    expect(container.querySelector("[role=tablist]")).toBeNull();
  });

  it("shows an error card when the containers cannot load", async () => {
    const gateway = createFakeGateway();
    gateway.fail("/api/containers", 500);
    renderExplorer({ gateway });

    expect(await screen.findByText("Could not load the containers")).toBeTruthy();
    expect(screen.queryByRole("tablist")).toBeNull();
  });

  it("lists the first page of racks, then the next page", async () => {
    const user = userEvent.setup();
    renderExplorer();

    expect(await screen.findByText("Rack 1-1")).toBeTruthy();
    expect(screen.getByText("Showing 1-10 of 16")).toBeTruthy();
    expect(firstCellTexts()).toHaveLength(10);
    expect(screen.getByPlaceholderText("Search racks, containers")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Page 2" }));

    expect(await screen.findByText("Showing 11-16 of 16")).toBeTruthy();
    expect(firstCellTexts()).toEqual([
      "Rack 3-3",
      "Rack 3-4",
      "Rack 4-1",
      "Rack 4-2",
      "Rack 4-3",
      "Rack 4-4",
    ]);
  });

  it("filters the racks by search and goes back to the first page", async () => {
    const user = userEvent.setup();
    renderExplorer();
    await screen.findByText("Rack 1-1");
    await user.click(screen.getByRole("button", { name: "Page 2" }));
    await screen.findByText("Showing 11-16 of 16");

    await user.type(screen.getByRole("textbox", { name: "Search" }), "rack 2-");

    await waitFor(() => expect(screen.getByText("Showing 1-4 of 4")).toBeTruthy());
    expect(firstCellTexts()).toEqual(["Rack 2-1", "Rack 2-2", "Rack 2-3", "Rack 2-4"]);

    await user.clear(screen.getByRole("textbox", { name: "Search" }));
    await user.type(screen.getByRole("textbox", { name: "Search" }), "nothing like this");

    await waitFor(() => expect(screen.queryByText(/^Showing/)).toBeNull());
    expect(screen.queryByText("Rack 1-1")).toBeNull();
  });

  it("filters the racks by container, and back to every container", async () => {
    const user = userEvent.setup();
    renderExplorer();
    await screen.findByText("Rack 1-1");

    await user.click(screen.getByRole("combobox", { name: "Container" }));
    await user.click(await screen.findByRole("option", { name: "Container 3" }));

    await waitFor(() => expect(screen.getByText("Showing 1-4 of 4")).toBeTruthy());
    expect(firstCellTexts()).toEqual(["Rack 3-1", "Rack 3-2", "Rack 3-3", "Rack 3-4"]);

    await user.click(screen.getByRole("combobox", { name: "Container" }));
    await user.click(await screen.findByRole("option", { name: "All containers" }));

    await waitFor(() => expect(screen.getByText("Showing 1-10 of 16")).toBeTruthy());
  });

  it("opens a rack's container from its row", async () => {
    const user = userEvent.setup();
    renderExplorer();
    await screen.findByText("Rack 2-1");

    const row = bodyRows().find((el) => within(el).queryByText("Rack 2-1") !== null);
    if (row === undefined) throw new Error("no Rack 2-1 row");
    await user.click(row);

    expect(screen.getByRole("status", { name: "location" }).textContent).toBe(
      "/explorer/containers/container-2",
    );
  });

  it("switches to the Miners tab and keeps it in the URL", async () => {
    const user = userEvent.setup();
    const { gateway } = renderExplorer();
    await screen.findByText("Rack 1-1");
    expect(minersRequests(gateway.requests)).toHaveLength(0);

    await user.click(screen.getByRole("tab", { name: "Miners" }));

    expect(await screen.findByText("Showing 1-10 of 288")).toBeTruthy();
    expect(screen.getByText("HT00101001")).toBeTruthy();
    expect(screen.getByPlaceholderText("Search serials, IPs, positions")).toBeTruthy();
    expect(screen.getByRole("status", { name: "location" }).textContent).toBe(
      "/explorer?tab=miners",
    );

    await user.click(screen.getByRole("tab", { name: "Racks" }));

    expect(await screen.findByText("Showing 1-10 of 16")).toBeTruthy();
    expect(screen.getByRole("status", { name: "location" }).textContent).toBe("/explorer");
  });

  it("opens on the Miners tab from the URL and pages through the miners", async () => {
    const user = userEvent.setup();
    const { gateway } = renderExplorer({ initialPath: "/explorer?tab=miners" });

    expect(await screen.findByText("Showing 1-10 of 288")).toBeTruthy();
    // The container name stands in for the id the miners route sends.
    expect(screen.getAllByText("Container 1").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Page 2" }));

    expect(await screen.findByText("Showing 11-20 of 288")).toBeTruthy();
    const last = minersRequests(gateway.requests).at(-1);
    expect(last?.query.get("page")).toBe("2");
    expect(last?.query.get("pageSize")).toBe("10");
  });

  it("searches the miners on the server once typing pauses", async () => {
    const user = userEvent.setup();
    const { gateway } = renderExplorer({ initialPath: "/explorer?tab=miners" });
    await screen.findByText("Showing 1-10 of 288");

    await user.type(screen.getByRole("textbox", { name: "Search" }), "HT00101001");

    await waitFor(() => expect(screen.getByText("Showing 1-1 of 1")).toBeTruthy());
    const searched = minersRequests(gateway.requests).filter(
      (request) => request.query.get("search") !== null,
    );
    // Debounced: one request for the whole search, not one per key.
    expect(searched.map((request) => request.query.get("search"))).toEqual(["HT00101001"]);
    expect(searched[0]?.query.get("page")).toBe("1");
  });

  it("shows no footer when no miner matches", async () => {
    const user = userEvent.setup();
    renderExplorer({ initialPath: "/explorer?tab=miners" });
    await screen.findByText("Showing 1-10 of 288");

    await user.type(screen.getByRole("textbox", { name: "Search" }), "zzz");

    await waitFor(() => expect(screen.queryByText(/^Showing/)).toBeNull());
    expect(screen.queryByText("HT00101001")).toBeNull();
  });

  it("asks the miners route for the picked container", async () => {
    const user = userEvent.setup();
    const { gateway } = renderExplorer({ initialPath: "/explorer?tab=miners" });
    await screen.findByText("Showing 1-10 of 288");

    await user.click(screen.getByRole("combobox", { name: "Container" }));
    await user.click(await screen.findByRole("option", { name: "Container 2" }));

    expect(await screen.findByText("Showing 1-10 of 72")).toBeTruthy();
    expect(minersRequests(gateway.requests).at(-1)?.query.get("containerId")).toBe("container-2");
  });

  it("opens a miner's container from its row", async () => {
    const user = userEvent.setup();
    renderExplorer({ initialPath: "/explorer?tab=miners" });
    await screen.findByText("HT00101001");

    const row = bodyRows().find((el) => within(el).queryByText("HT00101001") !== null);
    if (row === undefined) throw new Error("no HT00101001 row");
    await user.click(row);

    expect(screen.getByRole("status", { name: "location" }).textContent).toBe(
      "/explorer/containers/container-1",
    );
  });

  it("shows an error card when the miners cannot load", async () => {
    const gateway = createFakeGateway();
    gateway.fail("/api/miners", 503);
    renderExplorer({ gateway, initialPath: "/explorer?tab=miners" });

    expect(await screen.findByText("Could not load the miners")).toBeTruthy();
    expect(screen.queryByText(/^Showing/)).toBeNull();
  });

  it("exports every rack the filter keeps as CSV", async () => {
    const user = userEvent.setup();
    renderExplorer();
    await screen.findByText("Rack 1-1");
    await user.type(screen.getByRole("textbox", { name: "Search" }), "container 4");
    await waitFor(() => expect(screen.getByText("Showing 1-4 of 4")).toBeTruthy());

    await user.click(screen.getByRole("button", { name: "Export CSV" }));

    const [file, ...others] = await savedFiles();
    expect(others).toHaveLength(0);
    expect(file?.fileName).toBe("racks.csv");
    const lines = file?.text.split("\r\n") ?? [];
    expect(lines[0]).toMatch(
      /^Rack,Container,Efficiency \(.+\),Hash rate \(.+\),Consumption \(.+\)$/,
    );
    expect(lines.slice(1).map((line) => line.split(",").slice(0, 2).join(","))).toEqual([
      "Rack 4-1,Container 4",
      "Rack 4-2,Container 4",
      "Rack 4-3,Container 4",
      "Rack 4-4,Container 4",
    ]);
  });

  it("exports every miner the filter matches, not only the page on screen", async () => {
    const user = userEvent.setup();
    const { gateway } = renderExplorer({ initialPath: "/explorer?tab=miners" });
    await screen.findByText("Showing 1-10 of 288");

    await user.click(screen.getByRole("button", { name: "Export CSV" }));

    await waitFor(() => expect(vi.mocked(saveFile)).toHaveBeenCalledTimes(1));
    const [file] = await savedFiles();
    expect(file?.fileName).toBe("miners.csv");
    const lines = file?.text.split("\r\n") ?? [];
    expect(lines[0]).toMatch(/^Serial,IP,Container,Position,Status,Efficiency/);
    expect(lines).toHaveLength(289);
    expect(lines[1]).toMatch(/^HT00101001,10\.1\.1\.11,Container 1,1-1-1,/);
    const exportPages = minersRequests(gateway.requests)
      .filter((request) => request.query.get("pageSize") === "200")
      .map((request) => request.query.get("page"));
    expect(exportPages).toEqual(["1", "2"]);
    expect(screen.queryByText("Export failed")).toBeNull();
  });

  it("shows an error card when the miners export fails, and clears it on the next try", async () => {
    const user = userEvent.setup();
    const gateway = createFakeGateway();
    let failExport = true;
    gateway.use((request) =>
      failExport && request.path === "/api/miners" && request.query.get("pageSize") === "200"
        ? { kind: "error", status: 500, code: "ERR_TEST_FAILURE" }
        : undefined,
    );
    renderExplorer({ gateway, initialPath: "/explorer?tab=miners" });
    await screen.findByText("Showing 1-10 of 288");

    await user.click(screen.getByRole("button", { name: "Export CSV" }));

    expect(await screen.findByText("Export failed")).toBeTruthy();
    expect(screen.getByText("Could not export the miners. Try again.")).toBeTruthy();
    expect(vi.mocked(saveFile)).not.toHaveBeenCalled();

    failExport = false;
    await user.click(screen.getByRole("button", { name: "Export CSV" }));

    await waitFor(() => expect(vi.mocked(saveFile)).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("Export failed")).toBeNull();
  });
});
