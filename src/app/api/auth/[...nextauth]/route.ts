// app/api/auth/[...nextauth]/route.ts

import { authOptions } from "@/app/utils/authOptions";
import NextAuth from "next-auth/next";

export const runtime = "nodejs";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
