import { checkAppUiModule, MDK_APP_PANEL_SLOT } from "@tetherto/mdk-react-adapter";
import { describe, expect, it } from "vitest";

import { APP_PATHS } from "./app-routes";
import { ContainerDetailPage } from "./features/container-detail/container-detail-page";
import { DashboardPage } from "./features/dashboard/dashboard-page";
import { SiteSummaryHomePanel } from "./features/site-summary/site-summary-home-panel";
import * as entry from "./index";

const app = entry.default;

const INSTALLED = {
  name: "op-centre-lite",
  id: "io.tether.opcentrelite",
  version: "0.0.0",
  displayName: "Operation Center Lite",
  apiBase: "/apps/op-centre-lite",
  ui: null,
};

describe("the app's UI module", () => {
  it("passes the dashboard's module check", () => {
    expect(checkAppUiModule(INSTALLED, entry)).toMatchObject(app);
  });

  it("has the id the manifest declares", () => {
    expect(app.id).toBe("io.tether.opcentrelite");
    expect(app.displayName).toBe("Operation Center Lite");
  });

  it("registers every page path once, with the detail page as a hidden deep link", () => {
    const routes = app.routes ?? [];
    const byName = (a: string, b: string) => a.localeCompare(b);
    expect(routes.map((route) => route.path).sort(byName)).toEqual(
      Object.values(APP_PATHS).sort(byName),
    );
    expect(routes.find((route) => route.path === APP_PATHS.DASHBOARD)?.component).toBe(
      DashboardPage,
    );
    const detail = routes.find((route) => route.path === APP_PATHS.CONTAINER_DETAIL);
    expect(detail?.component).toBe(ContainerDetailPage);
    expect(detail?.hidden).toBe(true);
    const unlisted = routes
      .filter((route) => route !== detail && (route.hidden === true || !route.label))
      .map((route) => route.path);
    expect(unlisted).toEqual([]);
  });

  it("puts the site summary on Home", () => {
    expect(app.panels).toEqual([
      expect.objectContaining({
        id: "site-summary",
        slot: MDK_APP_PANEL_SLOT.HOME,
        component: SiteSummaryHomePanel,
      }),
    ]);
  });
});
