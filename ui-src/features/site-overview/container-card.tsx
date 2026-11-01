import { Card, MinersActivityChart, Typography } from "@tetherto/mdk-react-devkit";
import type { MouseEvent } from "react";
import { Link, useNavigate } from "react-router";

import { containerDetailLink } from "../../app-routes";
import { formatEfficiency, formatHashratePhs, formatPowerKw } from "../../lib/units";
import { PowerCommandControls } from "../commands/power-command-controls";
import type { ContainerCard as ContainerCardData } from "./container-card-shape";
import { RackTable } from "./rack-table";

type MetricProps = { label: string; value: string };

const Metric = ({ label, value }: MetricProps) => (
  <div className="op-centre-lite-container-card__metric">
    <Typography variant="secondary" size="sm">
      {label}
    </Typography>
    <Typography size="sm" weight="semibold">
      {value}
    </Typography>
  </div>
);

/**
 * Clicks the card handles itself: on the card, not on a link (it navigates on
 * its own) or a control. React passes clicks in portals (the confirmation
 * dialog, a select's list) up through the card too, so those are left out.
 */
const isCardSurfaceClick = (event: MouseEvent<HTMLElement>): boolean =>
  event.target instanceof Element &&
  event.currentTarget.contains(event.target) &&
  event.target.closest("a, button, [role='combobox']") === null;

type ContainerCardProps = { card: ContainerCardData };

/**
 * One container on Site Overview: totals, power controls, racks and miner status
 * counts. The title links to the container's detail page; a click anywhere else
 * on the card (outside the controls) opens it too.
 */
export const ContainerCard = ({ card }: ContainerCardProps) => {
  const navigate = useNavigate();
  const detailLink = containerDetailLink(card.id);
  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    if (isCardSurfaceClick(event)) void navigate(detailLink, { relative: "path" });
  };

  return (
    // The title link is the keyboard and screen reader path to the detail page;
    // the card click is a larger mouse target for the same link.
    <Card className="op-centre-lite-container-card" onClick={handleCardClick}>
      <Card.Header className="op-centre-lite-container-card__header">
        <div>
          <Link className="op-centre-lite-container-card__title" to={detailLink} relative="path">
            <Typography size="md" weight="semibold">
              {card.name}
            </Typography>
          </Link>
          <Typography variant="secondary" size="sm">
            {card.model}
          </Typography>
        </div>
        <Typography color="primary" weight="semibold">
          {formatPowerKw(card.powerKw)}
        </Typography>
      </Card.Header>
      <Card.Body className="op-centre-lite-container-card__body">
        <PowerCommandControls
          className="op-centre-lite-container-card__controls"
          target={{ containerId: card.id }}
          targetName={card.name}
          supportedPowerModes={card.power.supportedModes}
          currentMode={card.power.mode}
          currentPct={card.power.pct}
        />
        <div className="op-centre-lite-container-card__metrics">
          <Metric label="Efficiency" value={formatEfficiency(card.efficiencyWPerThs)} />
          <Metric label="Hash rate" value={formatHashratePhs(card.hashratePhs)} />
        </div>
        <RackTable racks={card.racks} />
        <MinersActivityChart data={card.statusCounts} variant="tiles" />
      </Card.Body>
    </Card>
  );
};
