// Every query key of the app starts here, so one prefix reaches all its reads.
const APP_QUERY_ROOT = "op-centre-lite";

/** The prefix of every read of live site data: a command refetches them all. */
export const LIVE_QUERY_KEY = [APP_QUERY_ROOT, "live"] as const;

export const QUERY_KEYS = {
  /** The site config; it only changes with a restart, so it is not live. */
  config: (url: string) => [APP_QUERY_ROOT, "config", url] as const,
  /** A read of live site data, by what it reads and its URL. */
  live: (name: string, url: string) => [...LIVE_QUERY_KEY, name, url] as const,
};
