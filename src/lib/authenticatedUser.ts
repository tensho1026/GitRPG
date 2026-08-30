import "server-only";

import { cookies, headers } from "next/headers";
import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import type { NextApiRequest } from "next";
import { authOptions } from "@/app/utils/authOptions";

/**
 * Server Actions use the Supabase service key, so every caller must be tied to
 * the authenticated session rather than trusting an id supplied by the browser.
 */
export async function getAuthenticatedUserId() {
  const session = await getServerSession(authOptions);
  const authenticatedUserId = session?.user?.email;

  if (!authenticatedUserId) {
    throw new Error("Authentication required");
  }

  return authenticatedUserId;
}

export async function getAuthenticatedGitHubAccessToken() {
  const requestHeaders = await headers();
  const requestCookies = await cookies();
  const request = {
    headers: new Headers(requestHeaders),
    cookies: Object.fromEntries(
      requestCookies.getAll().map(({ name, value }) => [name, value])
    ),
  } as unknown as NextApiRequest;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const accessToken = token?.accessToken;
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    throw new Error("GitHub authorization required");
  }

  return accessToken;
}

export async function assertAuthenticatedUser(claimedUserId: string) {
  if (!claimedUserId) {
    throw new Error("User ID is required");
  }

  const authenticatedUserId = await getAuthenticatedUserId();
  if (claimedUserId !== authenticatedUserId) {
    throw new Error("You are not allowed to access another user's data");
  }

  return authenticatedUserId;
}
