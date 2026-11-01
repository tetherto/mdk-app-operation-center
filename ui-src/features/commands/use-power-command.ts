import { useMdkApp, useMutation, useQueryClient } from "@tetherto/mdk-react-adapter";
import { useNotification } from "@tetherto/mdk-react-devkit";
import { useCallback, useEffect, useState } from "react";

import {
  type CommandTarget,
  commandResultSchema,
  powerModeCommandSchema,
  powerPctCommandSchema,
} from "../../api/contract";
import { LIVE_QUERY_KEY } from "../../api/query-keys";
import { postParsed } from "../../api/request";
import { API_ROUTES } from "../../api/routes";
import {
  type CommandFeedback,
  describeCommandError,
  describeCommandResult,
  type PowerChoice,
} from "./power-commands";

// The plugin serves a fleet snapshot up to `snapshotTtlMs` old (5 s by default),
// and serves the stale one while it refreshes, so a read right after a command
// can show the old setting for up to ~6 s, and the first read past that can
// still be stale. Reads refetch a few more times across that window.
const FOLLOW_UP_REFETCH_MS = [3_000, 6_000, 9_000];

export type PowerCommand = {
  send: (choice: PowerChoice) => void;
  /** True while a command is on its way. */
  sending: boolean;
};

/**
 * Sends power mode and power % commands to one target, tells the operator how
 * many miners took it, and refetches every read so the change shows.
 */
export const usePowerCommand = (target: CommandTarget, targetName: string): PowerCommand => {
  const { apiUrl } = useMdkApp();
  const queryClient = useQueryClient();
  const { notifySuccess, notifyInfo, notifyWarning, notifyError } = useNotification();
  // The pending follow-up refetches: a new command replaces them, unmounting drops them.
  const [followUps] = useState(() => new Set<ReturnType<typeof setTimeout>>());

  const clearFollowUps = useCallback(() => {
    for (const timer of followUps) clearTimeout(timer);
    followUps.clear();
  }, [followUps]);

  useEffect(() => clearFollowUps, [clearFollowUps]);

  const notify = ({ variant, title, description }: CommandFeedback) => {
    const show = {
      success: notifySuccess,
      info: notifyInfo,
      warning: notifyWarning,
      error: notifyError,
    }[variant];
    show(title, description);
  };

  const urlOf = (choice: PowerChoice) =>
    apiUrl(choice.kind === "mode" ? API_ROUTES.POWER_MODE : API_ROUTES.POWER_PCT);

  const mutation = useMutation({
    mutationFn: (choice: PowerChoice) =>
      choice.kind === "mode"
        ? postParsed(
            urlOf(choice),
            powerModeCommandSchema.parse({ target, mode: choice.mode }),
            commandResultSchema,
          )
        : postParsed(
            urlOf(choice),
            powerPctCommandSchema.parse({ target, pct: choice.pct }),
            commandResultSchema,
          ),
    onSuccess: (result, choice) => notify(describeCommandResult(result, targetName, choice)),
    onError: (error, choice) => notify(describeCommandError(error, urlOf(choice), targetName)),
    onSettled: () => {
      const refetch = () => void queryClient.invalidateQueries({ queryKey: LIVE_QUERY_KEY });
      refetch();
      for (const delayMs of FOLLOW_UP_REFETCH_MS) {
        const timer = setTimeout(() => {
          followUps.delete(timer);
          refetch();
        }, delayMs);
        followUps.add(timer);
      }
    },
  });

  const send = (choice: PowerChoice) => {
    clearFollowUps();
    mutation.mutate(choice);
  };

  return { send, sending: mutation.isPending };
};
