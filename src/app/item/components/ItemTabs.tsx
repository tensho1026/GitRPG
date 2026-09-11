"use client";

import { useRef } from "react";

interface ItemTabsProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

export default function ItemTabs({ selectedTab, onTabChange }: ItemTabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tabs = [
    {
      value: "all",
      label: "すべて",
      color: "#8b5cf6",
      shadow: "#7c3aed",
    },
    {
      value: "weapon",
      label: "武器",
      color: "#ef4444",
      shadow: "#dc2626",
    },
    {
      value: "armor",
      label: "防具",
      color: "#3b82f6",
      shadow: "#1d4ed8",
    },
    {
      value: "accessory",
      label: "アクセサリー",
      color: "#22c55e",
      shadow: "#16a34a",
    },
  ];

  return (
    <div className="mb-6">
      <div
        role="tablist"
        aria-label="装備カテゴリ"
        className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 p-2 sm:p-4 pixel-border"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          borderColor: "#fbbf24",
        }}>
        {tabs.map((tab, index) => (
          <button
            key={tab.value}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            aria-selected={selectedTab === tab.value}
            aria-controls="equipment-panel"
            tabIndex={selectedTab === tab.value ? 0 : -1}
            onClick={() => onTabChange(tab.value)}
            onKeyDown={(event) => {
              const currentIndex = tabs.findIndex(
                (item) => item.value === selectedTab
              );
              let nextIndex = currentIndex;
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                nextIndex = (currentIndex + 1) % tabs.length;
              } else if (
                event.key === "ArrowLeft" ||
                event.key === "ArrowUp"
              ) {
                nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
              } else if (event.key === "Home") {
                nextIndex = 0;
              } else if (event.key === "End") {
                nextIndex = tabs.length - 1;
              } else {
                return;
              }
              event.preventDefault();
              const nextTab = tabs[nextIndex];
              onTabChange(nextTab.value);
              tabRefs.current[nextIndex]?.focus();
            }}
            className="touch-target p-3 sm:p-4 border-4 font-bold text-white pixel-text text-sm sm:text-lg"
            style={{
              backgroundColor:
                selectedTab === tab.value ? tab.color : "#4b5563",
              borderColor: selectedTab === tab.value ? "#ffffff" : "#6b7280",
              boxShadow:
                selectedTab === tab.value
                  ? `4px 4px 0px ${tab.shadow}, 8px 8px 0px rgba(0,0,0,0.4)`
                  : "3px 3px 0px #374151, 6px 6px 0px rgba(0,0,0,0.3)",
              cursor: "pointer",
              transition: "all 0.1s ease",
            }}>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
