import { authStore, MdkFetchError } from "@tetherto/mdk-ui-foundation";
import { afterEach, describe, expect, it, type Mock, vi } from "vitest";

import { saveFile } from "../lib/save-file";
import { createFakeGateway, TEST_API_BASE } from "../test-utils/fake-gateway";
import { minersPageSchema } from "./contract";
import { downloadFile } from "./download";
import { minerLogsRoute } from "./routes";

vi.mock("../lib/save-file", () => ({ saveFile: vi.fn<(fileName: string, blob: Blob) => void>() }));

const savedFile = (): { name: unknown; blob: unknown } => {
  const call = vi.mocked(saveFile).mock.lastCall;
  return { name: call?.[0], blob: call?.[1] };
};

const authorizationOf = (fetchMock: Mock<typeof fetch>): string | null => {
  const init: unknown = fetchMock.mock.lastCall?.[1];
  if (typeof init !== "object" || init === null || !("headers" in init)) return null;
  return init.headers instanceof Headers ? init.headers.get("Authorization") : null;
};

afterEach(() => {
  authStore.getState().reset();
  vi.unstubAllGlobals();
  vi.mocked(saveFile).mockReset();
});

describe("downloadFile", () => {
  it("saves the file under the name the route gives", async () => {
    const gateway = createFakeGateway();
    vi.stubGlobal("fetch", gateway.fetch);
    const [miner] = minersPageSchema.parse(gateway.site.miners({})).items;
    if (miner === undefined) throw new Error("the mock site has no miners");

    await downloadFile(`${TEST_API_BASE}${minerLogsRoute(miner.id)}`, "fallback.txt");

    const { name, blob } = savedFile();
    expect(name).toBe(`${miner.id}-logs.txt`);
    if (!(blob instanceof Blob)) throw new Error("no blob saved");
    expect(await blob.text()).toContain(" boot ");
  });

  it("falls back to the given name without a Content-Disposition", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response("bytes", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await downloadFile("/file", "fallback.tgz");

    expect(savedFile().name).toBe("fallback.tgz");
    expect(authorizationOf(fetchMock)).toBeNull();
  });

  it("sends the signed-in operator's token", async () => {
    authStore.getState().setToken("secret-token");
    const fetchMock = vi.fn<typeof fetch>(async () => new Response("bytes", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await downloadFile("/file", "fallback.tgz");

    expect(authorizationOf(fetchMock)).toBe("Bearer secret-token");
  });

  it("throws MdkFetchError with the status on a non-2xx answer, saving nothing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () => new Response("", { status: 404, statusText: "Not Found" })),
    );

    const error: unknown = await downloadFile("/file", "fallback.tgz").catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(MdkFetchError);
    expect(error).toMatchObject({ status: 404, message: "HTTP 404: Not Found" });
    expect(saveFile).not.toHaveBeenCalled();
  });
});
