export type SyncStatus = "idle" | "syncing" | "success" | "error";

export interface SyncPlanInput {
  now: number;
  createdAt: string;
  lastSyncAt: string | null;
  syncStartedAt: string | null;
  syncStatus: SyncStatus;
  force?: boolean;
  intervalMs: number;
  leaseMs: number;
}

export type SyncPlan =
  | { shouldSync: false; reason: "in_progress" | "cooldown" }
  | { shouldSync: true; reason: "initial" | "incremental"; fromDate: string };

export function getSyncPlan(input: SyncPlanInput): SyncPlan {
  const lastSyncAt = input.lastSyncAt ? new Date(input.lastSyncAt) : null;
  const syncStartedAt = input.syncStartedAt
    ? new Date(input.syncStartedAt)
    : null;
  const validLastSyncAt =
    lastSyncAt && !Number.isNaN(lastSyncAt.getTime()) ? lastSyncAt : null;
  const validSyncStartedAt =
    syncStartedAt && !Number.isNaN(syncStartedAt.getTime())
      ? syncStartedAt
      : null;

  if (
    input.syncStatus === "syncing" &&
    validSyncStartedAt &&
    input.now - validSyncStartedAt.getTime() < input.leaseMs
  ) {
    return { shouldSync: false, reason: "in_progress" };
  }

  if (
    !input.force &&
    input.syncStatus === "success" &&
    validLastSyncAt &&
    input.now - validLastSyncAt.getTime() < input.intervalMs
  ) {
    return { shouldSync: false, reason: "cooldown" };
  }

  return {
    shouldSync: true,
    reason: validLastSyncAt ? "incremental" : "initial",
    fromDate: (validLastSyncAt || new Date(input.createdAt)).toISOString(),
  };
}
