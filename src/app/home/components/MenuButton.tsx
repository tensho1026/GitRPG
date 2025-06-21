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
  bgColor,
  borderColor,
  shadowColor,
  descriptionColor,
}: MenuButtonProps) {
  return (
    <Link href={href}>
      <button
        className="p-6 border-4 font-bold pixel-text text-xl transform transition-all duration-200 hover:scale-105"
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          color: "white",
          boxShadow: `6px 6px 0px ${shadowColor}, 12px 12px 0px rgba(0,0,0,0.4)`,
        }}>
        <div className="flex items-center justify-center gap-3 mb-3">
          <Icon className="w-8 h-8" />
          <span className="text-2xl">{title}</span>
        </div>
        <p className={`${descriptionColor} text-sm`}>{description}</p>
      </button>
    </Link>
  );
}
