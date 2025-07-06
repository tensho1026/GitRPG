import { useEffect } from "react";
import { saveUserToDatabase } from "@/actions/user/auth/saveUser";
import { Session } from "next-auth";

export const useHomeAuthEffect = (session: Session | null, status: string) => {
  useEffect(() => {
    // @ts-ignore - NextAuth v4 user property compatibility
    if (status === "authenticated" && session?.user?.email) {
      // @ts-ignore - NextAuth v4 user property compatibility
      const userEmail = session.user.email;
      // @ts-ignore - NextAuth v4 user property compatibility
      const userName = session.user.name;
      // @ts-ignore - NextAuth v4 user property compatibility
      const userImage = session.user.image;
      // @ts-ignore - NextAuth v4 user property compatibility
      const userId = session.user.id;

      // Only save if we have required data
      if (userEmail && userName && userImage) {
        saveUserToDatabase({
          id: userEmail, // Using email as ID as per your specification
          name: userName,
          image: userImage,
        });
      }
    }
  }, [session, status]);
};
