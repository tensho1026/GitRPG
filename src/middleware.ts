import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth",
  },
});

export const config = {
  matcher: [
    "/home/:path*",
    "/avatar/:path*",
    "/item/:path*",
    "/grass/:path*",
    "/battle/:path*",
    "/game/:path*",
  ],
};
