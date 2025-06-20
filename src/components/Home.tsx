"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { getUserStatus } from "@/actions/user/status/getUserStatus";
import { getRemainingCommitsToNextLevel } from "@/lib/leveling";
import { getUserCurrentItems } from "@/actions/item/getUserCurrentitems";
import { Items, Users } from "@/generated/prisma";
import UserBasicInfo from "./home/UserBasicInfo";
import UserStatus from "./home/UserStatus";
import MyAvatar from "./home/MyAvatar";
import EquipmentStatus from "./home/EquipmentStatus";
import MonthlyActivity from "./home/MonthlyActivity";
import { fetchMonthlyContributions } from "@/actions/github/getCommitThisMonth";
import CombatStatus from "./home/CombatStatus";
import { getCurrentUserBattleStatus } from "@/actions/user/status/getCurrentUserBattleStatus";

type DailyCommit = {
  date: string;
  contributionCount: number;
};

export default function HomeScreen() {
  const { data: session, status } = useSession();
  const [userStatus, setUserStatus] = useState<
    | (Users & {
        status: {
          commit: number;
          level: number;
          coin: number;
          hp: number;
          attack: number;
          defense: number;
        } | null;
      })
    | null
  >(null);
  const [userItems, setUserItems] = useState<Items[]>([]);
  const [userData, setUserData] = useState({
    monthlyCommits: [] as DailyCommit[],
    thisMonthTotal: 0,
  });
  const [battleStatus, setBattleStatus] = useState({
    hp: 0,
    attack: 0,
    defense: 0,
  });

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

            const [items, contributionData, battleStats] = await Promise.all([
              getUserCurrentItems(session.user.email),
              fetchMonthlyContributions(
                session.accessToken,
                statusResult.createdAt
              ),
              getCurrentUserBattleStatus(session.user.email),
            ]);

            if (items) {
              setUserItems(items);
            }
            if (contributionData) {
              setUserData({
                monthlyCommits: contributionData.dailyCommits,
                thisMonthTotal: contributionData.totalCommits,
              });
            }
            if (battleStats) {
              setBattleStatus(battleStats);
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
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(/overworld-bg.png)",
          filter: "blur(2px)",
          zIndex: -1,
        }}
      />
      <div className="absolute inset-0 bg-black/15" />

      <div className="relative z-10 p-4 max-w-6xl mx-auto">
        {/* Top Row - User Info (small) + Status (large) + Avatar (medium) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* User Basic Information - Takes 1 column */}
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

          <UserStatus
            currentLevel={currentLevel}
            totalCommits={userStatus?.status?.commit ?? 0}
            coins={userStatus?.status?.coin ?? 0}
            remainingCommits={remainingCommits}
            progressPercentage={progressPercentage}
          />

          {/* Avatar Display - Takes 1 column */}
          <MyAvatar level={currentLevel} userItems={userItems} />
        </div>

        {/* Bottom Row - Equipment (medium) + Activity (large) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <EquipmentStatus userItems={userItems} />
          <CombatStatus
            hp={battleStatus.hp + (currentLevel ?? 0) * 10}
            attack={battleStatus.attack}
            defense={battleStatus.defense}
          />

          <MonthlyActivity
            monthlyCommits={userData.monthlyCommits}
            thisMonthTotal={userData.thisMonthTotal}
          />
        </div>
      </div>
    </div>
  );
}
