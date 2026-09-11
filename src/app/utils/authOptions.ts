import GitHubProvider from "next-auth/providers/github";
import type { NextAuthOptions } from "next-auth";

// Public contributions only need profile and email access. Private repository
// contributions are opt-in because the classic "repo" scope grants access to
// all private repositories visible to the GitHub account.
const githubScope =
  process.env.GITHUB_INCLUDE_PRIVATE_CONTRIBUTIONS === "true"
    ? "read:user user:email repo"
    : "read:user user:email";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      // GitHub now includes RFC 9207's `iss` parameter in OAuth callbacks.
      // NextAuth's openid-client validation needs the expected issuer here.
      issuer: "https://github.com/login/oauth",
      authorization: {
        params: {
          scope: githubScope,
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      const githubLogin = (profile as { login?: unknown } | undefined)?.login;
      if (typeof githubLogin === "string" && githubLogin.length > 0) {
        token.githubUsername = githubLogin;
      }
      return token;
    },
    async session({ session, token }) {
      if (
        session.user &&
        typeof token.githubUsername === "string" &&
        token.githubUsername.length > 0
      ) {
        session.user.githubUsername = token.githubUsername;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
