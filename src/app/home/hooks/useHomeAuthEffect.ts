import { useEffect } from "react";
import { saveUserToDatabase } from "@/actions/user/auth/saveUser";
import { updateCommits } from "@/actions/github/updateCommits";
import { Session } from "next-auth";

export const useHomeAuthEffect = (session: Session | null, status: string) => {
  useEffect(() => {
    console.log("useHomeAuthEffect: status =", status);
    console.log("useHomeAuthEffect: session =", session);

    // @ts-ignore - NextAuth v4 user property compatibility
    if (status === "authenticated" && session?.user?.email) {
      // @ts-ignore - NextAuth v4 user property compatibility
      const userEmail = session.user.email;
      // @ts-ignore - NextAuth v4 user property compatibility
      const userName = session.user.name;
      // @ts-ignore - NextAuth v4 user property compatibility
      const userImage = session.user.image;

      console.log("useHomeAuthEffect: extracted values:", {
        email: userEmail,
        name: userName,
        image: userImage,
      });

      // Only save if we have required data
      if (userEmail && userName && userImage) {
        console.log("useHomeAuthEffect: Calling saveUserToDatabase");
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
