// @vitest-environment jsdom
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import type { Containers } from "../../api/contract";
import { LIVE_QUERY_KEY } from "../../api/query-keys";
import { createFakeGateway, type FakeGateway } from "../../test-utils/fake-gateway";
import { renderHookWithApp, renderWithApp } from "../../test-utils/render";
import { SiteOverviewPage } from "./site-overview-page";
import { useContainers } from "./use-containers";

// Radix Select reaches for pointer capture and scrolling, which jsdom lacks.
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = () => undefined;
  Element.prototype.scrollIntoView = () => undefined;
});

afterEach(cleanup);

const CONTAINERS: Containers = {
  containers: [
    {
      id: "container-1",
      name: "Container 1",
      model: "MicroBT WhatsMiner M56",
      hashrateThs: 10_000,
      powerW: 200_000,
      minerStatus: { offline: 1, error: 1, sleep: 0, low: 0, normal: 2, high: 0, empty: 4 },
      powerMode: "normal",
      powerPct: 100,
      supportedPowerModes: ["sleep", "low", "normal", "high"],
      envTempC: 24,
      racks: [
        {
          id: "container-1-rack-1",
          name: "Rack 1-1",
          containerId: "container-1",
          hashrateThs: 10_000,
          powerW: 150_000,
          minerStatus: { offline: 1, error: 1, sleep: 0, low: 0, normal: 2, high: 0, empty: 2 },
        },
        {
          id: "container-1-rack-2",
          name: "Rack 1-2",
          containerId: "container-1",
          hashrateThs: 0,
          powerW: 50_000,
          minerStatus: { offline: 0, error: 0, sleep: 0, low: 0, normal: 0, high: 0, empty: 2 },
        },
      ],
    },
  ],
};

const servingContainers = (body: Containers): FakeGateway => {
  const gateway = createFakeGateway();
  gateway.use((request) =>
    request.path === "/api/containers" ? { kind: "json", body } : undefined,
  );
  return gateway;
};

const Location = () => <output aria-label="location">{useLocation().pathname}</output>;

const renderPage = (gateway: FakeGateway) =>
  renderWithApp(
    <>
      <SiteOverviewPage />
      <Location />
    </>,
    { gateway, initialPath: "/app/test/site-overview" },
  );

const location = () => screen.getByRole("status", { name: "location" }).textContent;

describe("SiteOverviewPage", () => {
  it("counts the containers and miners of the mock site", async () => {
    renderPage(createFakeGateway());

    expect(await screen.findByText("4 containers · 288 miners")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /^Container \d$/ })).toHaveLength(4);
  });

  it("shows each container's totals and racks", async () => {
    const { container } = renderPage(servingContainers(CONTAINERS));

    expect(await screen.findByText("1 container · 4 miners")).toBeTruthy();
    const card = container.querySelector(".op-centre-lite-container-card");
    if (!(card instanceof HTMLElement)) throw new Error("no container card");
    expect(within(card).getByText("MicroBT WhatsMiner M56")).toBeTruthy();
    expect(within(card).getByText("200 kW")).toBeTruthy();
    expect(card.querySelector(".op-centre-lite-container-card__metrics")?.textContent).toBe(
      "Efficiency20.00 W/THHash rate10.00 PH/s",
    );

    const rows = [...card.querySelectorAll(".op-centre-lite-rack-table tbody tr")];
    expect(rows.map((row) => row.textContent)).toEqual([
      "Rack 1-115.00 W/TH150 kW10.00 PH/s",
      "Rack 1-2-50 kW0.00 PH/s",
    ]);
  });

  it("opens the container page from its title or a click on the card", async () => {
    const user = userEvent.setup();
    const { container } = renderPage(servingContainers(CONTAINERS));

    await user.click(await screen.findByRole("link", { name: "Container 1" }));
    expect(location()).toBe("/app/test/explorer/containers/container-1");

    cleanup();
    const second = renderPage(servingContainers(CONTAINERS));
    await screen.findByText("1 container · 4 miners");
    const metrics = second.container.querySelector(".op-centre-lite-container-card__metrics");
    if (!(metrics instanceof HTMLElement)) throw new Error("no card metrics");
    await user.click(metrics);
    expect(location()).toBe("/app/test/explorer/containers/container-1");
    expect(container.isConnected).toBe(false);
  });

  it("stays on the page for a click on the power controls", async () => {
    const user = userEvent.setup();
    const { container } = renderPage(servingContainers(CONTAINERS));
    const trigger = await screen.findByRole("combobox", {
      name: "Set power mode of Container 1",
    });
    await waitFor(() => expect(trigger).toHaveProperty("disabled", false));

    await user.click(trigger);
    await user.click(await screen.findByRole("option", { name: "Low" }));
    await user.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Cancel" }),
    );
    const controls = container.querySelector(".op-centre-lite-container-card__controls");
    if (!(controls instanceof HTMLElement)) throw new Error("no controls");
    await user.click(controls);

    expect(location()).toBe("/app/test/site-overview");
  });

  it("shows the error when the containers fail to load", async () => {
    const gateway = createFakeGateway();
    gateway.fail("/api/containers", 501);
    renderPage(gateway);

    expect(await screen.findByText("Could not load the containers")).toBeTruthy();
    expect(
      screen.getByText("This site does not offer /apps/test/api/containers (HTTP 501)."),
    ).toBeTruthy();
  });
});

describe("useContainers", () => {
  it("is loading until the containers arrive", async () => {
    const { result } = renderHookWithApp(useContainers);

    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
  });

  it("keeps the last good cards when a refetch fails", async () => {
    const gateway = servingContainers(CONTAINERS);
    const { result, queryClient } = renderHookWithApp(useContainers, { gateway });
    await waitFor(() => expect(result.current.status).toBe("ready"));

    gateway.fail("/api/containers", 503);
    await queryClient.refetchQueries({ queryKey: [...LIVE_QUERY_KEY, "containers"] });

    const states = queryClient
      .getQueryCache()
      .findAll({ queryKey: [...LIVE_QUERY_KEY, "containers"] })
      .map((query) => query.state.status);
    expect(states).toEqual(["error"]);
    expect(result.current).toMatchObject({ status: "ready", minerCount: 4 });
  });
});
