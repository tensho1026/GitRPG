import { beforeEach, describe, expect, it, vi } from "vitest";

const { from, getUserId, fetchContributions } = vi.hoisted(
  () => ({
    from: vi.fn(),
    getUserId: vi.fn().mockResolvedValue("user@example.com"),
    fetchContributions: vi.fn(),
  })
);

vi.mock("@/lib/authenticatedUser", () => ({
  getAuthenticatedUserId: getUserId,
}));
vi.mock("@/actions/github/fetchCommits", () => ({
  fetchTotalContributions: fetchContributions,
}));
vi.mock("@/db/neon", () => ({ db: { from } }));

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
    const claim = chain(null, {
      data: { syncStartedAt: new Date().toISOString() },
      error: null,
    });
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
        return claim;
      }
      if (userStatusQueries === 3) {
        return chain(null, { data: updatedStatus, error: null });
      }
      return chain({ data: updatedStatus, error: null }, null);
    });
    fetchContributions.mockResolvedValue(10);

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
    expect(fetchContributions).toHaveBeenCalledWith(createdAt, expect.any(String));
    const startedAt = fetchContributions.mock.calls[0][1];
    expect(claim.update).toHaveBeenCalledWith({
      syncStatus: "syncing",
      syncStartedAt: startedAt,
      syncError: null,
      updatedAt: startedAt,
    });
  });

  it.each([
    [10001, { commit: 10001, coin: 8, level: 1001, hp: 10101, attack: 12001, defense: 10006 }],
    [9999, { commit: 10000, coin: 7, level: 1001, hp: 10100, attack: 12000, defense: 10005 }],
  ])("reconciles a lifetime total of %i commits without losing progress", async (total, expected) => {
    const createdAt = "2024-09-01T00:00:00.000Z";
    const status = {
      commit: 10000,
      coin: 7,
      level: 1001,
      hp: 10100,
      attack: 12000,
      defense: 10005,
      lastSyncAt: new Date(Date.now() - 600_000).toISOString(),
      syncStartedAt: null,
      syncStatus: "success",
      syncError: null,
    };
    const write = chain(null, { data: expected, error: null });
    from
      .mockReturnValueOnce(chain({ data: { createdAt }, error: null }, null))
      .mockReturnValueOnce(chain({ data: status, error: null }, null))
      .mockReturnValueOnce(chain(null, { data: {}, error: null }))
      .mockReturnValueOnce(write);
    fetchContributions.mockResolvedValue(total);

    const result = await updateCommits();

    expect(fetchContributions).toHaveBeenCalledWith(createdAt, expect.any(String));
    expect(write.update).toHaveBeenCalledWith(expect.objectContaining(expected));
    expect(result.newCommits).toBe(expected.commit - status.commit);
  });
});
