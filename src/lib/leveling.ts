const COMMITS_PER_LEVEL = 10;

export const getLevelFromCommits = (commitCount: number): number =>
  Math.floor(Math.max(0, commitCount) / COMMITS_PER_LEVEL) + 1;

export const getNextLevelCommitGoal = (currentLevel: number): number =>
  Math.max(1, currentLevel) * COMMITS_PER_LEVEL;

export const getRemainingCommitsToNextLevel = (
  commitCount: number
): { remainingCommits: number; percentage: number } => {
  const level = getLevelFromCommits(commitCount);
  const safeCommitCount = Math.max(0, commitCount);
  const currentLevelTotalCommits = (level - 1) * COMMITS_PER_LEVEL;
  const nextGoal = getNextLevelCommitGoal(level);

  const remainingCommits = nextGoal - safeCommitCount;
  const commitsForThisLevel = nextGoal - currentLevelTotalCommits;
  const progressInLevel = safeCommitCount - currentLevelTotalCommits;
  const percentage = (progressInLevel / commitsForThisLevel) * 100;

  return { remainingCommits, percentage };
};
