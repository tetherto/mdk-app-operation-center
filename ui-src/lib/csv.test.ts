import { describe, expect, it } from "vitest";

import { type CsvColumn, csvNumber, toCsv } from "./csv";

type Row = { name: string; count: number | undefined };

const COLUMNS: CsvColumn<Row>[] = [
  { header: "Name", value: (row) => row.name },
  { header: "Count", value: (row) => row.count },
];

describe("toCsv", () => {
  it("writes a header line, then one line per row", () => {
    expect(toCsv(COLUMNS, [{ name: "Rack 1-1", count: 3 }])).toBe("Name,Count\r\nRack 1-1,3");
  });

  it("quotes fields with commas, quotes or line breaks", () => {
    const rows = [
      { name: 'a, "b"', count: 1 },
      { name: "c\nd", count: 2 },
    ];
    expect(toCsv(COLUMNS, rows)).toBe('Name,Count\r\n"a, ""b""",1\r\n"c\nd",2');
  });

  it("keeps text that starts like a formula from running as one", () => {
    const rows = ["=SUM(A1)", "+1", "-1", "@cmd", "\tx"].map((name) => ({ name, count: 1 }));
    expect(toCsv(COLUMNS, rows)).toBe(
      "Name,Count\r\n'=SUM(A1),1\r\n'+1,1\r\n'-1,1\r\n'@cmd,1\r\n'\tx,1",
    );
  });

  it("leaves negative numbers as numbers", () => {
    expect(toCsv(COLUMNS, [{ name: "a", count: -2 }])).toBe("Name,Count\r\na,-2");
  });

  it("writes only the header without rows", () => {
    expect(toCsv(COLUMNS, [])).toBe("Name,Count");
  });
});

describe("csvNumber", () => {
  it("rounds to the given digits, with no separators", () => {
    expect(csvNumber(3582.4, 0)).toBe(3582);
    expect(csvNumber(16.876, 2)).toBe(16.88);
  });

  it("leaves a missing value empty", () => {
    expect(toCsv(COLUMNS, [{ name: "a", count: csvNumber(undefined, 2) }])).toBe(
      "Name,Count\r\na,",
    );
  });
});
