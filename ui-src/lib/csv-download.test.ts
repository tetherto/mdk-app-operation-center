import { afterEach, describe, expect, it, vi } from "vitest";

import { downloadCsv } from "./csv";
import { saveFile } from "./save-file";

vi.mock("./save-file", () => ({ saveFile: vi.fn<(fileName: string, blob: Blob) => void>() }));

afterEach(() => {
  vi.mocked(saveFile).mockReset();
});

describe("downloadCsv", () => {
  it("saves the text as a UTF-8 CSV file", async () => {
    downloadCsv("miners.csv", "Name\r\nm-1");

    const [name, blob] = vi.mocked(saveFile).mock.lastCall ?? [];
    expect(name).toBe("miners.csv");
    expect(blob?.type).toBe("text/csv;charset=utf-8");
    expect(await blob?.text()).toBe("Name\r\nm-1");
  });
});
