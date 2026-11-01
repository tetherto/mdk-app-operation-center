import { saveFile } from "./save-file";

/**
 * One CSV column: its header and how a row fills it. Numbers go in plain (no
 * unit, no thousands separator) so a spreadsheet can sum them; the header names
 * the unit. Undefined leaves the field empty.
 */
export type CsvColumn<Row> = {
  header: string;
  value: (row: Row) => string | number | undefined;
};

/** A number rounded for a CSV field; undefined stays empty. */
export const csvNumber = (value: number | undefined, fractionDigits: number): number | undefined =>
  value === undefined ? undefined : Number(value.toFixed(fractionDigits));

// A field with a comma, quote or line break is quoted, and its quotes doubled (RFC 4180).
const NEEDS_QUOTES = /[",\r\n]/;
// Text starting with one of these runs as a formula in a spreadsheet. Serials,
// positions and names come from devices, so such text gets a leading `'`,
// which spreadsheets show as plain text. Numbers stay as they are.
const FORMULA_START = /^[=+\-@\t\r]/;

const toField = (value: string | number | undefined): string => {
  if (value === undefined) return "";
  const text = typeof value === "string" && FORMULA_START.test(value) ? `'${value}` : String(value);
  return NEEDS_QUOTES.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

/** The rows as CSV text: a header line, then one line per row. */
export const toCsv = <Row>(columns: CsvColumn<Row>[], rows: Row[]): string =>
  [
    columns.map((column) => toField(column.header)),
    ...rows.map((row) => columns.map((column) => toField(column.value(row)))),
  ]
    .map((fields) => fields.join(","))
    .join("\r\n");

/** Saves CSV text as a file through the browser's download. */
export const downloadCsv = (fileName: string, csv: string): void =>
  saveFile(fileName, new Blob([csv], { type: "text/csv;charset=utf-8" }));
