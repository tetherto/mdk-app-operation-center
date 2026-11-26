// @vitest-environment jsdom
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithApp } from "../../test-utils/render";
import type { HistoryView } from "../history/use-history";
import { DashboardPage } from "./dashboard-page";

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

afterEach(cleanup);

describe("DashboardPage", () => {
  it("renders the hash rate and power charts over the live window", async () => {
    renderWithApp(<DashboardPage />);

    expect(screen.getByText("Dashboard")).toBeTruthy();
    // Waits for both reads, so nothing is still rendering when the test ends.
    expect(await screen.findByText("Hash Rate: ready by HH:mm")).toBeTruthy();
    expect(await screen.findByText("Power Consumption: ready by HH:mm")).toBeTruthy();
  });
});
