import type { MinerStatus } from "../api/contract";

export const MINER_STATUS_LABELS: Record<MinerStatus, string> = {
  offline: "Offline",
  error: "Error",
  sleep: "Sleep",
  low: "Low",
  normal: "Normal",
  high: "High",
};
