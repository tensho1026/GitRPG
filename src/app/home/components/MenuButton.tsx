import Link from "next/link";
import React from "react";

interface MenuButtonProps {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  bgColor: string;
  borderColor: string;
  shadowColor: string;
  descriptionColor: string;
}

export default function MenuButton({
  href,
  icon: Icon,
  title,
  description,
  bgColor: _bgColor,
  borderColor: _borderColor,
  shadowColor: _shadowColor,
  descriptionColor,
}: MenuButtonProps) {
  return (
    <Link
      href={href}
      aria-label={`${title}: ${description}`}
      className="guild-nav-card focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-yellow-300">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center border border-amber-700/70 bg-black/25 text-amber-200"><Icon className="w-5 h-5" /></span>
          <span className="guild-title text-xl">{title}</span>
        </div>
        <p className={`${descriptionColor} font-mono text-xs opacity-75`}>{description}</p>
    </Link>
  );
}
