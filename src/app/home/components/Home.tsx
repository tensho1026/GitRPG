"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { getUserStatus } from "@/actions/user/status/getUserStatus";
import { getRemainingCommitsToNextLevel } from "@/lib/leveling";
import { getUserCurrentItems } from "@/actions/item/getUserCurrentitems";
import { Items } from "@/generated/prisma";
import MenuButton from "./MenuButton";
import MyAvatar from "@/app/home/components/MyAvatar";
import UserBasicInfo from "./UserBasicInfo";
import UserStatus from "./UserStatus";
import Header from "./Header";
import { UserWithStatus } from "@/types/user/userStatus";
import { menuItems } from "@/data/menu";
import BackGround from "../../../components/BackGround";

export default function HomeScreen() {
  const { data: session, status } = useSession();
  const [userStatus, setUserStatus] = useState<UserWithStatus | null>(null);
  const [userItems, setUserItems] = useState<Items[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (
        status === "authenticated" &&
        session?.user?.email &&
        session.accessToken
      ) {
        try {
          const statusResult = await getUserStatus(session.user.email);
          if (statusResult) {
            setUserStatus(statusResult);

            const items = await getUserCurrentItems(session.user.email);

            if (items) {
              setUserItems(items);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user data on home screen:", error);
        }
      }
    };

    fetchData();
  }, [status, session]);

  const { currentLevel, remainingCommits, progressPercentage } = useMemo(() => {
    const totalCommits = userStatus?.status?.commit ?? 0;
    const { remainingCommits, percentage } =
      getRemainingCommitsToNextLevel(totalCommits);
    return {
      currentLevel: userStatus?.status?.level ?? 1,
      remainingCommits: remainingCommits,
      progressPercentage: percentage,
    };
  }, [userStatus]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <BackGround backgroundImage={"/newhomepage.JPG"} />

      <div className="relative z-10 p-4 max-w-6xl mx-auto">
        {/* Header */}
        <Header
          currentLevel={currentLevel}
          userStatus={userStatus as UserWithStatus}
        />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* User Basic Information */}
          <UserBasicInfo
            userData={{
              name: userStatus?.name || "",
              username: session?.user?.email || "",
              avatar: userStatus?.image || "",
              githubUrl: `https://github.com/${userStatus?.name}`,
              registrationDate:
                userStatus?.createdAt?.toLocaleDateString() || "",
            }}
          />

          {/* User Status */}
          <UserStatus
            currentLevel={currentLevel}
            totalCommits={userStatus?.status?.commit ?? 0}
            coins={userStatus?.status?.coin ?? 0}
            remainingCommits={remainingCommits}
            progressPercentage={progressPercentage}
          />

          {/* Avatar Display */}
          <MyAvatar userItems={userItems} />
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ml-8">
          {menuItems.map((item) => (
            <MenuButton key={item.href} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
