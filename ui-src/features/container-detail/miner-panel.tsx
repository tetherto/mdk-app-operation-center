import { Button, Card, Typography } from "@tetherto/mdk-react-devkit";

import type { ReactNode } from "react";

import type { Miner } from "../../api/contract";
import { toMinerDetails } from "./layout-shape";

type MinerPanelProps = {
  miner: Miner;
  onClose: VoidFunction;
  /** Controls shown above the readings (the Heatmap tab's commands and log download). */
  actions?: ReactNode;
};

/** The selected miner's readings next to the grid. */
export const MinerPanel = ({ miner, onClose, actions }: MinerPanelProps) => (
  <Card className="op-centre-lite-miner-panel" aria-label={`Miner ${miner.serial}`}>
    <Card.Header className="op-centre-lite-miner-panel__header">
      <Typography size="md" weight="semibold">
        {miner.serial}
      </Typography>
      <Button variant="secondary" size="sm" onClick={onClose}>
        Close
      </Button>
    </Card.Header>
    <Card.Body className="op-centre-lite-miner-panel__body">
      {actions === undefined ? null : (
        <div className="op-centre-lite-miner-panel__actions">{actions}</div>
      )}
      <dl className="op-centre-lite-miner-panel__details">
        {toMinerDetails(miner).map(({ label, value }) => (
          <div key={label} className="op-centre-lite-miner-panel__row">
            <dt>
              <Typography variant="secondary" size="sm">
                {label}
              </Typography>
            </dt>
            <dd>
              <Typography size="sm">{value}</Typography>
            </dd>
          </div>
        ))}
      </dl>
    </Card.Body>
  </Card>
);
