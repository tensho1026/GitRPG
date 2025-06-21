"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useSessionStore } from "@/lib/sessionStore";

export default function SessionManager() {
  const { data: session, status } = useSession();
  const { setSession, setStatus } = useSessionStore();

  useEffect(() => {
    setSession(session);
    setStatus(status);
  }, [session, status, setSession, setStatus]);

  // このコンポーネントは何もレンダリングしない
  return null;
}
