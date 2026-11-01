import { useState } from "react";

import type { Miner } from "../../api/contract";
import type { PowerChoice } from "../commands/power-commands";
import { usePowerCommand } from "../commands/use-power-command";
import { useSiteConfig } from "../site-config/use-site-config";
import {
  clampPct,
  PCT_MAX,
  parsePctInput,
  selectionNameOf,
  sharedPctOf,
} from "./power-adjustment-shape";
import type { PowerSelection } from "./use-power-selection";

export type PowerAdjustment = {
  /** The percentage Apply sends. */
  pct: number;
  onSlide: (pct: number) => void;
  /** The number field's text: what the operator is typing, else the percentage. */
  fieldText: string;
  onFieldChange: (text: string) => void;
  onFieldBlur: VoidFunction;
  /** How the panel and the confirmation name the picked miners. */
  name: string;
  /** The percentage the picked miners share; null when they differ or none is picked. */
  sharedPct: number | null;
  canApply: boolean;
  commandsOff: boolean;
  sending: boolean;
  /** The command waiting for a yes in the confirmation. */
  pending: PowerChoice | undefined;
  onApply: VoidFunction;
  onConfirm: (choice: PowerChoice) => void;
  onCancel: VoidFunction;
};

/**
 * The Power Adjustment panel's state: the percentage from the slider or the
 * field, the confirmation, and the command for the picked miners.
 */
export const usePowerAdjustment = (selection: PowerSelection): PowerAdjustment => {
  const config = useSiteConfig();
  const [pct, setPct] = useState(PCT_MAX);
  // Undefined while the field shows the percentage itself; set while typing.
  const [typed, setTyped] = useState<string | undefined>(undefined);
  const [pending, setPending] = useState<PowerChoice | undefined>(undefined);

  const miners: Miner[] = selection.miners;
  const name = selectionNameOf(miners);
  const command = usePowerCommand({ minerIds: [...selection.ids] }, name);

  return {
    pct,
    onSlide: (next) => {
      setTyped(undefined);
      setPct(clampPct(next));
    },
    fieldText: typed ?? String(pct),
    onFieldChange: (text) => {
      setTyped(text);
      const parsed = parsePctInput(text);
      if (parsed !== undefined) setPct(parsed);
    },
    onFieldBlur: () => setTyped(undefined),
    name,
    sharedPct: miners.length === 0 ? null : sharedPctOf(miners),
    canApply: miners.length > 0 && config?.commandsEnabled === true && !command.sending,
    commandsOff: config?.commandsEnabled === false,
    sending: command.sending,
    pending,
    onApply: () => setPending({ kind: "pct", pct }),
    onConfirm: (choice) => {
      setPending(undefined);
      command.send(choice);
    },
    onCancel: () => setPending(undefined),
  };
};
