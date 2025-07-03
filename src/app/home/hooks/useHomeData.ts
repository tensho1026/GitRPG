import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { getUserStatus } from "@/actions/user/status/getUserStatus";
import { getUserItems } from "@/actions/item/getUserItems";
import { UserWithStatus, Item } from "@/types/user/userStatus";

export const useHomeData = (session: Session | null, status: string) => {
  const [userStatus, setUserStatus] = useState<UserWithStatus | null>(null);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (
        status === "authenticated" &&
        // @ts-ignore - NextAuth v4 user property compatibility
        session?.user?.email &&
        // @ts-ignore - NextAuth v4 accessToken property compatibility
        session.accessToken
      ) {
        try {
          setIsLoading(true);
          // @ts-ignore - NextAuth v4 user property compatibility
          const [statusResult, itemsResult] = await Promise.all([
            // @ts-ignore - NextAuth v4 user property compatibility
            getUserStatus(session.user.email),
            // @ts-ignore - NextAuth v4 user property compatibility
            getUserItems(session.user.email),
          ]);

          if (statusResult) {
            setUserStatus(statusResult);
          }
          if (itemsResult) {
            setUserItems(itemsResult);
          }
        } catch (error) {
          console.error("Failed to fetch user data on home screen:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [status, session]);

  return { userStatus, userItems, isLoading };
};
