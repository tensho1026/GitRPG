import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchTotalContributions } from "@/actions/github/fetchCommits";
import { GITHUB_REAUTH_MESSAGE } from "@/actions/github/syncConstants";

vi.mock("@/lib/authenticatedUser", () => ({
  getAuthenticatedGitHubAccessToken: vi.fn().mockResolvedValue("test-token"),
}));

describe("GitHub contribution sync errors", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each([
    [401, {}, {}, GITHUB_REAUTH_MESSAGE],
    [403, {}, { "retry-after": "120" }, "2分ほど待ってから再試行"],
    [403, {}, { "x-github-sso": "required; url=https://github.com" }, "SSO認証が必要"],
    [403, {}, {}, "アクセス権を確認"],
    [200, { errors: [{ type: "RATE_LIMITED" }] }, {}, "利用制限に達しました"],
  ] as const)("handles a GitHub HTTP %i response with headers %j %j", async (
    status, body, headers, message
  ) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(body, { status, headers })));

    await expect(
      fetchTotalContributions("2026-09-01T00:00:00Z", "2026-09-02T00:00:00Z")
    ).rejects.toThrow(message);
  });
});
