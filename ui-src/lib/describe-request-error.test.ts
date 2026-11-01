import { MdkFetchError } from "@tetherto/mdk-ui-foundation";
import { describe, expect, it } from "vitest";

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
