"use client";
import { useEffect, useMemo } from "react";
import { Session } from "next-auth";
import MenuButton from "./MenuButton";
import AdventurerOverview from "./AdventurerOverview";
import UserStatus from "./UserStatus";
import Header from "./Header";
import { UserWithStatus } from "@/types/user/userStatus";
import { menuItems } from "@/data/menu";
import BackGround from "../../../components/BackGround";
import { useSessionStore } from "@/lib/sessionStore";
import { useHomeData } from "../hooks/useHomeData";
import { useUserStats } from "../hooks/useUserStats";
import Loading from "@/components/ Loading";
import { DataState, InlineError } from "@/app/components/DataState";
import GuildNavigation from "@/components/GuildNavigation";

interface HomeScreenProps {
  session: Session | null;
  status: string;
}

export default function HomeScreen({ session, status }: HomeScreenProps) {
  const { setSession, setStatus } = useSessionStore();

  // zustand storeにsessionとstatusをセット
  useEffect(() => {
    setSession(session);
    setStatus(status as "loading" | "authenticated" | "unauthenticated");
  }, [session, status, setSession, setStatus]);

  const {
    userStatus,
    userItems,
    isLoading,
    equippedAvatar,
    error,
    syncError,
    retry,
    retrySync,
  } = useHomeData(session, status);
  const { remainingCommits, progressPercentage, items } = useUserStats(
    userStatus,
    userItems
  );

  // メモ化されたユーザーデータ
  const userData = useMemo(
    () => {
      const githubUsername = session?.user?.githubUsername;
      return {
        name: userStatus?.user?.name || "",
        username: githubUsername || "",
        avatar: userStatus?.user?.image || "",
        githubUrl: githubUsername
          ? `https://github.com/${encodeURIComponent(githubUsername)}`
          : "https://github.com",
      };
    },
    [
      userStatus?.user?.name,
      userStatus?.user?.image,
      session?.user?.githubUsername,
    ]
  );

  // メモ化されたメニューアイテム
  const menuButtons = useMemo(
    () => menuItems.map((item) => <MenuButton key={item.href} {...item} />),
    []
  );

  if (isLoading) {
    return <Loading backgroundImage={"/newhomepage.JPG"} />;
  }

  if (error) {
    return (
      <DataState
        title="ホームデータを読み込めません"
        message={error}
        onRetry={retry}
      />
    );
  }

  return (
    <main className="guild-shell min-h-screen w-full overflow-hidden pb-20 md:pb-0">
      {/* Background */}
      <BackGround backgroundImage={"/newhomepage.JPG"} />

      <div className="guild-container">
        {/* Header */}
        <Header userStatus={userStatus as UserWithStatus} />
        <GuildNavigation />

        {syncError && (
          <InlineError
            message={"GitHub同期に失敗しました: " + syncError}
            onRetry={retrySync}
          />
        )}

        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)]">
          <UserStatus
            userStatus={userStatus as UserWithStatus}
            remainingCommits={remainingCommits}
            progressPercentage={progressPercentage}
          />
          <AdventurerOverview
            userData={userData}
            userItems={items}
            equippedAvatar={equippedAvatar}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {menuButtons}
        </div>
      </div>
    </main>
  );
}
