"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Crown, Home, ShieldCheck, Swords } from "lucide-react";

const navigationItems = [
  { href: "/home", label: "ホーム", shortLabel: "ホーム", icon: Home },
  { href: "/game", label: "バトル", shortLabel: "戦う", icon: Swords },
  { href: "/item", label: "装備", shortLabel: "装備", icon: ShieldCheck },
  { href: "/avatar", label: "アバター", shortLabel: "姿", icon: Crown },
  { href: "/grass", label: "冒険の足跡", shortLabel: "足跡", icon: CalendarDays },
] as const;

export default function GuildNavigation() {
  const pathname = usePathname();

  return (
    <>
      <nav className="guild-desktop-nav mb-4" aria-label="メインメニュー">
        {navigationItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className="guild-desktop-nav__item">
              <Icon aria-hidden="true" className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <nav className="guild-mobile-nav" aria-label="メインメニュー">
        {navigationItems.map(({ href, shortLabel, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className="guild-mobile-nav__item">
              <Icon aria-hidden="true" className="h-5 w-5" />
              <span>{shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
