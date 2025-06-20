import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Shirt } from "lucide-react";
import { Items } from "@/generated/prisma";

interface MyAvatarProps {
  level: number;
  userItems: Items[];
}

export default function MyAvatar({ level, userItems }: MyAvatarProps) {
  return (
    <div className="lg:col-span-1">
      <Card className="bg-gradient-to-b from-purple-800/95 to-purple-900/95 border-4 border-pink-400 shadow-2xl pixel-border h-full">
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex items-center mb-3">
            <User className="w-5 h-5 text-pink-300 mr-2" />
            <h2 className="text-pink-200 font-mono text-sm pixel-text font-bold">
              👤 マイアバター
            </h2>
          </div>

          <div className="bg-purple-700/60 p-4 rounded pixel-border border-2 border-pink-400 text-center">
            {/* Character Avatar Display */}
            <div className="relative w-24 h-32 mx-auto mb-3 bg-purple-600/40 rounded pixel-border border-2 border-pink-300 flex items-end justify-center">
              {/* Character Body */}
              <div className="w-16 h-20 bg-gradient-to-b from-amber-600 to-amber-700 rounded-t-lg pixel-border border-2 border-amber-500 relative">
                {/* Head */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full border-2 border-amber-300"></div>

                {/* Weapon (Sword) */}
                <div className="absolute -right-3 top-2 w-1 h-8 bg-gradient-to-b from-gray-400 to-gray-600 rounded pixel-border">
                  <div className="absolute -top-1 -left-1 w-3 h-2 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-sm"></div>
                </div>

                {/* Shield */}
                <div className="absolute -left-3 top-3 w-3 h-6 bg-gradient-to-b from-blue-500 to-blue-700 rounded pixel-border border border-blue-400"></div>

                {/* Armor details */}
                <div className="absolute inset-2 bg-gradient-to-b from-emerald-600 to-emerald-800 rounded pixel-border border border-emerald-500"></div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-pink-100 font-mono text-xs pixel-text font-bold">
                Lv.{level} 戦士
              </p>
              <p className="text-purple-200 font-mono text-xs pixel-text">
                装備中:{" "}
                {userItems.find((item: Items) => item.type === "weapon")
                  ?.name || "未装備"}
              </p>
            </div>
          </div>
          <Button className="w-full mt-auto bg-gradient-to-b from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 border-4 border-pink-500 text-white font-mono font-bold pixel-text pixel-border text-xs">
            <Shirt className="w-3 h-3 mr-1" />
            着せ替え
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
