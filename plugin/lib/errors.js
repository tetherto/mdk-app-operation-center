"use strict";

/**
 * An error the Gateway turns into a response: `statusCode` sets the HTTP status,
 * and the body is `{ statusCode, error, message }` with `message` = `code`.
 */
function httpError(code, statusCode) {
  return Object.assign(new Error(code), { statusCode });
}

module.exports = { httpError };
