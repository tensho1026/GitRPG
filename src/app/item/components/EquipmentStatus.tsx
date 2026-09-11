"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Sword, Shield } from "lucide-react";
import type { Item } from "@/types/user/userStatus";

interface EquipmentStatusProps { userItems: Item[]; }

export default function EquipmentStatus({ userItems }: EquipmentStatusProps) {
  const slots = [
    { type: "weapon", label: "武器", icon: Sword },
    { type: "armor", label: "防具", icon: Shield },
    { type: "accessory", label: "装飾品", icon: Zap },
  ];
  return (
    <div className="lg:col-span-1">
      <Card className="guild-panel rounded-none border-2 py-0">
        <CardContent className="p-5">
          <div className="guild-section-title"><Shield className="h-5 w-5" />Loadout</div>
          <div className="grid gap-2">
            {slots.map(({ type, label, icon: Icon }) => (
              <div key={type} className="guild-inset flex items-center justify-between gap-3 p-3">
                <div className="flex items-center gap-2 font-mono text-xs text-stone-400"><Icon className="h-4 w-4 text-amber-300" />{label}</div>
                <span className="min-w-0 break-words text-right text-sm font-bold text-stone-100">
                  {userItems.find((item) => item.type === type && item.equipped)?.name || "未装備"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
