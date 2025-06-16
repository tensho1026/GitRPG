"use client";

import { useSession } from "next-auth/react";
import AuthButton from "./components/auth/Auth-Button";
import Link from "next/link";
import { saveUserToDatabase } from "@/actions/user/saveUser";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      saveUserToDatabase({
        email: session.user.email,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      });
    }
  }, [session, status]);

  return (
    <div className="h-screen w-screen">
      {status === "authenticated" ? (
        <div>
          <Link href="/auth">
            <h1>ログイン済み</h1>
          </Link>
        </div>
      ) : (
        <AuthButton />
      )}
    </div>
  );
}
