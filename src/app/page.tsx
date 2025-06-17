"use client";

import { useSession } from "next-auth/react";
import AuthButton from "./components/auth/Auth-Button";
import Link from "next/link";
import { saveUserToDatabase } from "@/actions/user/saveUser";
import { updateCommits } from "@/actions/github/updateCommits";
import { useEffect, useTransition } from "react";
import HomeScreen from "@/components/Home";

export default function Home() {
  const { data: session, status } = useSession();
  const [isPending, startTransition] = useTransition();
  console.log(session);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      saveUserToDatabase({
        email: session.user.email,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      });

      startTransition(() => {
        if (session?.user?.email && session?.accessToken) {
          updateCommits(session.user.email, session.accessToken)
            .then((count) => {
              console.log(`コミット数: ${count}`);
            })
            .catch((err) => {
              console.error("コミット取得失敗:", err);
            });
        }
      });
    }
  }, [session, status]);

  return (
    <div className="h-screen w-screen">
      {status === "authenticated" ? <HomeScreen /> : <AuthButton />}
    </div>
  );
}
