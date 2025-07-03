"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthRedirectWrapperProps {
  children: React.ReactNode;
}

export default function AuthRedirectWrapper({
  children,
}: AuthRedirectWrapperProps) {
  const { status } = useSession();
  const router = useRouter();

  // Redirect to home if user is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/home");
    }
  }, [status, router]);

  // Don't render the content if user is authenticated (will redirect)
  if (status === "authenticated") {
    return null;
  }

  return <>{children}</>;
}
