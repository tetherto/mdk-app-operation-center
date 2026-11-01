import { beforeEach, describe, expect, it, vi } from "vitest";

import { type Miner, MINERS_MAX_PAGE_SIZE } from "../../api/contract";
import { getParsed } from "../../api/request";
import {
  EXPORT_PAGES_PER_BATCH,
  fetchAllMiners,
  toMinersQuery,
  toMinersSearchParams,
} from "./miners-request";

vi.mock("../../api/request", () => ({ getParsed: vi.fn<typeof getParsed>() }));

const mockedGetParsed = vi.mocked(getParsed);

const MINERS_URL = "/api/miners";
const NO_FILTER = { search: "", containerId: undefined };

const createMiner = (id: string): Miner => ({
  id,
  serial: id,
  ip: "10.0.1.1",
  containerId: "container-1",
  rackId: "rack-1-1",
  position: "1-1-1",
  status: "normal",
  powerMode: "normal",
  powerPct: 100,
  supportedPowerModes: ["normal"],
  hashrateThs: 200,
  powerW: 3_400,
  frequencyMhz: 600,
  inletTempC: 30,
  chipTempC: 70,
  uptimeS: 3_600,
  lastUpdate: 0,
});

const pageOfUrl = (url: string) => Number(new URL(url, "http://host").searchParams.get("page"));

// Answers every page request of a site with `total` miners, as the route does.
const serveMiners = (total: number) => {
  mockedGetParsed.mockImplementation(async (url) => {
    const page = pageOfUrl(url);
    const from = (page - 1) * MINERS_MAX_PAGE_SIZE;
    const count = Math.max(Math.min(MINERS_MAX_PAGE_SIZE, total - from), 0);
    const items = Array.from({ length: count }, (_, i) => createMiner(`miner-${from + i}`));
    return { items, total, page, pageSize: MINERS_MAX_PAGE_SIZE };
  });
};

const requestedPages = () => mockedGetParsed.mock.calls.map(([url]) => pageOfUrl(url));

beforeEach(() => {
  mockedGetParsed.mockReset();
});

describe("toMinersQuery", () => {
  it("leaves out a blank search and no container", () => {
    expect(toMinersQuery({ search: "  ", containerId: undefined }, 2, 10)).toEqual({
      page: 2,
      pageSize: 10,
    });
  });

  it("trims the search and keeps the container", () => {
    expect(toMinersQuery({ search: " HT001 ", containerId: "container-1" }, 1, 10)).toEqual({
      page: 1,
      pageSize: 10,
      search: "HT001",
      containerId: "container-1",
    });
  });
});

describe("toMinersSearchParams", () => {
  it("names each param after the miners query", () => {
    const params = toMinersSearchParams({
      page: 3,
      pageSize: 10,
      search: "10.0.1.1",
      containerId: "container-2",
    });

    expect(params.toString()).toBe("page=3&pageSize=10&search=10.0.1.1&containerId=container-2");
  });

  it("leaves out what the query does not give", () => {
    expect(toMinersSearchParams({}).toString()).toBe("");
  });
});

describe("fetchAllMiners", () => {
  it("asks for one page when the site has no miners", async () => {
    serveMiners(0);

    expect(await fetchAllMiners(MINERS_URL, NO_FILTER)).toEqual([]);
    expect(requestedPages()).toEqual([1]);
  });

  it("asks for no extra page when the total fills the pages exactly", async () => {
    serveMiners(MINERS_MAX_PAGE_SIZE * 2);

    const miners = await fetchAllMiners(MINERS_URL, NO_FILTER);

    expect(miners).toHaveLength(MINERS_MAX_PAGE_SIZE * 2);
    expect(requestedPages()).toEqual([1, 2]);
  });

  it("asks for a last partial page, and returns the miners in page order", async () => {
    serveMiners(MINERS_MAX_PAGE_SIZE * 2 + 1);

    const miners = await fetchAllMiners(MINERS_URL, NO_FILTER);

    expect(requestedPages()).toEqual([1, 2, 3]);
    expect(miners.map((miner) => miner.id)).toEqual(
      Array.from({ length: MINERS_MAX_PAGE_SIZE * 2 + 1 }, (_, i) => `miner-${i}`),
    );
  });

  it("sends the filter with every page, at the largest page size", async () => {
    serveMiners(MINERS_MAX_PAGE_SIZE + 1);

    await fetchAllMiners(MINERS_URL, { search: "HT", containerId: "container-1" });

    for (const [url] of mockedGetParsed.mock.calls) {
      const params = new URL(url, "http://host").searchParams;
      expect(params.get("search")).toBe("HT");
      expect(params.get("containerId")).toBe("container-1");
      expect(params.get("pageSize")).toBe(String(MINERS_MAX_PAGE_SIZE));
    }
  });

  it("never has more than one batch of pages in flight", async () => {
    let inFlight = 0;
    let mostInFlight = 0;
    const total = MINERS_MAX_PAGE_SIZE * 10;
    mockedGetParsed.mockImplementation(async (url) => {
      inFlight += 1;
      mostInFlight = Math.max(mostInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 1));
      inFlight -= 1;
      return { items: [], total, page: pageOfUrl(url), pageSize: MINERS_MAX_PAGE_SIZE };
    });

    await fetchAllMiners(MINERS_URL, NO_FILTER);

    expect(requestedPages()).toHaveLength(10);
    expect(mostInFlight).toBe(EXPORT_PAGES_PER_BATCH);
  });
});
