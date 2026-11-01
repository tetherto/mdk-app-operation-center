import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tetherto/mdk-react-devkit";
import { useId, useState } from "react";

import type { CommandTarget, PowerMode } from "../../api/contract";
import { POWER_MODE_LABELS } from "../../lib/power-mode";
import { formatPercent } from "../../lib/units";
import { useSiteConfig } from "../site-config/use-site-config";
import { ConfirmPowerDialog } from "./confirm-power-dialog";
import {
  COMMANDS_OFF_MESSAGE,
  POWER_PCT_OPTIONS,
  POWER_TARGET_KINDS,
  type PowerChoice,
} from "./power-commands";
import { usePowerCommand } from "./use-power-command";

// The selects pick a command, they do not hold a value: they always show their
// placeholder, as in Figma, and the current setting is marked in the list.
const NO_VALUE = "";
const CURRENT = " (current)";

type PowerCommandControlsProps = {
  target: CommandTarget;
  /** How the operator knows the target, e.g. "Container 1". */
  targetName: string;
  /** Only these modes are offered: vendors differ. */
  supportedPowerModes: PowerMode[];
  /** The target's mode now; null when its miners are mixed. */
  currentMode: PowerMode | null;
  /** The target's percentage now; null when mixed or unknown. */
  currentPct: number | null;
  className?: string;
};

/**
 * "Set Power Mode" and "Set Power %" for a container or selected miners. A pick
 * asks for confirmation, then sends the command and reports how many miners
 * took it. Both are off while a command is on its way, and on a site with
 * commands disabled (the hosted demo).
 */
export const PowerCommandControls = ({
  target,
  targetName,
  supportedPowerModes,
  currentMode,
  currentPct,
  className,
}: PowerCommandControlsProps) => {
  const config = useSiteConfig();
  const command = usePowerCommand(target, targetName);
  const [pending, setPending] = useState<PowerChoice | undefined>(undefined);
  const commandsOff = config?.commandsEnabled === false;
  // The hint for assistive tech too: a title only shows on mouse hover.
  const hintId = useId();
  const describedBy = commandsOff ? hintId : undefined;
  const disabled = config?.commandsEnabled !== true || command.sending;

  const confirm = (choice: PowerChoice) => {
    setPending(undefined);
    command.send(choice);
  };

  return (
    <div className={className} title={commandsOff ? COMMANDS_OFF_MESSAGE : undefined}>
      <Select
        value={NO_VALUE}
        disabled={disabled || supportedPowerModes.length === 0}
        onValueChange={(mode) => {
          const picked = supportedPowerModes.find((supported) => supported === mode);
          if (picked !== undefined) setPending({ kind: "mode", mode: picked });
        }}
      >
        <SelectTrigger
          aria-label={`Set power mode of ${targetName}`}
          aria-describedby={describedBy}
        >
          <SelectValue placeholder="Set Power Mode" />
        </SelectTrigger>
        <SelectContent>
          {supportedPowerModes.map((mode) => (
            <SelectItem key={mode} value={mode}>
              {POWER_MODE_LABELS[mode]}
              {mode === currentMode ? CURRENT : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={NO_VALUE}
        disabled={disabled}
        onValueChange={(value) => setPending({ kind: "pct", pct: Number(value) })}
      >
        <SelectTrigger
          aria-label={`Set power percentage of ${targetName}`}
          aria-describedby={describedBy}
        >
          <SelectValue placeholder="Set Power %" />
        </SelectTrigger>
        <SelectContent>
          {POWER_PCT_OPTIONS.map((pct) => (
            <SelectItem key={pct} value={String(pct)}>
              {formatPercent(pct)}
              {pct === currentPct ? CURRENT : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {commandsOff ? (
        <span id={hintId} className="op-centre-lite-visually-hidden">
          {COMMANDS_OFF_MESSAGE}
        </span>
      ) : null}
      <ConfirmPowerDialog
        choice={pending}
        targetName={targetName}
        targetKind={
          "containerId" in target ? POWER_TARGET_KINDS.CONTAINER : POWER_TARGET_KINDS.MINERS
        }
        onConfirm={confirm}
        onCancel={() => setPending(undefined)}
      />
    </div>
  );
};
