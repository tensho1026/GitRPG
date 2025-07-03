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

      // Only save if we have required data
      if (userEmail && userName && userImage) {
        saveUserToDatabase({
          id: userEmail,
          name: userName,
          image: userImage,
        });
      } else {
        console.log("useHomeAuthEffect: Missing required user data", {
          email: !!userEmail,
          name: !!userName,
          image: !!userImage,
        });
      }

      // GitHub commits are handled separately now
      // The updateCommits function signature has changed
    } else {
      console.log("useHomeAuthEffect: Not authenticated or missing email");
    }
  }, [session, status]);
};
