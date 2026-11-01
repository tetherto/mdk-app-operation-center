// The app's UI entry, built to ../ui/index.js (`npm run build:ui`). The dashboard
// imports it and mounts its pages under /app/<name>/ and its panels on Home.
import { defineMdkApp, MDK_APP_PANEL_SLOT } from "@tetherto/mdk-react-adapter";

import { APP_PATHS } from "./app-routes";
import { ContainerDetailPage } from "./features/container-detail/container-detail-page";
import { DashboardPage } from "./features/dashboard/dashboard-page";
import { ExplorerPage } from "./features/explorer/explorer-page";
import { SiteEfficiencyPage } from "./features/site-efficiency/site-efficiency-page";
import { SiteOverviewPage } from "./features/site-overview/site-overview-page";
import { SiteSummaryHomePanel } from "./features/site-summary/site-summary-home-panel";
import "./styles.css";

export default defineMdkApp({
  // Must equal `id` in mdk-app.yaml: the dashboard refuses a mismatch.
  id: "io.tether.opcentrelite",
  displayName: "Operation Center Lite",
  routes: [
    { path: APP_PATHS.DASHBOARD, label: "Dashboard", component: DashboardPage },
    { path: APP_PATHS.SITE_OVERVIEW, label: "Site Overview", component: SiteOverviewPage },
    { path: APP_PATHS.SITE_EFFICIENCY, label: "Site Efficiency", component: SiteEfficiencyPage },
    { path: APP_PATHS.EXPLORER, label: "Explorer", component: ExplorerPage },
    { path: APP_PATHS.CONTAINER_DETAIL, hidden: true, component: ContainerDetailPage },
  ],
  panels: [
    {
      id: "site-summary",
      slot: MDK_APP_PANEL_SLOT.HOME,
      title: "Operation Center Lite",
      component: SiteSummaryHomePanel,
    },
  ],
});
