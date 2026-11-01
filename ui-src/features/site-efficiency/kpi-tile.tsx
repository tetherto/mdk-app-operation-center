import { Card, Typography } from "@tetherto/mdk-react-devkit";

type KpiTileProps = { label: string; value: string; hint: string };

/** One headline number of the page, with what it measures. */
export const KpiTile = ({ label, value, hint }: KpiTileProps) => (
  <Card className="op-centre-lite-kpi">
    <Card.Body className="op-centre-lite-kpi__body">
      <Typography variant="secondary" size="sm">
        {label}
      </Typography>
      <Typography size="lg" weight="semibold" color="primary">
        {value}
      </Typography>
      <Typography variant="secondary" size="sm">
        {hint}
      </Typography>
    </Card.Body>
  </Card>
);
