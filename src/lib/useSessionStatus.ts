import { useSessionStore } from "./sessionStore";

export const useSessionStatus = () => {
  const { session, status } = useSessionStore();

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isUnauthenticated: status === "unauthenticated",
  };
};
