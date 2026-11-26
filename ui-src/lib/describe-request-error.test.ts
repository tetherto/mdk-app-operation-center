import { MdkFetchError } from "@tetherto/mdk-ui-foundation";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { describeRequestError } from "./describe-request-error";

const URL = "/apps/op-centre-lite/api/power-meters";

describe("describeRequestError", () => {
  it("tells an operator the backend is unreachable, with no developer steps", () => {
    const message = describeRequestError(new MdkFetchError(500, "Internal Server Error"), URL);

    expect(message).toBe("The app's backend is not reachable (HTTP 500). Try again in a moment.");
  });

  it("names the route a site does not offer", () => {
    expect(describeRequestError(new MdkFetchError(501, "Not Implemented"), URL)).toBe(
      `This site does not offer ${URL} (HTTP 501).`,
    );
  });

  it("falls back to the error message", () => {
    expect(describeRequestError(new Error("boom"), URL)).toBe("boom");
  });
});

describe("describeRequestError, other failures", () => {
  it("says a body broke the contract", () => {
    const parsed = z.object({ powerW: z.number() }).safeParse({ powerW: "1" });
    if (parsed.success) throw new Error("expected a parse failure");

    expect(describeRequestError(parsed.error, URL)).toBe(
      `${URL} answered with a body that does not match the contract.`,
    );
  });

  it("asks whether the backend runs when nothing serves the route", () => {
    expect(describeRequestError(new MdkFetchError(404, "Not Found"), URL)).toBe(
      `Nothing serves ${URL} (HTTP 404). Is the app's backend running?`,
    );
  });

  it("uses the error message for another status", () => {
    expect(describeRequestError(new MdkFetchError(403, "HTTP 403: Forbidden"), URL)).toBe(
      "HTTP 403: Forbidden",
    );
  });

  it("turns a thrown non-error into text", () => {
    expect(describeRequestError("offline", URL)).toBe("offline");
  });
});
