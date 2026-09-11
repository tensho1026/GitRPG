import { beforeEach, describe, expect, it, vi } from "vitest";

const { from, getUserId, fetchContributions, getRecentCommits } = vi.hoisted(
  () => ({
    from: vi.fn(),
    getUserId: vi.fn().mockResolvedValue("user@example.com"),
    fetchContributions: vi.fn(),
    getRecentCommits: vi.fn(),
  })
);

vi.mock("@/lib/authenticatedUser", () => ({
  getAuthenticatedUserId: getUserId,
}));
vi.mock("@/actions/github/fetchCommits", () => ({
  fetchTotalContributions: fetchContributions,
}));
vi.mock("@/actions/github/getCommitsAfterSignup", () => ({
  getCommitsAfterSignup: getRecentCommits,
}));
vi.mock("@/supabase/supabase.config", () => ({ supabase: { from } }));

import { updateCommits } from "@/actions/github/updateCommits";

const chain = (singleValue: unknown, maybeSingleValue: unknown) => {
  const query: Record<string, ReturnType<typeof vi.fn>> = {};
  query.select = vi.fn(() => query);
  query.eq = vi.fn(() => query);
  query.update = vi.fn(() => query);
  query.single = vi.fn().mockResolvedValue(singleValue);
  query.maybeSingle = vi.fn().mockResolvedValue(maybeSingleValue);
  return query;
};

describe("updateCommits", () => {
  beforeEach(() => {
    from.mockReset();
    fetchContributions.mockReset();
    getRecentCommits.mockReset();
  });

  it("awards only the delta and skips the next request during cooldown", async () => {
    const createdAt = "2026-09-01T00:00:00.000Z";
    const initialStatus = {
      commit: 0,
      coin: 100,
      level: 1,
      hp: 100,
      attack: 10,
      defense: 5,
      lastSyncAt: null,
      syncStartedAt: null,
      syncStatus: "idle",
      syncError: null,
    };
    const updatedStatus = {
      ...initialStatus,
      commit: 10,
      coin: 110,
      level: 2,
      lastSyncAt: new Date().toISOString(),
      syncStatus: "success",
    };
    let userStatusQueries = 0;

    from.mockImplementation((table: string) => {
      if (table === "Users") {
        return chain({ data: { createdAt }, error: null }, null);
      }
      userStatusQueries += 1;
      if (userStatusQueries === 1) {
        return chain({ data: initialStatus, error: null }, null);
      }
      if (userStatusQueries === 2) {
        return chain(null, {
          data: { syncStartedAt: new Date().toISOString() },
          error: null,
        });
      }
      if (userStatusQueries === 3) {
        return chain(null, { data: updatedStatus, error: null });
      }
      return chain({ data: updatedStatus, error: null }, null);
    });
    fetchContributions.mockResolvedValue({
      commits: 10,
      issues: 0,
      pullRequests: 0,
      reviews: 0,
      repositories: 0,
    });

    const first = await updateCommits();
    const second = await updateCommits();

    expect(first).toMatchObject({
      success: true,
      coinsAwarded: 10,
      newCommits: 10,
    });
    expect(second).toMatchObject({
      success: true,
      skipped: true,
      reason: "cooldown",
      coinsAwarded: 0,
      newCommits: 0,
    });
    expect(fetchContributions).toHaveBeenCalledTimes(1);
    expect(fetchContributions).toHaveBeenCalledWith(createdAt);
  });
});
