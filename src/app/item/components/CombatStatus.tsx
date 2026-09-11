import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, Sword } from "lucide-react";

interface CombatStatusProps { hp: number; attack: number; defense: number; }

export default function CombatStatus({ hp, attack, defense }: CombatStatusProps) {
  const stats = [
    { label: "HP", value: hp, icon: Heart, color: "text-emerald-300" },
    { label: "攻撃力", value: attack, icon: Sword, color: "text-red-300" },
    { label: "防御力", value: defense, icon: Shield, color: "text-sky-300" },
  ];
  return (
    <div className="lg:col-span-1">
      <Card className="guild-panel rounded-none border-2 py-0">
        <CardContent className="p-5">
          <div className="guild-section-title"><Sword className="h-5 w-5" />Battle Stats</div>
          <div className="grid gap-2">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="guild-inset flex items-center justify-between p-3">
                <div className="flex items-center gap-2 font-mono text-sm text-stone-300"><Icon className={`h-4 w-4 ${color}`} />{label}</div>
                <span className="font-mono text-lg font-black text-amber-200">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
