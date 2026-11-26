import { Card, EmptyState, ErrorCard, Spinner, Typography } from "@tetherto/mdk-react-devkit";

import { Page } from "../../components/page";
import { FALLBACK } from "../../lib/constants";
import { DISPLAY_FRACTION_DIGITS, DISPLAY_UNITS, formatFixed } from "../../lib/units";
import { ConsumptionBreakdown } from "./consumption-breakdown";
import { MeterCard } from "./meter-card";
import type { SiteEfficiencyView } from "./site-efficiency-shape";
import { useSiteEfficiency } from "./use-site-efficiency";
import { ValueWithUnit } from "./value-with-unit";

const formatEfficiencyValue = (wPerThs: number | undefined): string =>
  wPerThs === undefined ? FALLBACK : formatFixed(wPerThs, DISPLAY_FRACTION_DIGITS.EFFICIENCY);

type KpiTileProps = { label: string; value: string; unit: string };

/** One headline number: its label, then the value large with its unit small beside it. */
const KpiTile = ({ label, value, unit }: KpiTileProps) => (
  <Card className="op-centre-lite-kpi-tile">
    <Card.Body>
      <Typography variant="secondary" className="op-centre-lite-kpi-tile__label">
        {label}
      </Typography>
      <ValueWithUnit value={value} unit={unit} className="op-centre-lite-kpi-tile__value" />
    </Card.Body>
  </Card>
);

const SiteEfficiency = ({ view }: { view: SiteEfficiencyView }) => (
  <div className="op-centre-lite-site-efficiency">
    <div className="op-centre-lite-site-efficiency__kpis">
      <KpiTile
        label="Site efficiency"
        value={formatEfficiencyValue(view.siteEfficiencyWPerThs)}
        unit={DISPLAY_UNITS.EFFICIENCY_CARD}
      />
      <KpiTile
        label="Mining efficiency"
        value={formatEfficiencyValue(view.miningEfficiencyWPerThs)}
        unit={DISPLAY_UNITS.EFFICIENCY_CARD}
      />
      <KpiTile
        label="Total consumption"
        value={formatFixed(view.totalPowerMw, DISPLAY_FRACTION_DIGITS.POWER)}
        unit={DISPLAY_UNITS.POWER}
      />
    </div>
    {/* Without meters the breakdown would be one "Not metered" slice at 100%. */}
    {view.meters.length === 0 ? (
      <EmptyState description="No power meter readings for this site." image="simple" />
    ) : (
      <>
        <section className="op-centre-lite-site-efficiency__section">
          <Typography variant="heading3" className="op-centre-lite-site-efficiency__heading">
            Efficiency per power meter
          </Typography>
          <div className="op-centre-lite-site-efficiency__meters">
            {view.meters.map((meter) => (
              <MeterCard key={meter.id} meter={meter} />
            ))}
          </div>
        </section>
        <section className="op-centre-lite-site-efficiency__section">
          <Typography variant="heading3" className="op-centre-lite-site-efficiency__heading">
            Consumption breakdown
          </Typography>
          <ConsumptionBreakdown slices={view.breakdown} rows={view.breakdownRows} />
        </section>
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
