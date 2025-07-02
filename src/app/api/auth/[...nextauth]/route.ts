// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";

// NextAuth v4 with App Router - type compatibility workaround
// @ts-ignore
const handler = NextAuth(authOptions);

// Export handlers for App Router
export { handler as GET, handler as POST };
