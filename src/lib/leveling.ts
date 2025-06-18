// レベルごとの累積必要コミット数
const levelThresholds = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]; // 例：レベル1〜10

export const getLevelFromCommits = (commitCount: number): number => {
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (commitCount >= levelThresholds[i]) {
      return i + 1; // レベルは1始まり
    }
  }
  return 1;
};

export const getNextLevelCommitGoal = (currentLevel: number): number => {
  if (currentLevel >= levelThresholds.length) return Infinity;
  return levelThresholds[currentLevel]; // 次のレベルに必要な累積コミット数
};

export const getRemainingCommitsToNextLevel = (commitCount: number): number => {
  const level = getLevelFromCommits(commitCount);
  const nextGoal = getNextLevelCommitGoal(level);
  return nextGoal - commitCount;
};
