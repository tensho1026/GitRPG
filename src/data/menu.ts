import { Sword, Calendar, Target, Crown } from "lucide-react";

export const menuItems = [
  {
    href: "/avatar",
    icon: Crown,
    title: "アバター",
    description: "キャラクター選択",
    bgColor: "#7c3aed",
    borderColor: "#a78bfa",
    shadowColor: "#5b21b6",
    descriptionColor: "text-purple-200",
  },
  {
    href: "/battle",
    icon: Target,
    title: "戦闘",
    description: "HP・攻撃力・防御力",
    bgColor: "#ea580c",
    borderColor: "#fb923c",
    shadowColor: "#c2410c",
    descriptionColor: "text-orange-200",
  },
  {
    href: "/item",
    icon: Sword,
    title: "装備",
    description: "武器・防具の購入・装備",
    bgColor: "#dc2626",
    borderColor: "#f87171",
    shadowColor: "#991b1b",
    descriptionColor: "text-red-200",
  },
  {
    href: "/grass",
    icon: Calendar,
    title: "草",
    description: "コミット履歴・活動記録",
    bgColor: "#059669",
    borderColor: "#34d399",
    shadowColor: "#047857",
    descriptionColor: "text-green-200",
  },
];
