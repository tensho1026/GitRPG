import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Crown, Github, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface UserBasicInfoProps {
  userData: {
    name: string;
    username: string;
    avatar: string;
    githubUrl: string;
    registrationDate: string | undefined;
  };
}

function UserBasicInfo({ userData }: UserBasicInfoProps) {
  return (
    <div className="lg:col-span-1">
      <Card className="guild-panel h-full rounded-none border-2 py-0">
        <CardContent className="p-4">
          <div className="guild-section-title">
            <Crown className="w-5 h-5" /><h2>Adventurer</h2>
          </div>

          <div className="text-center mb-3">
            <div className="relative inline-block">
              <Image
                src={userData.avatar}
                alt="User Avatar"
                className="mx-auto h-20 w-20 border-2 border-amber-300 object-cover pixelated"
                width={64}
                height={64}
              />
              <div className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center border border-amber-300 bg-emerald-700">
                <div className="w-2 h-2 bg-emerald-200"></div>
              </div>
            </div>
            <h3 className="guild-title mt-3 text-lg">
              {userData.name}
            </h3>
            <p className="font-mono text-xs text-stone-400">
              @{userData.username}
            </p>
          </div>

          <div className="guild-inset my-4 p-3">
            <div className="flex items-center text-stone-300 font-mono text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{userData.registrationDate}</span>
            </div>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link
              href={userData.githubUrl}
              aria-label="GitHubプロフィールを開く"
              className="guild-button guild-button--stone mb-2 w-full text-xs">
              <Github className="w-3 h-3 mr-1" />
              GitHub
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="guild-button guild-button--danger w-full text-xs">
            <LogOut className="w-3 h-3 mr-1" />
            ログアウト
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserBasicInfo;
