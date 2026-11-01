import {
  type Miner,
  MINERS_MAX_PAGE_SIZE,
  type MinersQuery,
  minersPageSchema,
} from "../../api/contract";
import { getParsed } from "../../api/request";
import type { ExplorerFilter } from "./explorer-shape";

/** Pages the CSV export asks for at a time, so a large site is not hit with every page at once. */
export const EXPORT_PAGES_PER_BATCH = 4;

/** The miners query for one page of the filter; a blank search is left out. */
export const toMinersQuery = (
  filter: ExplorerFilter,
  page: number,
  pageSize: number,
): MinersQuery => {
  const search = filter.search.trim();
  return {
    page,
    pageSize,
    ...(search === "" ? {} : { search }),
    ...(filter.containerId === undefined ? {} : { containerId: filter.containerId }),
  };
};

/** The query string of `GET /api/miners`, named after `minersQuerySchema`. */
export const toMinersSearchParams = (query: MinersQuery): URLSearchParams => {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.pageSize !== undefined) params.set("pageSize", String(query.pageSize));
  if (query.search !== undefined) params.set("search", query.search);
  if (query.containerId !== undefined) params.set("containerId", query.containerId);
  return params;
};

export const minersPageUrl = (minersUrl: string, query: MinersQuery): string =>
  `${minersUrl}?${toMinersSearchParams(query).toString()}`;

const fetchPage = (minersUrl: string, filter: ExplorerFilter, page: number) =>
  getParsed(
    minersPageUrl(minersUrl, toMinersQuery(filter, page, MINERS_MAX_PAGE_SIZE)),
    minersPageSchema,
  );

// One batch in parallel, then the next: recursion keeps the batches in order.
const fetchPagesInBatches = async (
  minersUrl: string,
  filter: ExplorerFilter,
  pages: number[],
): Promise<Miner[]> => {
  if (pages.length === 0) return [];
  const batch = await Promise.all(
    pages.slice(0, EXPORT_PAGES_PER_BATCH).map((page) => fetchPage(minersUrl, filter, page)),
  );
  const rest = await fetchPagesInBatches(minersUrl, filter, pages.slice(EXPORT_PAGES_PER_BATCH));
  return [...batch.flatMap((minersPage) => minersPage.items), ...rest];
};

/**
 * Every miner the filter matches, for the CSV export: the first page tells the
 * total, then the other pages load a few at a time, at the largest page size.
 */
export const fetchAllMiners = async (
  minersUrl: string,
  filter: ExplorerFilter,
): Promise<Miner[]> => {
  const first = await fetchPage(minersUrl, filter, 1);
  const pageCount = Math.ceil(first.total / MINERS_MAX_PAGE_SIZE);
  const otherPages = Array.from({ length: Math.max(pageCount - 1, 0) }, (_, i) => i + 2);
  return [...first.items, ...(await fetchPagesInBatches(minersUrl, filter, otherPages))];
};
