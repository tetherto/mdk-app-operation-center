import type { ToastVariant } from "@tetherto/mdk-react-devkit";
import { MdkFetchError } from "@tetherto/mdk-ui-foundation";

import type { CommandResult, PowerMode } from "../../api/contract";
import { describeRequestError } from "../../lib/describe-request-error";
import { POWER_MODE_LABELS } from "../../lib/power-mode";
import { formatCount, formatPercent } from "../../lib/units";

/** The power percentages the controls offer, highest first. */
export const POWER_PCT_OPTIONS = [100, 90, 80, 70, 60, 50] as const;

/** Shown wherever a power control is off because the site has commands off (the hosted demo). */
export const COMMANDS_OFF_MESSAGE = "Commands are off on this site.";

/** What a power command acts on: a whole container, or miners picked one by one. */
export const POWER_TARGET_KINDS = { CONTAINER: "container", MINERS: "miners" } as const;
export type PowerTargetKind = (typeof POWER_TARGET_KINDS)[keyof typeof POWER_TARGET_KINDS];

/** One power setting an operator picks: a mode, or a percentage. */
export type PowerChoice = { kind: "mode"; mode: PowerMode } | { kind: "pct"; pct: number };

export const choiceLabel = (choice: PowerChoice): string =>
  choice.kind === "mode" ? POWER_MODE_LABELS[choice.mode] : formatPercent(choice.pct);

/** A toast's worth of feedback, in the devkit's notification variants. */
export type CommandFeedback = {
  variant: ToastVariant;
  title: string;
  description: string;
};

/**
 * What an operator is told after a command. A command no miner took (all
 * offline, or none supports the setting) is not an error, but it changed
 * nothing, so it says so.
 */
export const describeCommandResult = (
  result: CommandResult,
  targetName: string,
  choice: PowerChoice,
): CommandFeedback => {
  const label = choiceLabel(choice);
  if (!result.accepted || result.minerCount === 0) {
    return {
      variant: "warning",
      title: `${targetName}: nothing changed`,
      description: `No online miner accepts ${label}.`,
    };
  }
  return {
    variant: "success",
    title: `${targetName} set to ${label}`,
    description: `Sent to ${formatCount(result.minerCount, "miner")}.`,
  };
};

// The command routes answer 403 while `commandsEnabled` is off (the hosted demo).
const COMMANDS_DISABLED = 403;

export const describeCommandError = (
  error: unknown,
  url: string,
  targetName: string,
): CommandFeedback => ({
  variant: "error",
  title: `Could not change ${targetName}`,
  description:
    error instanceof MdkFetchError && error.status === COMMANDS_DISABLED
      ? COMMANDS_OFF_MESSAGE
      : describeRequestError(error, url),
});
