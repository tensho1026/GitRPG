import { NextResponse } from "next/server";
import { getCurrentUserBattleStatus } from "../../../../actions/user/status/getCurrentUserBattleStatus";
import { getUserCurrentItems } from "../../../../actions/item/getUserCurrentitems";
import { supabase } from "../../../../supabase/supabase.config";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params; // ✅ Promise を await する

  try {
    // Find user by name
    const { data: user, error: userError } = await supabase
      .from("Users")
      .select("id, name")
      .eq("name", name)
      .single();

    if (userError || !user) {
      return new NextResponse("User Not Found", { status: 404 });
    }

    // Get user status
    const { data: userStatus, error: statusError } = await supabase
      .from("UserStatus")
      .select("level")
      .eq("userId", user.id)
      .single();

    if (statusError) {
      console.error("Failed to fetch user status:", statusError);
      return new NextResponse("User status not found", { status: 404 });
    }

    // Get battle status
    const battleStatus = await getCurrentUserBattleStatus(user.id);
    const level = userStatus?.level || 1;

    // Get equipped items
    const equippedItems = await getUserCurrentItems(user.id);

    // Get weapon and armor info
    const weapon = equippedItems.find((item) => item.type === "weapon") || null;
    const armor = equippedItems.find((item) => item.type === "armor") || null;

    // Generate RPG-style SVG
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="280">
      <defs>
        <style>
          .pixel-font { font-family: 'Courier New', monospace; font-weight: bold; }
          .title { font-size: 18px; fill: #ffffff; text-shadow: 2px 2px 0px #000000; }
          .label { font-size: 12px; fill: #ffffff; text-shadow: 1px 1px 0px #000000; }
          .value { font-size: 14px; fill: #ffff00; text-shadow: 1px 1px 0px #000000; }
          .stat-value { font-size: 16px; fill: #00ff00; text-shadow: 1px 1px 0px #000000; }
          .item-name { font-size: 11px; fill: #ffffff; text-shadow: 1px 1px 0px #000000; }
        </style>
        <!-- Pixel-art patterns -->
        <pattern id="grass" patternUnits="userSpaceOnUse" width="20" height="20">
          <rect width="20" height="20" fill="#4a7c4a"/>
          <rect x="0" y="0" width="5" height="5" fill="#5a8c5a"/>
          <rect x="10" y="5" width="5" height="5" fill="#5a8c5a"/>
          <rect x="5" y="10" width="5" height="5" fill="#5a8c5a"/>
          <rect x="15" y="15" width="5" height="5" fill="#5a8c5a"/>
        </pattern>
      </defs>
      
      <!-- Background with pixel grass pattern -->
      <rect width="500" height="280" fill="url(#grass)"/>
      
      <!-- Main status panel (blue) -->
      <rect x="20" y="20" width="280" height="120" rx="8" fill="#1e3a8a" stroke="#3b82f6" stroke-width="3"/>
      <rect x="25" y="25" width="270" height="110" rx="5" fill="#1e40af" opacity="0.8"/>
      
      <!-- Character info -->
      <text x="35" y="45" class="pixel-font title">👤 ${user.name}</text>
      <text x="35" y="65" class="pixel-font label">Level:</text>
      <text x="85" y="65" class="pixel-font value">Lv.${level}</text>
      <text x="35" y="85" class="pixel-font label">Commits:</text>
      <text x="95" y="85" class="pixel-font value">${
        battleStatus.commit || 0
      }</text>
      <text x="35" y="105" class="pixel-font label">Coins:</text>
      <text x="85" y="105" class="pixel-font value">💰${
        battleStatus.coin || 0
      }</text>
      
      <!-- Stats panel (purple) -->
      <rect x="320" y="20" width="160" height="120" rx="8" fill="#7c2d91" stroke="#a855f7" stroke-width="3"/>
      <rect x="325" y="25" width="150" height="110" rx="5" fill="#8b3aa0" opacity="0.8"/>
      
      <text x="335" y="45" class="pixel-font title">⚔️ Status</text>
      <text x="335" y="65" class="pixel-font label">HP:</text>
      <text x="365" y="65" class="pixel-font stat-value">${
        battleStatus.totalStats.hp
      }</text>
      <text x="335" y="85" class="pixel-font label">ATK:</text>
      <text x="365" y="85" class="pixel-font stat-value">${
        battleStatus.totalStats.attack
      }</text>
      <text x="335" y="105" class="pixel-font label">DEF:</text>
      <text x="365" y="105" class="pixel-font stat-value">${
        battleStatus.totalStats.defense
      }</text>
      
      <!-- Equipment panel (red) -->
      <rect x="20" y="160" width="230" height="100" rx="8" fill="#991b1b" stroke="#ef4444" stroke-width="3"/>
      <rect x="25" y="165" width="220" height="90" rx="5" fill="#b91c1c" opacity="0.8"/>
      
      <text x="35" y="185" class="pixel-font title">🛡️ Equipment</text>
      <text x="35" y="205" class="pixel-font label">Weapon:</text>
      <text x="35" y="220" class="pixel-font item-name">${
        weapon ? `⚔️ ${weapon.name}` : "❌ None"
      }</text>
      <text x="35" y="235" class="pixel-font label">Armor:</text>
      <text x="35" y="250" class="pixel-font item-name">${
        armor ? `🛡️ ${armor.name}` : "❌ None"
      }</text>
      
      <!-- Avatar panel (green) -->
      <rect x="270" y="160" width="210" height="100" rx="8" fill="#166534" stroke="#22c55e" stroke-width="3"/>
      <rect x="275" y="165" width="200" height="90" rx="5" fill="#16a34a" opacity="0.8"/>
      
      <text x="285" y="185" class="pixel-font title">🎭 Avatar</text>
      <text x="285" y="205" class="pixel-font label">Equipped:</text>
      <text x="285" y="220" class="pixel-font item-name">${
        battleStatus.equippedAvatar
          ? `👤 ${battleStatus.equippedAvatar.name}`
          : "❌ Default"
      }</text>
      <text x="285" y="240" class="pixel-font label">Bonus:</text>
      <text x="285" y="255" class="pixel-font item-name">${
        battleStatus.equippedAvatar
          ? `+${battleStatus.equippedAvatar.attack || 0} ATK, +${
              battleStatus.equippedAvatar.defense || 0
            } DEF`
          : "None"
      }</text>
      
      <!-- Decorative border -->
      <rect x="0" y="0" width="500" height="280" rx="10" fill="none" stroke="#fbbf24" stroke-width="4"/>
      <rect x="5" y="5" width="490" height="270" rx="8" fill="none" stroke="#f59e0b" stroke-width="2"/>
    </svg>
  `;

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error fetching user status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
