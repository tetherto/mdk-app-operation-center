import { Card, Typography } from "@tetherto/mdk-react-devkit";

import { FALLBACK } from "../../lib/constants";
import {
  DISPLAY_FRACTION_DIGITS,
  DISPLAY_UNITS,
  formatFixed,
  formatHashratePhs,
  formatPowerKw,
} from "../../lib/units";
import type { MeterCard as MeterCardData } from "./site-efficiency-shape";
import { ValueWithUnit } from "./value-with-unit";

type MetricProps = { label: string; value: string };

const Metric = ({ label, value }: MetricProps) => (
  <div className="op-centre-lite-meter-card__metric">
    <span className="op-centre-lite-meter-card__metric-label">{label}</span>
    <span className="op-centre-lite-meter-card__metric-value">{value}</span>
  </div>
);

type MeterCardProps = { meter: MeterCardData };

/**
 * One power meter: its colour (the same as its breakdown slice), the container
 * it measures, the efficiency of the miners behind it, then their power, hash
 * rate and count.
 */
export const MeterCard = ({ meter }: MeterCardProps) => (
  <Card className="op-centre-lite-meter-card">
    <Card.Header className="op-centre-lite-meter-card__header">
      <span className="op-centre-lite-meter-card__name">
        <span
          className="op-centre-lite-series-swatch"
          data-series={meter.colorIndex}
          aria-hidden="true"
        />
        <Typography size="sm" weight="medium">
          {meter.name}
        </Typography>
      </span>
      <Typography variant="secondary" size="xs">
        {meter.containerName}
      </Typography>
    </Card.Header>
    <Card.Body className="op-centre-lite-meter-card__efficiency">
      <Typography variant="secondary" size="xs">
        Efficiency
      </Typography>
      <ValueWithUnit
        value={
          meter.efficiencyWPerThs === undefined
            ? FALLBACK
            : formatFixed(meter.efficiencyWPerThs, DISPLAY_FRACTION_DIGITS.EFFICIENCY)
        }
        unit={DISPLAY_UNITS.EFFICIENCY_CARD}
        className="op-centre-lite-meter-card__efficiency-value"
      />
    </Card.Body>
    <Card.Body className="op-centre-lite-meter-card__metrics">
      <Metric label="Power" value={formatPowerKw(meter.powerKw)} />
      <Metric label="Hash rate" value={formatHashratePhs(meter.hashratePhs)} />
      <Metric label="Miners" value={formatFixed(meter.miners, 0)} />
    </Card.Body>
  </Card>
);
