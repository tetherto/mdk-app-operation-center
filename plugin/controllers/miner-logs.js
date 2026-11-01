"use strict";

const { httpError } = require("../lib/errors");
const { site } = require("../lib/site-source");

/**
 * GET /api/miners/:id/logs: the miner's log archive as a download. A stream
 * route: the Gateway hands over the response, and this writes the headers and
 * the bytes the site source returns as `{ filename, contentType, data }`.
 */
/** A header value with control characters removed (a CR/LF would make writeHead throw). */
const isControl = (char) => char.charCodeAt(0) < 0x20 || char.charCodeAt(0) === 0x7f;
const headerValue = (value) =>
  Array.from(String(value))
    .filter((char) => !isControl(char))
    .join("");

/**
 * Content-Disposition for a filename the worker chose: an ASCII `filename`
 * (quotes and backslashes replaced) for every client, plus the exact name
 * RFC 5987-encoded in `filename*` for those that read it.
 */
function attachment(filename) {
  const ascii = Array.from(headerValue(filename))
    .map((char) => (char.charCodeAt(0) > 0x7e || char === '"' || char === "\\" ? "_" : char))
    .join("");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(headerValue(filename))}`;
}

module.exports = async function minerLogs(req, raw) {
  const logs = await site.minerLogs(req.params.id, req.mdk);
  if (logs === null) throw httpError("ERR_MINER_NOT_FOUND", 404);
  raw.writeHead(200, {
    "content-type": headerValue(logs.contentType),
    "content-length": logs.data.length,
    "content-disposition": attachment(logs.filename),
  });
  raw.end(logs.data);
};
