import { describe, expect, it } from "vitest";

import { fileNameFrom } from "./download";

describe("fileNameFrom", () => {
  it("prefers the encoded filename", () => {
    expect(
      fileNameFrom(`attachment; filename="logs.tgz"; filename*=UTF-8''whatsminer%20logs.tgz`),
    ).toBe("whatsminer logs.tgz");
  });

  it("reads the plain filename, quoted or not", () => {
    expect(fileNameFrom('attachment; filename="logs.tgz"')).toBe("logs.tgz");
    expect(fileNameFrom("attachment; filename=logs.tgz")).toBe("logs.tgz");
  });

  it("is undefined without a header or a name", () => {
    expect(fileNameFrom(null)).toBeUndefined();
    expect(fileNameFrom("attachment")).toBeUndefined();
  });
});
