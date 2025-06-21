import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, Sword } from "lucide-react";
import React from "react";

interface CombatStatusProps {
  hp: number;
  attack: number;
  defense: number;
}

export default function CombatStatus({
  hp,
  attack,
  defense,
}: CombatStatusProps) {
  return (
    <div className="lg:col-span-1">
      <Card className="bg-gradient-to-b from-gray-800/95 to-gray-900/95 border-4 border-gray-400 shadow-2xl pixel-border pb-13">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Sword className="w-6 h-6 text-gray-300 mr-2" />
              <h2 className="text-gray-200 font-mono text-lg pixel-text font-bold">
                ⚔️ 戦闘ステータス
              </h2>
            </div>
          </div>

          <div className="space-y-3 flex-grow flex flex-col justify-around">
            <div className="flex items-center justify-between bg-gray-700/60 p-3 rounded pixel-border border-2 border-gray-400">
              <div className="flex items-center">
                <Heart className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-gray-200 font-mono text-sm pixel-text">
                  HP
                </span>
              </div>
              <span className="text-red-300 font-mono text-lg pixel-text font-bold">
                {hp}
              </span>
            </div>

            <div className="flex items-center justify-between bg-gray-700/60 p-3 rounded pixel-border border-2 border-gray-400">
              <div className="flex items-center">
                <Sword className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-gray-200 font-mono text-sm pixel-text">
                  攻撃力
                </span>
              </div>
              <span className="text-yellow-300 font-mono text-lg pixel-text font-bold">
                {attack}
              </span>
            </div>

            <div className="flex items-center justify-between bg-gray-700/60 p-3 rounded pixel-border border-2 border-gray-400">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-gray-200 font-mono text-sm pixel-text">
                  防御力
                </span>
              </div>
              <span className="text-blue-300 font-mono text-lg pixel-text font-bold">
                {defense}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
