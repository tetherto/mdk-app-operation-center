"use strict";

const { awaitOutcome } = require("./command-status");
const { httpError } = require("./errors");

/** Under the Gateway's 60 s route timeout. */
const TIMEOUT_MS = 50_000;

/**
 * A miner's log archive through the worker's `downloadLogs` command, sent as
 * the operator (`req.mdk`). The result both vendor workers return is inline:
 * `{ filename, contentType, encoding: "base64", size, sha256, data }`. Resolves
 * `{ filename, contentType, data: Buffer }`; null for a miner not in the
 * layout; 501 for a worker without the command, 502 when it fails.
 */
function createLogs({ topology, fleet }) {
  return async function minerLogs(mdk, id) {
    if (!topology.deviceById.has(id) || topology.deviceById.get(id).kind !== "miner") return null;
    const caps = await fleet.capabilitiesOf(id);
    if (caps === null || !caps.hasDownloadLogs) throw httpError("ERR_LOGS_UNSUPPORTED", 501);

    const sent = await mdk.sendCommand(id, "downloadLogs", {});
    if (!sent || sent.status !== "QUEUED") throw httpError("ERR_LOGS_FAILED", 502);

    const status = await awaitOutcome(mdk, sent.commandId, { timeoutMs: TIMEOUT_MS });
    const result = status && status.status === "SUCCESS" ? status.result : null;
    if (!result || typeof result.data !== "string") throw httpError("ERR_LOGS_FAILED", 502);

    return {
      filename:
        typeof result.filename === "string" && result.filename ? result.filename : `${id}-logs.bin`,
      contentType:
        typeof result.contentType === "string" && result.contentType
          ? result.contentType
          : "application/octet-stream",
      data: Buffer.from(result.data, result.encoding === "base64" ? "base64" : "utf8"),
    };
  };
}

module.exports = { createLogs };
