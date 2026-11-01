import { ErrorCard, Spinner } from "@tetherto/mdk-react-devkit";

import { Page } from "../../components/page";
import { formatCount } from "../../lib/units";
import { ContainerCard } from "./container-card";
import { type ContainersView, useContainers } from "./use-containers";

const subtitleOf = (view: ContainersView): string | undefined => {
  if (view.status !== "ready") return undefined;
  return `${formatCount(view.cards.length, "container")} · ${formatCount(view.minerCount, "miner")}`;
};

/** Every container as a card with its racks and miner status counts. */
export const SiteOverviewPage = () => {
  const view = useContainers();

  return (
    <Page title="Site Overview" subtitle={subtitleOf(view)}>
      {view.status === "loading" ? <Spinner type="circle" /> : null}
      {view.status === "error" ? (
        <ErrorCard title="Could not load the containers" error={view.message} />
      ) : null}
      {view.status === "ready" ? (
        <div className="op-centre-lite-site-overview">
          {view.cards.map((card) => (
            <ContainerCard key={card.id} card={card} />
          ))}
        </div>
      ) : null}
    </Page>
  );
};
