const SECOND_S = 1;
const MINUTE_S = 60 * SECOND_S;
const HOUR_S = 60 * MINUTE_S;
const DAY_S = 24 * HOUR_S;

/**
 * A duration in its largest whole unit: "59 s", "12 min", "3 h", "1 day",
 * "5 days". Seconds below zero (a clock ahead of the device) read as "0 s".
 */
export const formatDuration = (seconds: number): string => {
  const s = Math.max(0, Math.floor(seconds));
  if (s < MINUTE_S) return `${s} s`;
  if (s < HOUR_S) return `${Math.floor(s / MINUTE_S)} min`;
  if (s < DAY_S) return `${Math.floor(s / HOUR_S)} h`;
  const days = Math.floor(s / DAY_S);
  return days === 1 ? "1 day" : `${days} days`;
};

/** How long ago a moment was: "59 s ago". */
export const formatAgo = (atMs: number, nowMs: number): string =>
  `${formatDuration((nowMs - atMs) / 1000)} ago`;
