"use client";

interface ItemTabsProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

export default function ItemTabs({ selectedTab, onTabChange }: ItemTabsProps) {
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
        className="grid grid-cols-4 gap-4 p-4 pixel-border"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          borderColor: "#fbbf24",
        }}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className="p-4 border-4 font-bold text-white pixel-text text-lg"
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
