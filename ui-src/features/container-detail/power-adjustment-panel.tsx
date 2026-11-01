import { Button, Card, Input, Slider, Typography } from "@tetherto/mdk-react-devkit";

import { FALLBACK } from "../../lib/constants";
import { formatPercent } from "../../lib/units";
import { ConfirmPowerDialog } from "../commands/confirm-power-dialog";
import { COMMANDS_OFF_MESSAGE, POWER_TARGET_KINDS } from "../commands/power-commands";
import { PCT_MAX, PCT_MIN } from "./power-adjustment-shape";
import { usePowerAdjustment } from "./use-power-adjustment";
import type { PowerSelection } from "./use-power-selection";

const PICK_PROMPT = "Pick miners on the grid (offline ones cannot be picked).";

type PowerAdjustmentPanelProps = { selection: PowerSelection };

/**
 * The power percentage of the picked miners: a slider and a number field kept
 * in step, Apply with a confirmation, and Select all / Deselect all.
 */
export const PowerAdjustmentPanel = ({ selection }: PowerAdjustmentPanelProps) => {
  const adjustment = usePowerAdjustment(selection);
  const count = selection.miners.length;

  return (
    <Card className="op-centre-lite-power-panel">
      <Card.Header>
        <Typography size="md" weight="semibold">
          Power adjustment
        </Typography>
      </Card.Header>
      <Card.Body className="op-centre-lite-power-panel__body">
        <Typography size="sm">
          {count === 0 ? PICK_PROMPT : `${adjustment.name} selected`}
        </Typography>
        <div className="op-centre-lite-power-panel__selection">
          <Button
            variant="secondary"
            size="sm"
            disabled={count === selection.selectableCount}
            onClick={selection.onSelectAll}
          >
            Select all
          </Button>
          <Button variant="secondary" size="sm" disabled={count === 0} onClick={selection.onClear}>
            Deselect all
          </Button>
        </div>
        <Typography variant="secondary" size="sm">
          Current power:{" "}
          {adjustment.sharedPct === null ? FALLBACK : formatPercent(adjustment.sharedPct)}
        </Typography>
        <div className="op-centre-lite-power-panel__value">
          <Slider.Root
            className="op-centre-lite-slider"
            min={PCT_MIN}
            max={PCT_MAX}
            step={1}
            value={[adjustment.pct]}
            onValueChange={([next]) => adjustment.onSlide(next ?? PCT_MAX)}
          >
            <Slider.Track className="op-centre-lite-slider__track">
              <Slider.Range className="op-centre-lite-slider__range" />
            </Slider.Track>
            <Slider.Thumb className="op-centre-lite-slider__thumb" aria-label="Power percentage" />
          </Slider.Root>
          <Input
            type="number"
            aria-label="Power percentage value"
            min={PCT_MIN}
            max={PCT_MAX}
            value={adjustment.fieldText}
            onChange={(event) => adjustment.onFieldChange(event.target.value)}
            onBlur={adjustment.onFieldBlur}
            suffix="%"
            wrapperClassName="op-centre-lite-power-panel__input"
          />
        </div>
        <Button
          variant="primary"
          disabled={!adjustment.canApply}
          loading={adjustment.sending}
          onClick={adjustment.onApply}
        >
          Apply {formatPercent(adjustment.pct)}
        </Button>
        {adjustment.commandsOff ? (
          <Typography variant="secondary" size="sm">
            {COMMANDS_OFF_MESSAGE}
          </Typography>
        ) : null}
      </Card.Body>
      <ConfirmPowerDialog
        choice={adjustment.pending}
        targetName={adjustment.name}
        targetKind={POWER_TARGET_KINDS.MINERS}
        onConfirm={adjustment.onConfirm}
        onCancel={adjustment.onCancel}
      />
    </Card>
  );
};
