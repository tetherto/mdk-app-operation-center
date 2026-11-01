import { MdkFetchError } from "@tetherto/mdk-ui-foundation";
import { describe, expect, it } from "vitest";

import {
  choiceLabel,
  describeCommandError,
  describeCommandResult,
  type PowerChoice,
} from "./power-commands";

const LOW: PowerChoice = { kind: "mode", mode: "low" };
const EIGHTY: PowerChoice = { kind: "pct", pct: 80 };

describe("choiceLabel", () => {
  it("names a mode and a percentage", () => {
    expect(choiceLabel(LOW)).toBe("Low");
    expect(choiceLabel(EIGHTY)).toBe("80%");
  });
});

describe("describeCommandResult", () => {
  it("counts the miners the command went to", () => {
    expect(describeCommandResult({ accepted: true, minerCount: 18 }, "Container 1", LOW)).toEqual({
      variant: "success",
      title: "Container 1 set to Low",
      description: "Sent to 18 miners.",
    });
  });

  it("says one miner in the singular", () => {
    expect(
      describeCommandResult({ accepted: true, minerCount: 1 }, "WM1101", EIGHTY).description,
    ).toBe("Sent to 1 miner.");
  });

  it("warns when no miner took the command", () => {
    expect(
      describeCommandResult({ accepted: false, minerCount: 0 }, "Container 4", EIGHTY),
    ).toEqual({
      variant: "warning",
      title: "Container 4: nothing changed",
      description: "No online miner accepts 80%.",
    });
  });
});

describe("describeCommandError", () => {
  it("explains a 403 as commands being off", () => {
    const error = new MdkFetchError(403, "Forbidden");

    expect(describeCommandError(error, "/api/commands/power-mode", "Container 1")).toEqual({
      variant: "error",
      title: "Could not change Container 1",
      description: "Commands are off on this site.",
    });
  });

  it("falls back to the request error otherwise", () => {
    const { description } = describeCommandError(new Error("boom"), "/x", "Container 1");

    expect(description).toBe("boom");
  });
});
