import "server-only";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";

/**
 * Server Actions use the Supabase service key, so every caller must be tied to
 * the authenticated session rather than trusting an id supplied by the browser.
 */
export async function assertAuthenticatedUser(claimedUserId: string) {
  const session = await getServerSession(authOptions);
  const authenticatedUserId = session?.user?.email;

  if (!authenticatedUserId) {
    throw new Error("Authentication required");
  }

  if (claimedUserId !== authenticatedUserId) {
    throw new Error("You are not allowed to access another user's data");
  }

  return authenticatedUserId;
}
