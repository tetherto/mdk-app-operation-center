import {
  ErrorCard,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@tetherto/mdk-react-devkit";
import { Link, useNavigate, useParams } from "react-router";

import {
  CONTAINER_TABS,
  type ContainerTab,
  FROM_CONTAINER_DETAIL,
  isContainerTab,
} from "../../app-routes";
import { HostedDemoBanner } from "../../components/hosted-demo-banner";
import { Page } from "../../components/page";
import { formatCount } from "../../lib/units";
import { ChartsTab } from "./charts-tab";
import { HeatmapTab } from "./heatmap-tab";
import { LayoutTab } from "./layout-tab";
import { PowerAdjustmentTab } from "./power-adjustment-tab";
import type { LayoutView } from "./layout-shape";
import { useActiveTabInView } from "./use-active-tab-in-view";
import { useContainerLayout } from "./use-container-layout";

// The tabs Figma shows; the ones not built yet are visible but off.
const TAB_TRIGGERS: { tab: ContainerTab; label: string; ready: boolean }[] = [
  { tab: CONTAINER_TABS.LAYOUT, label: "Layout", ready: true },
  { tab: CONTAINER_TABS.POWER_ADJUSTMENT, label: "Power Adjustment", ready: true },
  { tab: CONTAINER_TABS.CHARTS, label: "Charts", ready: true },
  { tab: CONTAINER_TABS.HEATMAP, label: "Heatmap", ready: true },
];

/**
 * The tab the URL asks for, if it is built: Layout for anything else, so a
 * link to a tab that ships later (`.../heatmap`) still shows a page.
 */
const readyTabOf = (tab: string | undefined): ContainerTab =>
  TAB_TRIGGERS.find((trigger) => trigger.ready && isContainerTab(tab) && trigger.tab === tab)
    ?.tab ?? CONTAINER_TABS.LAYOUT;

/** What the container is, as the design's header line reads: "MicroBT WhatsMiner M56S · 702 miners". */
const metaOf = ({ container }: LayoutView): string =>
  `${container.model} · ${formatCount(container.minerCount, "miner")}`;

/** One container: its layout, power adjustment, charts and heatmap, one tab each. */
export const ContainerDetailPage = () => {
  const { id = "", tab } = useParams();
  const navigate = useNavigate();
  const view = useContainerLayout(id);
  const activeTab = readyTabOf(tab);
  const tabListRef = useActiveTabInView(activeTab, view.status === "ready");

  const handleTabChange = (next: string) => {
    if (isContainerTab(next)) {
      void navigate(FROM_CONTAINER_DETAIL.tab(id, next), { relative: "route", replace: true });
    }
  };

  const back = (
    <Link
      className="op-centre-lite-detail__back"
      to={FROM_CONTAINER_DETAIL.siteOverview}
      relative="route"
    >
      Site Overview
    </Link>
  );

  if (view.status !== "ready") {
    return (
      <Page title={id} subtitle={back} className="op-centre-lite-detail">
        {view.status === "loading" ? <Spinner type="circle" /> : null}
        {view.status === "not-found" ? (
          <ErrorCard title="Container not found" error={`This site has no container "${id}".`} />
        ) : null}
        {view.status === "error" ? (
          <ErrorCard title="Could not load the container" error={view.message} />
        ) : null}
      </Page>
    );
  }

  return (
    <Page
      title={view.layout.container.name}
      subtitle={back}
      actions={<span className="op-centre-lite-detail__meta">{metaOf(view.layout)}</span>}
      className="op-centre-lite-detail"
      demoNotice="page"
    >
      <Tabs variant="underline" value={activeTab} onValueChange={handleTabChange}>
        <TabsList ref={tabListRef} className="op-centre-lite-tabs">
          {TAB_TRIGGERS.map(({ tab: value, label, ready }) => (
            <TabsTrigger key={value} value={value} disabled={!ready}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <HostedDemoBanner />
        <TabsContent value={CONTAINER_TABS.LAYOUT}>
          <LayoutTab layout={view.layout} />
        </TabsContent>
        <TabsContent value={CONTAINER_TABS.HEATMAP}>
          <HeatmapTab layout={view.layout} />
        </TabsContent>
        <TabsContent value={CONTAINER_TABS.POWER_ADJUSTMENT}>
          <PowerAdjustmentTab layout={view.layout} />
        </TabsContent>
        <TabsContent value={CONTAINER_TABS.CHARTS}>
          <ChartsTab layout={view.layout} />
        </TabsContent>
      </Tabs>
    </Page>
  );
};
