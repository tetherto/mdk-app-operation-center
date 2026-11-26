// @vitest-environment jsdom
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { PowerMeters } from "../../api/contract";
import { LIVE_QUERY_KEY } from "../../api/query-keys";
import { createFakeGateway, type FakeGateway } from "../../test-utils/fake-gateway";
import { renderHookWithApp, renderWithApp } from "../../test-utils/render";
import { SiteEfficiencyPage } from "./site-efficiency-page";
import { useSiteEfficiency } from "./use-site-efficiency";

afterEach(cleanup);

const METERS: PowerMeters = {
  siteMeterPowerW: 1_000_000,
  minersPowerW: 900_000,
  hashrateThs: 50_000,
  meters: [
    {
      id: "PM-01",
      name: "PM-01",
      containerId: "container-1",
      powerW: 400_000,
      hashrateThs: 20_000,
      miners: 72,
    },
    {
      id: "PM-02",
      name: "PM-02",
      containerId: "container-2",
      powerW: 300_000,
      hashrateThs: 0,
      miners: 0,
    },
  ],
};

const servingMeters = (body: PowerMeters): FakeGateway => {
  const gateway = createFakeGateway();
  gateway.use((request) =>
    request.path === "/api/power-meters" ? { kind: "json", body } : undefined,
  );
  return gateway;
};

describe("SiteEfficiencyPage", () => {
  it("shows a spinner, then the KPIs, each meter and the breakdown", async () => {
    const { container } = renderWithApp(<SiteEfficiencyPage />, {
      gateway: servingMeters(METERS),
    });

    expect(screen.getByText("Site Efficiency")).toBeTruthy();
    expect(container.querySelector(".op-centre-lite-site-efficiency")).toBeNull();

    expect(await screen.findByText("Efficiency per power meter")).toBeTruthy();
    expect(screen.getByText("Consumption breakdown")).toBeTruthy();

    const kpis = container.querySelectorAll(".op-centre-lite-kpi-tile");
    expect([...kpis].map((tile) => tile.textContent)).toEqual([
      "Site efficiency20.00W/TH",
      "Mining efficiency18.00W/TH",
      "Total consumption1.000MW",
    ]);

    const cards = [...container.querySelectorAll<HTMLElement>(".op-centre-lite-meter-card")];
    expect(cards).toHaveLength(2);
    const [first, second] = cards;
    if (first === undefined || second === undefined) throw new Error("no meter cards");
    // Containers are named once the shared containers read loads.
    await waitFor(() => expect(within(first).getByText("Container 1")).toBeTruthy());
    expect(within(first).getByText("20.00")).toBeTruthy();
    expect(within(first).getByText("72")).toBeTruthy();
    // A meter whose miners hash nothing has no efficiency.
    expect(second.querySelector(".op-centre-lite-meter-card__efficiency-value")?.textContent).toBe(
      "-W/TH",
    );

    const bar = screen.getByRole("img", { name: "Share of consumption per meter" });
    const segments = [...bar.querySelectorAll(".op-centre-lite-breakdown__segment")];
    expect(segments.map((segment) => segment.getAttribute("title"))).toEqual([
      "PM-01: 40.00%",
      "PM-02: 30.00%",
      "Not metered: 30.00%",
    ]);
    expect(segments.map((segment) => segment.getAttribute("data-series"))).toEqual([
      "0",
      "1",
      "rest",
    ]);

    const rows = [...container.querySelectorAll(".op-centre-lite-breakdown__table tbody tr")];
    expect(rows.map((row) => row.textContent)).toEqual([
      "Site meter (total)1,000.00100.00%",
      "PM-01 · Container 1400.0040.00%",
      "PM-02 · Container 2300.0030.00%",
      "Not metered300.0030.00%",
    ]);
    expect(
      container.querySelector(".op-centre-lite-breakdown__source[data-total='true']")?.textContent,
    ).toBe("Site meter (total)");
  });

  it("names meters by container id until the containers read loads", async () => {
    const gateway = servingMeters(METERS);
    gateway.fail("/api/containers", 500);
    renderWithApp(<SiteEfficiencyPage />, { gateway });

    expect(await screen.findByText("PM-01 · container-1")).toBeTruthy();
  });

  it("shows an empty state for a site without power meters", async () => {
    renderWithApp(<SiteEfficiencyPage />, {
      gateway: servingMeters({ ...METERS, hashrateThs: 0, meters: [] }),
    });

    expect(await screen.findByText("No power meter readings for this site.")).toBeTruthy();
    expect(screen.queryByText("Consumption breakdown")).toBeNull();
    expect(screen.getAllByText("-")).toHaveLength(2);
  });

  it("shows the error when the power meters fail to load", async () => {
    const gateway = createFakeGateway();
    gateway.fail("/api/power-meters", 404);
    renderWithApp(<SiteEfficiencyPage />, { gateway });

    expect(await screen.findByText("Could not load the power meters")).toBeTruthy();
    expect(
      screen.getByText(
        "Nothing serves /apps/test/api/power-meters (HTTP 404). Is the app's backend running?",
      ),
    ).toBeTruthy();
  });
});

describe("useSiteEfficiency", () => {
  it("keeps the last good readings when a refetch fails", async () => {
    const gateway = servingMeters(METERS);
    const { result, queryClient } = renderHookWithApp(useSiteEfficiency, { gateway });
    await waitFor(() => expect(result.current.status).toBe("ready"));

    gateway.fail("/api/power-meters", 503);
    await queryClient.refetchQueries({ queryKey: [...LIVE_QUERY_KEY, "power-meters"] });

    const states = queryClient
      .getQueryCache()
      .findAll({ queryKey: [...LIVE_QUERY_KEY, "power-meters"] })
      .map((query) => query.state.status);
    expect(states).toEqual(["error"]);
    expect(result.current.status).toBe("ready");
  });
});
