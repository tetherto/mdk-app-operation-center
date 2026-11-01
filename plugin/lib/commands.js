"use strict";

const { awaitOutcome } = require("./command-status");
const { runBounded } = require("./fleet");

const VERIFY_TIMEOUT_MS = 10_000;

/**
 * Power commands over the Kernel, sent through the client of the request
 * (`req.mdk`, the operator via the app) so the Kernel checks and records who
 * asked. A container target is its miners that are not offline; a miners
 * target is the known ones. Miners whose worker lacks the mode or the percent
 * command are skipped. `accepted` is whether the Kernel queued at least one
 * command; `minerCount` how many it queued, or with `verify`, how many
 * finished with SUCCESS within 10 s. Reads are invalidated after, so the next
 * one shows the change.
 */
function createCommands({ topology, fleet, snapshots, concurrency = 8, verify = false, logger }) {
  async function targetMiners(target) {
    const snapshot = await snapshots.get();
    if ("containerId" in target) {
      return topology.minerIdsIn({ containerId: target.containerId }).filter((id) => {
        const miner = snapshot.miners.get(id);
        return miner !== undefined && miner.status !== "offline";
      });
    }
    return target.minerIds.filter((id) => snapshot.miners.has(id));
  }

  /** The miners with known capabilities, as `{ id, caps }`. */
  async function withCapabilities(ids) {
    const entries = await Promise.all(
      ids.map(async (id) => ({ id, caps: await fleet.capabilitiesOf(id) })),
    );
    return entries.filter(({ caps }) => caps !== null);
  }

  async function dispatch(mdk, ids, command, params, onQueued) {
    let count = 0;
    const tasks = ids.map((id) => async () => {
      let sent;
      try {
        sent = await mdk.sendCommand(id, command, params);
      } catch (err) {
        if (logger) logger.warn("%s on %s failed: %s", command, id, err && err.message);
        return;
      }
      if (!sent || sent.status !== "QUEUED") {
        if (logger) logger.warn("%s on %s rejected: %s", command, id, sent && sent.error);
        return;
      }
      if (verify) {
        const outcome = (await awaitOutcome(mdk, sent.commandId, {
          timeoutMs: VERIFY_TIMEOUT_MS,
        })) ?? {
          status: "TIMEOUT",
          error: "ERR_VERIFY_TIMEOUT",
        };
        if (outcome.status !== "SUCCESS") {
          if (logger) logger.warn("%s on %s %s: %s", command, id, outcome.status, outcome.error);
          return;
        }
      }
      count += 1;
      if (onQueued) onQueued(id);
    });
    await runBounded(tasks, concurrency);
    snapshots.invalidate();
    return { accepted: count > 0, minerCount: count };
  }

  return {
    async setPowerMode(mdk, target, mode) {
      const miners = await withCapabilities(await targetMiners(target));
      const ids = miners
        .filter(({ caps }) => caps.supportedPowerModes.includes(mode))
        .map(({ id }) => id);
      return dispatch(mdk, ids, "setPowerMode", { mode });
    },

    async setPowerPct(mdk, target, pct) {
      const byCommand = new Map();
      for (const { id, caps } of await withCapabilities(await targetMiners(target))) {
        if (caps.pctCommand === null) continue;
        if (!byCommand.has(caps.pctCommand)) byCommand.set(caps.pctCommand, []);
        byCommand.get(caps.pctCommand).push(id);
      }
      const results = await Promise.all(
        [...byCommand].map(([command, ids]) =>
          dispatch(mdk, ids, command, { pct }, (id) => fleet.recordSetPct(id, pct)),
        ),
      );
      return {
        accepted: results.some((r) => r.accepted),
        minerCount: results.reduce((sum, r) => sum + r.minerCount, 0),
      };
    },
  };
}

module.exports = { createCommands };
