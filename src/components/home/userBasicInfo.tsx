import React from "react";
import { Card, CardContent } from "../ui/card";
import { Calendar, Crown, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

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
      <Card className="bg-gradient-to-b from-emerald-800/95 to-emerald-900/95 border-4 border-yellow-500 shadow-2xl pixel-border h-full">
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <Crown className="w-5 h-5 text-yellow-400 mr-2" />
            <h2 className="text-yellow-200 font-mono text-sm pixel-text font-bold">
              🔑 冒険者情報
            </h2>
          </div>

          <div className="text-center mb-3">
            <div className="relative inline-block">
              <Image
                src={userData.avatar || "/placeholder.svg"}
                alt="User Avatar"
                className="w-16 h-16 rounded-full border-3 border-yellow-400 pixelated mx-auto"
                width={64}
                height={64}
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h3 className="text-yellow-100 font-mono text-lg pixel-text font-bold mt-2">
              {userData.name}
            </h3>
            <p className="text-emerald-200 font-mono text-xs pixel-text">
              @{userData.username}
            </p>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center text-emerald-300 font-mono text-xs pixel-text">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{userData.registrationDate}</span>
            </div>
          </div>

          <Link href={userData.githubUrl}>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-gray-800/80 border-2 border-gray-600 text-gray-200 hover:bg-gray-700/80 pixel-border text-xs">
              <Github className="w-3 h-3 mr-1" />
              GitHub
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserBasicInfo;
