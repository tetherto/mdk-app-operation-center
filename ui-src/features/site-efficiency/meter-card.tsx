import { Card, Typography } from "@tetherto/mdk-react-devkit";

import {
  DISPLAY_UNITS,
  formatCount,
  formatEfficiency,
  formatHashratePhs,
  formatPowerKw,
} from "../../lib/units";
import type { MeterCard as MeterCardData } from "./site-efficiency-shape";

type MetricProps = { label: string; value: string };

const Metric = ({ label, value }: MetricProps) => (
  <div className="op-centre-lite-meter-card__metric">
    <Typography variant="secondary" size="sm">
      {label}
    </Typography>
    <Typography size="sm" weight="semibold">
      {value}
    </Typography>
  </div>
);

type MeterCardProps = { meter: MeterCardData };

/** One power meter: the efficiency, power and hash rate of the miners behind it. */
export const MeterCard = ({ meter }: MeterCardProps) => (
  <Card className="op-centre-lite-meter-card">
    <Card.Header className="op-centre-lite-meter-card__header">
      <div>
        <Typography size="md" weight="semibold">
          {meter.name}
        </Typography>
        <Typography variant="secondary" size="sm">
          {meter.containerName}
        </Typography>
      </div>
      <Typography color="primary" weight="semibold">
        {/* The page's KPI tiles use W/TH/s; the cards match them on one page. */}
        {formatEfficiency(meter.efficiencyWPerThs, DISPLAY_UNITS.EFFICIENCY)}
      </Typography>
    </Card.Header>
    <Card.Body className="op-centre-lite-meter-card__metrics">
      <Metric label="Power" value={formatPowerKw(meter.powerKw)} />
      <Metric label="Hash rate" value={formatHashratePhs(meter.hashratePhs)} />
      <Metric label="Miners" value={formatCount(meter.miners, "miner")} />
    </Card.Body>
  </Card>
);
