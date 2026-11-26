import { describe, expect, it } from "vitest";

import { formatAgo, formatDuration } from "./time";

describe("formatDuration", () => {
  it("uses the largest whole unit", () => {
    expect(formatDuration(59)).toBe("59 s");
    expect(formatDuration(60)).toBe("1 min");
    expect(formatDuration(3 * 3600 + 59)).toBe("3 h");
    expect(formatDuration(86_400)).toBe("1 day");
    expect(formatDuration(5 * 86_400 + 7200)).toBe("5 days");
  });

  it("reads a negative duration as zero", () => {
    expect(formatDuration(-4)).toBe("0 s");
  });
});

describe("formatAgo", () => {
  it("counts back from now", () => {
    expect(formatAgo(1_000, 60_000)).toBe("59 s ago");
  });
});
