import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AuthButton from "../auth/components/Auth-Button";
import HomeScreen from "@/app/home/components/Home";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const status = session ? "authenticated" : "unauthenticated";

  return (
    <div className="h-screen w-screen">
      {status === "authenticated" ? (
        <HomeScreen session={session} status={status} />
      ) : (
        <AuthButton />
      )}
    </div>
  );
}
