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

      // Debug: Log available session data
      console.log("🔍 Session debug info:", {
        userEmail,
        userName,
        userImage,
        userId,
        // @ts-ignore - NextAuth v4 user property compatibility
        sessionUser: session.user,
      });

      // Only save if we have required data
      if (userEmail && userName && userImage) {
        saveUserToDatabase({
          id: userEmail, // Using email as ID as per your specification
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
