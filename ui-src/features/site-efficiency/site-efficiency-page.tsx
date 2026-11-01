import { EmptyState, ErrorCard, Spinner } from "@tetherto/mdk-react-devkit";

import { Page } from "../../components/page";
import { DISPLAY_UNITS, formatEfficiency, formatPowerMw } from "../../lib/units";
import { ConsumptionBreakdown } from "./consumption-breakdown";
import { KpiTile } from "./kpi-tile";
import { MeterCard } from "./meter-card";
import type { SiteEfficiencyView } from "./site-efficiency-shape";
import { useSiteEfficiency } from "./use-site-efficiency";

const SiteEfficiency = ({ view }: { view: SiteEfficiencyView }) => (
  <div className="op-centre-lite-site-efficiency">
    <div className="op-centre-lite-site-efficiency__kpis">
      <KpiTile
        label="Site efficiency"
        value={formatEfficiency(view.siteEfficiencyWPerThs, DISPLAY_UNITS.EFFICIENCY)}
        hint="Everything the site meter measures, per TH/s"
      />
      <KpiTile
        label="Mining efficiency"
        value={formatEfficiency(view.miningEfficiencyWPerThs, DISPLAY_UNITS.EFFICIENCY)}
        hint="The miners' own power, per TH/s"
      />
      <KpiTile
        label="Total consumption"
        value={formatPowerMw(view.totalPowerMw)}
        hint="The site meter"
      />
    </div>
    {/* Without meters the breakdown would be one "Not metered" slice at 100%. */}
    {view.meters.length === 0 ? (
      <EmptyState
        description="No power meters reported. A container's meter comes from the layout config."
        image="simple"
      />
    ) : (
      <>
        <div className="op-centre-lite-site-efficiency__meters">
          {view.meters.map((meter) => (
            <MeterCard key={meter.id} meter={meter} />
          ))}
        </div>
        <ConsumptionBreakdown slices={view.breakdown} />
      </>
    )}
  </div>
);

/** Site and mining efficiency, each power meter, and how consumption splits between them. */
export const SiteEfficiencyPage = () => {
  const query = useSiteEfficiency();

  return (
    <Page title="Site Efficiency">
      {query.status === "loading" ? <Spinner type="circle" /> : null}
      {query.status === "error" ? (
        <ErrorCard title="Could not load the power meters" error={query.message} />
      ) : null}
      {query.status === "ready" ? <SiteEfficiency view={query.view} /> : null}
    </Page>
  );
};
