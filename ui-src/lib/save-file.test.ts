// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { saveFile } from "./save-file";

const BLOB_URL = "blob:http://localhost/file";

describe("saveFile", () => {
  const createObjectURL = vi.fn<(blob: Blob) => string>(() => BLOB_URL);
  const revokeObjectURL = vi.fn<(url: string) => void>(() => undefined);

  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom has no object URLs: give the test its own.
    Object.assign(URL, { createObjectURL, revokeObjectURL });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
  });

  it("clicks a download link for the blob, then revokes its URL", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const blob = new Blob(["a,b"], { type: "text/csv" });

    saveFile("report.csv", blob);

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(click).toHaveBeenCalledTimes(1);
    const link = click.mock.contexts[0];
    expect(link).toBeInstanceOf(HTMLAnchorElement);
    if (!(link instanceof HTMLAnchorElement)) return;
    expect(link.href).toBe(BLOB_URL);
    expect(link.download).toBe("report.csv");

    expect(revokeObjectURL).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith(BLOB_URL);
  });
});
