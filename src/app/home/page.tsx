import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";
import AuthButton from "../auth/components/Auth-Button";
import HomeScreen from "@/app/home/components/Home";

export default async function Home() {
  // @ts-ignore - NextAuth v4 type compatibility workaround
  const session = await getServerSession(authOptions);
  const status = session ? "authenticated" : "unauthenticated";
  console.log(session);
  return (
    <div className="h-screen w-screen">
      {status === "authenticated" ? (
        // @ts-ignore - NextAuth v4 type compatibility workaround
        <HomeScreen session={session} status={status} />
      ) : (
        <AuthButton />
      )}
    </div>
  );
}
