"use client";

import { useMemo, useState } from "react";
import { Coins, Lock, Shield, Star, Sword } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { equipmentData } from "@/data/equipment";
import { purchaseItem } from "@/actions/item/purchaseItem";
import { equipItem } from "@/actions/item/equipItem";
import type { Item as UserItem } from "@/types/user/userStatus";
import type { Equipment } from "@/types/equipment/equipment";
import { InlineError } from "@/app/components/DataState";

type DisplayEquipment = Equipment & { dbId?: string };
const icons = { weapon: Sword, armor: Shield, accessory: Star };

export default function EquipmentShop({ selectedTab, userItems, coins, onDataUpdate }: {
  selectedTab: string; userItems: UserItem[]; coins: number; onDataUpdate: () => Promise<void>;
}) {
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const items = useMemo((): DisplayEquipment[] => equipmentData.map((item) => {
    const owned = userItems.find((entry) => entry.equipmentId === item.id);
    return { ...item, owned: !!owned, equipped: owned?.equipped || false, dbId: owned?.id };
  }).filter((item) => selectedTab === "all" || item.type === selectedTab), [userItems, selectedTab]);

  const run = async (action: () => Promise<unknown>) => {
    setIsProcessing(true); setActionError(null);
    try { await action(); await onDataUpdate(); }
    catch (error) { setActionError(error instanceof Error ? error.message : "操作に失敗しました"); }
    finally { setIsProcessing(false); }
  };

  return (
    <div id="equipment-panel" role="tabpanel" aria-label="装備一覧" className="font-mono">
      {actionError && <InlineError message={actionError} />}
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const Icon = icons[item.type as keyof typeof icons];
          const canBuy = coins >= item.price;
          return (
            <article key={item.id} className={`guild-panel flex min-h-[330px] flex-col p-5 ${item.equipped ? "!border-emerald-400" : ""}`}>
              <div className="mb-4 flex items-start gap-4">
                <div className="guild-inset grid h-24 w-24 shrink-0 place-items-center p-2">
                  <Image src={item.image} alt={item.name} width={80} height={80} className="h-20 w-20 object-contain [image-rendering:pixelated]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="guild-kicker flex items-center gap-2"><Icon size={14} />{item.type}</p>
                  <h3 className="guild-title mt-1 break-words text-xl">{item.name}</h3>
                  <p className="mt-2 text-xs leading-5 text-stone-400">{item.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="guild-stat"><p className="text-[10px] text-stone-400">ATK</p><p className="guild-stat__value">{item.attack || 0}</p></div>
                <div className="guild-stat"><p className="text-[10px] text-stone-400">DEF</p><p className="guild-stat__value">{item.defense || 0}</p></div>
              </div>

              <div className="mt-auto flex items-center gap-3 border-t border-amber-800/40 pt-4">
                <div className="flex flex-1 items-center gap-2 text-amber-200"><Coins size={18} /><b>{item.price.toLocaleString()}</b></div>
                {!item.owned ? (
                  <button type="button" onClick={() => session?.user?.email && void run(() => purchaseItem(session.user!.email!, item.id))} disabled={!canBuy || isProcessing} className="guild-button px-5">
                    <Lock size={16} />購入
                  </button>
                ) : (
                  <button type="button" onClick={() => item.dbId && session?.user?.email && void run(() => equipItem(session.user!.email!, item.dbId!))} disabled={isProcessing || item.equipped} className="guild-button px-5">
                    {item.equipped ? "装備中" : "装備する"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
