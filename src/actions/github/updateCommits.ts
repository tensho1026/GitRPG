// app/actions/updateCommits.ts
"use server";

import { getCommitsAfterSignup } from "@/actions/github/getCommitsAfterSignup";
import { prisma } from "../../../prisma/prisma";

export async function updateCommits(userId: string, accessToken: string) {
  const count = await getCommitsAfterSignup(userId, accessToken);

  // コミット数をDBに保存
  await prisma.userStatus.upsert({
    where: { userId },
    update: { commit: count },
    create: { userId, commit: count },
  });

  return count;
}
