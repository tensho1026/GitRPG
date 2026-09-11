import { describe, expect, it } from "vitest";
import { getSyncPlan } from "@/lib/sync";

const baseInput = {
  now: Date.parse("2026-09-11T00:10:00.000Z"),
  createdAt: "2026-09-01T00:00:00.000Z",
  lastSyncAt: null,
  syncStartedAt: null,
  syncStatus: "idle" as const,
  intervalMs: 5 * 60 * 1000,
  leaseMs: 2 * 60 * 1000,
};

describe("GitHub sync planning", () => {
  it("uses the signup date for the first sync", () => {
    expect(getSyncPlan(baseInput)).toEqual({
      shouldSync: true,
      reason: "initial",
      fromDate: "2026-09-01T00:00:00.000Z",
    });
  });

  it("skips a successful sync during the cooldown", () => {
    expect(
      getSyncPlan({
        ...baseInput,
        lastSyncAt: "2026-09-11T00:08:00.000Z",
        syncStatus: "success",
      })
    ).toEqual({ shouldSync: false, reason: "cooldown" });
  });

  it("uses the previous cursor after the cooldown", () => {
    expect(
      getSyncPlan({
        ...baseInput,
        lastSyncAt: "2026-09-11T00:00:00.000Z",
        syncStatus: "success",
      })
    ).toEqual({
      shouldSync: true,
      reason: "incremental",
      fromDate: "2026-09-11T00:00:00.000Z",
    });
  });

  it("does not let a forced retry bypass an active lease", () => {
    expect(
      getSyncPlan({
        ...baseInput,
        lastSyncAt: "2026-09-10T00:00:00.000Z",
        syncStartedAt: "2026-09-11T00:09:00.000Z",
        syncStatus: "syncing",
        force: true,
      })
    ).toEqual({ shouldSync: false, reason: "in_progress" });
  });
});
