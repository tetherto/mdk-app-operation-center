"use strict";

const TERMINAL = new Set(["SUCCESS", "FAILED", "TIMEOUT"]);
const DEFAULT_POLL_MS = 500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Polls `getCommandStatus` until the command reaches a terminal state
 * (SUCCESS, FAILED or the Kernel's own TIMEOUT). Resolves that status, or
 * null when `timeoutMs` passes first.
 */
async function awaitOutcome(mdk, commandId, { timeoutMs, pollMs = DEFAULT_POLL_MS }) {
  const deadline = Date.now() + timeoutMs;
  const poll = async () => {
    if (Date.now() >= deadline) return null;
    const status = await mdk.getCommandStatus(commandId);
    if (status && TERMINAL.has(status.status)) return status;
    await sleep(pollMs);
    return poll();
  };
  return poll();
}

module.exports = { awaitOutcome, TERMINAL };
