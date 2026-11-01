import { MdkFetchError } from "@tetherto/mdk-ui-foundation";
import { ZodError } from "zod";

// The Gateway answered, but nothing serves this route: the app's runtime is not
// running, or the route is not in plugin/mdk-plugin.json.
const NOT_SERVED = 404;
// The site's backend does not offer this route.
const NOT_IMPLEMENTED = 501;
// The Gateway or the app's runtime did not answer (a dev proxy reports a stopped
// Gateway as 500).
const UNREACHABLE = new Set([500, 502, 503, 504]);

/** A one-line, operator-facing reason a request failed. */
export const describeRequestError = (error: unknown, url: string): string => {
  if (error instanceof ZodError)
    return `${url} answered with a body that does not match the contract.`;
  if (error instanceof MdkFetchError && error.status === NOT_SERVED) {
    return `Nothing serves ${url} (HTTP 404). Is the app's backend running?`;
  }
  if (error instanceof MdkFetchError && error.status === NOT_IMPLEMENTED) {
    return `This site does not offer ${url} (HTTP 501).`;
  }
  if (error instanceof MdkFetchError && UNREACHABLE.has(error.status)) {
    return `The app's backend is not reachable (HTTP ${error.status}). Try again in a moment.`;
  }
  return error instanceof Error ? error.message : String(error);
};
