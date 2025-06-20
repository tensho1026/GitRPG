import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Sword, Shield, Shirt } from "lucide-react";
import Link from "next/link";
import { Items } from "@/generated/prisma";

interface EquipmentStatusProps {
  userItems: Items[];
}

export default function EquipmentStatus({ userItems }: EquipmentStatusProps) {
  return (
    <div className="lg:col-span-1">
      <Card className="bg-gradient-to-b from-red-800/95 to-red-900/95 border-4 border-orange-400 shadow-2xl pixel-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Sword className="w-6 h-6 text-orange-300 mr-2" />
              <h2 className="text-orange-200 font-mono text-lg pixel-text font-bold">
                🧍‍♂️ 装備状況
              </h2>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between bg-red-700/60 p-3 rounded pixel-border border-2 border-orange-400">
              <div className="flex items-center">
                <Sword className="w-5 h-5 text-orange-300 mr-2" />
                <span className="text-red-200 font-mono text-sm pixel-text">
                  武器
                </span>
              </div>
              <span className="text-orange-100 font-mono text-sm pixel-text font-bold">
                {userItems.find((item) => item.type === "weapon")?.name ||
                  "未装備"}
              </span>
            </div>

            <div className="flex items-center justify-between bg-red-700/60 p-3 rounded pixel-border border-2 border-orange-400">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-orange-300 mr-2" />
                <span className="text-red-200 font-mono text-sm pixel-text">
                  防具
                </span>
              </div>
              <span className="text-orange-100 font-mono text-sm pixel-text font-bold">
                {userItems.find((item) => item.type === "armor")?.name ||
                  "未装備"}
              </span>
            </div>

            <div className="flex items-center justify-between bg-red-700/60 p-3 rounded pixel-border border-2 border-orange-400">
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-orange-300 mr-2" />
                <span className="text-red-200 font-mono text-sm pixel-text">
                  装飾品
                </span>
              </div>
              <span className="text-orange-100 font-mono text-sm pixel-text font-bold">
                {userItems.find((item) => item.type === "accessory")?.name ||
                  "未装備"}
              </span>
            </div>
          </div>

          <Link href="/item">
            <Button className="w-full bg-gradient-to-b from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 border-4 border-orange-500 text-white font-mono font-bold pixel-text pixel-border">
              <Shirt className="w-4 h-4 mr-2" />
              装備変更
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
