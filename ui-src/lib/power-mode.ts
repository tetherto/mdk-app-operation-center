import type { PowerMode } from "../api/contract";

export const POWER_MODE_LABELS: Record<PowerMode, string> = {
  sleep: "Sleep",
  low: "Low",
  normal: "Normal",
  high: "High",
};
