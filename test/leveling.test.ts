import { describe, expect, it } from "vitest";
import {
  getLevelFromCommits,
  getRemainingCommitsToNextLevel,
} from "@/lib/leveling";

describe("leveling", () => {
  it.each([
    [0, 1, 10, 0],
    [9, 1, 1, 90],
    [10, 2, 10, 0],
    [19, 2, 1, 90],
    [20, 3, 10, 0],
  ])(
    "calculates the level boundary for %i commits",
    (commits, expectedLevel, expectedRemaining, expectedPercentage) => {
      expect(getLevelFromCommits(commits)).toBe(expectedLevel);
      expect(getRemainingCommitsToNextLevel(commits)).toEqual({
        remainingCommits: expectedRemaining,
        percentage: expectedPercentage,
      });
    }
  );

  it("does not produce progress below zero for negative commits", () => {
    expect(getRemainingCommitsToNextLevel(-5)).toEqual({
      remainingCommits: 10,
      percentage: 0,
    });
  });
});
