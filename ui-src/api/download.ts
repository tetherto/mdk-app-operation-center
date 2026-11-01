import { authStore, MdkFetchError } from "@tetherto/mdk-ui-foundation";

import { saveFile } from "../lib/save-file";

// `filename*=UTF-8''<percent-encoded>` (RFC 5987), and the plain `filename="<name>"`.
const ENCODED_FILE_NAME = /filename\*=UTF-8''([^;]+)/i;
const PLAIN_FILE_NAME = /filename="?([^";]+)"?/i;

/**
 * The file name a `Content-Disposition` header gives, preferring the
 * RFC 5987 `filename*` form; undefined without one.
 */
export const fileNameFrom = (contentDisposition: string | null): string | undefined => {
  if (contentDisposition === null) return undefined;
  const encoded = ENCODED_FILE_NAME.exec(contentDisposition)?.[1];
  if (encoded !== undefined) {
    try {
      return decodeURIComponent(encoded.trim());
    } catch {
      // A malformed encoding falls through to the plain form.
    }
  }
  return PLAIN_FILE_NAME.exec(contentDisposition)?.[1]?.trim();
};

/**
 * Downloads a route that answers with a file (not JSON) as the signed-in
 * operator, and saves it under the name the route gives. `mdkFetch` reads
 * every non-JSON body as text, which would corrupt a binary archive, so this
 * fetches the bytes itself with the same bearer token. Non-2xx throws
 * `MdkFetchError`, as `mdkFetch` does.
 */
export const downloadFile = async (url: string, fallbackName: string): Promise<void> => {
  const token = authStore.getState().token;
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new MdkFetchError(response.status, `HTTP ${response.status}: ${response.statusText}`);
  }
  const name = fileNameFrom(response.headers.get("content-disposition")) ?? fallbackName;
  saveFile(name, await response.blob());
};
