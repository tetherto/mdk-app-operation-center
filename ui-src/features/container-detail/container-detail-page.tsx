import {
  Button,
  ErrorCard,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@tetherto/mdk-react-devkit";
import { useLocation, useNavigate, useParams } from "react-router";

import {
  CONTAINER_TABS,
  type ContainerTab,
  FROM_CONTAINER_DETAIL,
  isContainerTab,
} from "../../app-routes";
import { Page } from "../../components/page";
import { formatEfficiency, formatHashratePhs, formatPowerKw } from "../../lib/units";
import { ChartsTab } from "./charts-tab";
import { HeatmapTab } from "./heatmap-tab";
import { LayoutTab } from "./layout-tab";
import { PowerAdjustmentTab } from "./power-adjustment-tab";
import type { LayoutView } from "./layout-shape";
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

// React Router gives the first entry of a session this key: there is no page to go back to.
const FIRST_ENTRY_KEY = "default";

const subtitleOf = ({ container }: LayoutView): string =>
  [
    container.model,
    formatHashratePhs(container.hashratePhs),
    formatPowerKw(container.powerKw),
    formatEfficiency(container.efficiencyWPerThs),
  ].join(" · ");

/** One container: its layout, power adjustment, charts and heatmap, one tab each. */
export const ContainerDetailPage = () => {
  const { id = "", tab } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const view = useContainerLayout(id);
  const activeTab = readyTabOf(tab);

  // Back to where the operator came from (Site Overview or Explorer); Explorer
  // when the page was opened directly.
  const goBack = () => {
    if (location.key === FIRST_ENTRY_KEY) {
      void navigate(FROM_CONTAINER_DETAIL.explorer, { relative: "route" });
    } else {
      void navigate(-1);
    }
  };

  const handleTabChange = (next: string) => {
    if (isContainerTab(next)) {
      void navigate(FROM_CONTAINER_DETAIL.tab(id, next), { relative: "route", replace: true });
    }
  };

  const back = (
    <Button variant="secondary" size="sm" onClick={goBack}>
      Back
    </Button>
  );

  if (view.status !== "ready") {
    return (
      <Page title={id} actions={back}>
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
    <Page title={view.layout.container.name} subtitle={subtitleOf(view.layout)} actions={back}>
      <Tabs variant="underline" value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          {TAB_TRIGGERS.map(({ tab: value, label, ready }) => (
            <TabsTrigger key={value} value={value} disabled={!ready}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
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
