import GitHubProvider from "next-auth/providers/github";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
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
