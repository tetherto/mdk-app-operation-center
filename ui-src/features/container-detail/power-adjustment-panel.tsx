import { Button, Input, Slider } from "@tetherto/mdk-react-devkit";

import { formatCount, formatPercent } from "../../lib/units";
import { ConfirmPowerDialog } from "../commands/confirm-power-dialog";
import { COMMANDS_OFF_MESSAGE, POWER_TARGET_KINDS } from "../commands/power-commands";
import { type LayoutView, socketStateOf } from "./layout-shape";
import { PCT_MAX, PCT_MIN, PCT_TICKS, selectionByRack } from "./power-adjustment-shape";
import { PanelHint, PanelSection } from "./side-panel";
import { usePowerAdjustment } from "./use-power-adjustment";
import type { PowerSelection } from "./use-power-selection";

type PowerAdjustmentPanelProps = { layout: LayoutView; selection: PowerSelection };

/**
 * The side panel's power controls: a number field and a 0-200% slider kept in
 * step, Apply with a confirmation, then the picked sockets by rack.
 */
export const PowerAdjustmentPanel = ({ layout, selection }: PowerAdjustmentPanelProps) => {
  const adjustment = usePowerAdjustment(selection);
  const count = selection.miners.length;
  const groups = selectionByRack(layout, selection.ids);

  return (
    <>
      <PanelSection title="Power Controls">
        <label className="op-centre-lite-power-panel__field">
          <span>Manual Input</span>
          <Input
            type="number"
            min={PCT_MIN}
            max={PCT_MAX}
            value={adjustment.fieldText}
            onChange={(event) => adjustment.onFieldChange(event.target.value)}
            onBlur={adjustment.onFieldBlur}
            suffix="%"
            wrapperClassName="op-centre-lite-power-panel__input"
          />
        </label>
        <Slider.Root
          className="op-centre-lite-slider"
          min={PCT_MIN}
          max={PCT_MAX}
          step={1}
          value={[adjustment.pct]}
          onValueChange={([next]) => adjustment.onSlide(next ?? adjustment.pct)}
        >
          <Slider.Track className="op-centre-lite-slider__track">
            <Slider.Range className="op-centre-lite-slider__range" />
          </Slider.Track>
          <Slider.Thumb className="op-centre-lite-slider__thumb" aria-label="Power percentage" />
        </Slider.Root>
        <div className="op-centre-lite-slider__ticks" aria-hidden="true">
          {PCT_TICKS.map((tick) => (
            <span key={tick}>{formatPercent(tick)}</span>
          ))}
        </div>
        <Button
          variant="primary"
          className="op-centre-lite-power-panel__apply"
          disabled={!adjustment.canApply}
          loading={adjustment.sending}
          onClick={adjustment.onApply}
        >
          Apply
        </Button>
        {adjustment.commandsOff ? <PanelHint>{COMMANDS_OFF_MESSAGE}</PanelHint> : null}
      </PanelSection>
      <PanelSection
        title={`Selected ${formatCount(count, "socket")} from ${layout.container.name}`}
      >
        {groups.length === 0 ? (
          <PanelHint>Pick sockets on the grid (offline ones cannot be picked).</PanelHint>
        ) : (
          groups.map((group) => (
            <div key={group.rack} className="op-centre-lite-power-panel__rack">
              <span>{group.rack}</span>
              <ul className="op-centre-lite-power-panel__chips">
                {group.miners.map((miner) => (
                  <li key={miner.id} className="op-centre-lite-power-panel__chip">
                    <span
                      className="op-centre-lite-power-panel__dot"
                      data-state={socketStateOf(miner)}
                      aria-hidden="true"
                    />
                    Socket: {miner.position}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </PanelSection>
      <ConfirmPowerDialog
        choice={adjustment.pending}
        targetName={adjustment.name}
        targetKind={POWER_TARGET_KINDS.MINERS}
        onConfirm={adjustment.onConfirm}
        onCancel={adjustment.onCancel}
      />
    </>
  );
};
