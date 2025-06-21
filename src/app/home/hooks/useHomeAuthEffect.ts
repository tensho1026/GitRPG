import { useEffect } from "react";
import { saveUserToDatabase } from "@/actions/user/auth/saveUser";
import { updateCommits } from "@/actions/github/updateCommits";
import { Session } from "next-auth";

export const useHomeAuthEffect = (session: Session | null, status: string) => {
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      saveUserToDatabase({
        email: session.user.email,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      });

      if (session?.user?.email && session?.accessToken) {
        updateCommits(session.user.email, session.accessToken)
          .then((count) => {
            console.log(`コミット数: ${count}`);
          })
          .catch((err) => {
            console.error("コミット取得失敗:", err);
          });
      }
    }
  }, [session, status]);
};
