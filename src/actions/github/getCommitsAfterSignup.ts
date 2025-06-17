import { prisma } from "../../../prisma/prisma";
import { fetchTotalContributions } from "./fetchCommits";

export const getCommitsAfterSignup = async (
  userId: string,
  accessToken: string
) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!user || !user.createdAt) throw new Error("ユーザー情報が不正です");

  const fromDate = user.createdAt.toISOString(); 
  const { commits, issues, pullRequests, reviews } =
    await fetchTotalContributions(accessToken, fromDate);

  const total = commits + issues + pullRequests + reviews;

  return total;
};
