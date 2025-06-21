import { create } from "zustand";
import { Session } from "next-auth";

interface SessionState {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  setSession: (session: Session | null) => void;
  setStatus: (status: "loading" | "authenticated" | "unauthenticated") => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  status: "loading",
  setSession: (session) => set({ session }),
  setStatus: (status) => set({ status }),
}));
