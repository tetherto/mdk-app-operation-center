import { mdkFetch } from "@tetherto/mdk-ui-foundation";
import type { z } from "zod";

/**
 * Calls a route with the signed-in operator's token and parses the body with
 * its contract schema, so a response that drifts from the contract fails here,
 * at the boundary, instead of somewhere in a component. Non-2xx responses throw
 * `MdkFetchError` (from `@tetherto/mdk-ui-foundation`) with the status.
 */
export const getParsed = async <Schema extends z.ZodType>(
  url: string,
  schema: Schema,
): Promise<z.infer<Schema>> => schema.parse(await mdkFetch<unknown>(url));

/** POSTs a JSON body (already valid per its contract schema) and parses the response. */
export const postParsed = async <Schema extends z.ZodType>(
  url: string,
  body: unknown,
  schema: Schema,
): Promise<z.infer<Schema>> => {
  const init: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
  return schema.parse(await mdkFetch<unknown>(url, init));
};
