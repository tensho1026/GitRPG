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
    <svg xmlns="http://www.w3.org/2000/svg" width="550" height="320">
      <defs>
        <style>
          .pixel-font { font-family: 'Courier New', monospace; font-weight: bold; }
          .main-title { font-size: 24px; fill: #ffd700; text-shadow: 3px 3px 0px #000000; }
          .subtitle { font-size: 14px; fill: #ffffff; text-shadow: 2px 2px 0px #000000; }
          .title { font-size: 16px; fill: #ffffff; text-shadow: 2px 2px 0px #000000; }
          .label { font-size: 12px; fill: #ffffff; text-shadow: 1px 1px 0px #000000; }
          .value { font-size: 14px; fill: #ffff00; text-shadow: 1px 1px 0px #000000; }
          .stat-value { font-size: 16px; fill: #00ff00; text-shadow: 1px 1px 0px #000000; }
          .item-name { font-size: 11px; fill: #ffffff; text-shadow: 1px 1px 0px #000000; }
          .domain { font-size: 10px; fill: #87ceeb; text-shadow: 1px 1px 0px #000000; }
        </style>
        <!-- Pixel-art patterns -->
        <pattern id="grass" patternUnits="userSpaceOnUse" width="20" height="20">
          <rect width="20" height="20" fill="#2d5016"/>
          <rect x="0" y="0" width="5" height="5" fill="#3d6020"/>
          <rect x="10" y="5" width="5" height="5" fill="#3d6020"/>
          <rect x="5" y="10" width="5" height="5" fill="#4d7030"/>
          <rect x="15" y="15" width="5" height="5" fill="#3d6020"/>
        </pattern>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#4c1d95;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e1b4b;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background with pixel grass pattern -->
      <rect width="550" height="320" fill="url(#grass)"/>
      
      <!-- Header panel with title -->
      <rect x="10" y="10" width="530" height="60" rx="12" fill="url(#headerGrad)" stroke="#ffd700" stroke-width="3"/>
      <rect x="15" y="15" width="520" height="50" rx="8" fill="#3730a3" opacity="0.7"/>
      
      <!-- Game title and subtitle -->
      <text x="275" y="35" class="pixel-font main-title" text-anchor="middle">🎮 Git-RPG</text>
      <text x="275" y="50" class="pixel-font subtitle" text-anchor="middle">RPG Developer Quest - コードを書いてレベルアップ！</text>
      <text x="275" y="62" class="pixel-font domain" text-anchor="middle">🌐 git-game.vercel.app</text>
      
      <!-- Character panel (blue) -->
      <rect x="20" y="80" width="260" height="110" rx="8" fill="#1e3a8a" stroke="#3b82f6" stroke-width="3"/>
      <rect x="25" y="85" width="250" height="100" rx="5" fill="#1e40af" opacity="0.8"/>
      
      <!-- Character info -->
      <text x="35" y="105" class="pixel-font title">👤 ${user.name}</text>
      <text x="35" y="125" class="pixel-font label">Level:</text>
      <text x="85" y="125" class="pixel-font value">Lv.${level}</text>
      <text x="35" y="145" class="pixel-font label">Commits:</text>
      <text x="95" y="145" class="pixel-font value">${
        battleStatus.commit || 0
      }</text>
      <text x="35" y="165" class="pixel-font label">Coins:</text>
      <text x="85" y="165" class="pixel-font value">💰${
        battleStatus.coin || 0
      }</text>
      
      <!-- Stats panel (purple) -->
      <rect x="300" y="80" width="230" height="110" rx="8" fill="#7c2d91" stroke="#a855f7" stroke-width="3"/>
      <rect x="305" y="85" width="220" height="100" rx="5" fill="#8b3aa0" opacity="0.8"/>
      
      <text x="315" y="105" class="pixel-font title">⚔️ Battle Status</text>
      <text x="315" y="125" class="pixel-font label">HP:</text>
      <text x="345" y="125" class="pixel-font stat-value">${
        battleStatus.totalStats.hp
      }</text>
      <text x="315" y="145" class="pixel-font label">ATK:</text>
      <text x="345" y="145" class="pixel-font stat-value">${
        battleStatus.totalStats.attack
      }</text>
      <text x="315" y="165" class="pixel-font label">DEF:</text>
      <text x="345" y="165" class="pixel-font stat-value">${
        battleStatus.totalStats.defense
      }</text>
      
      <!-- Equipment panel (red) -->
      <rect x="20" y="210" width="250" height="90" rx="8" fill="#991b1b" stroke="#ef4444" stroke-width="3"/>
      <rect x="25" y="215" width="240" height="80" rx="5" fill="#b91c1c" opacity="0.8"/>
      
      <text x="35" y="235" class="pixel-font title">🛡️ Equipment</text>
      <text x="35" y="255" class="pixel-font label">Weapon:</text>
      <text x="35" y="270" class="pixel-font item-name">${
        weapon ? `⚔️ ${weapon.name} (+${weapon.attack || 0} ATK)` : "❌ None"
      }</text>
      <text x="35" y="285" class="pixel-font label">Armor:</text>
      <text x="35" y="300" class="pixel-font item-name">${
        armor ? `🛡️ ${armor.name} (+${armor.defense || 0} DEF)` : "❌ None"
      }</text>
      
      <!-- Avatar panel (green) -->
      <rect x="290" y="210" width="240" height="90" rx="8" fill="#166534" stroke="#22c55e" stroke-width="3"/>
      <rect x="295" y="215" width="230" height="80" rx="5" fill="#16a34a" opacity="0.8"/>
      
      <text x="305" y="235" class="pixel-font title">🎭 Avatar</text>
      <text x="305" y="255" class="pixel-font label">Equipped:</text>
      <text x="305" y="270" class="pixel-font item-name">${
        battleStatus.equippedAvatar
          ? `👤 ${battleStatus.equippedAvatar.name}`
          : "❌ Default Avatar"
      }</text>
      <text x="305" y="285" class="pixel-font label">Bonus:</text>
      <text x="305" y="300" class="pixel-font item-name">${
        battleStatus.equippedAvatar
          ? `HP+${battleStatus.equippedAvatar.hp || 0} ATK+${
              battleStatus.equippedAvatar.attack || 0
            } DEF+${battleStatus.equippedAvatar.defense || 0}`
          : "No Bonus"
      }</text>
      
      <!-- Decorative borders -->
      <rect x="0" y="0" width="550" height="320" rx="15" fill="none" stroke="#ffd700" stroke-width="4"/>
      <rect x="3" y="3" width="544" height="314" rx="12" fill="none" stroke="#f59e0b" stroke-width="2"/>
      
      <!-- Corner decorations -->
      <circle cx="25" cy="25" r="8" fill="#ffd700" opacity="0.8"/>
      <circle cx="525" cy="25" r="8" fill="#ffd700" opacity="0.8"/>
      <circle cx="25" cy="295" r="8" fill="#ffd700" opacity="0.8"/>
      <circle cx="525" cy="295" r="8" fill="#ffd700" opacity="0.8"/>
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
