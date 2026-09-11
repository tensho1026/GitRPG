import { NextResponse } from "next/server";
import { getUserBattleStatusById } from "../../../../lib/userBattleStatus";
import { supabase } from "../../../../supabase/supabase.config";

export const runtime = "nodejs";

const escapeXml = (value: unknown) => String(value ?? "")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&apos;");

const clamp = (value: number, max: number) => Math.max(4, Math.min(100, (value / max) * 100));

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  try {
    const { data: user, error } = await supabase.from("Users").select("id, name").eq("name", name).single();
    if (error || !user) return new NextResponse("User Not Found", { status: 404 });

    const status = await getUserBattleStatusById(user.id);
    const level = status.level || 1;
    const weapon = status.equippedItems.find((item) => item.type === "weapon");
    const armor = status.equippedItems.find((item) => item.type === "armor");
    const avatar = status.equippedAvatar;
    const hp = status.totalStats.hp || 0;
    const attack = status.totalStats.attack || 0;
    const defense = status.totalStats.defense || 0;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="300" viewBox="0 0 680 300" role="img" aria-label="${escapeXml(user.name)} Git-RPG guild status">
      <defs>
        <linearGradient id="stone" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#343b36"/><stop offset="1" stop-color="#171d1a"/></linearGradient>
        <linearGradient id="green" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#214f3d"/><stop offset="1" stop-color="#17231e"/></linearGradient>
        <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#edddb4"/><stop offset="1" stop-color="#cbb17c"/></linearGradient>
        <pattern id="grain" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 1h8M0 6h8" stroke="#fff" stroke-opacity=".025"/></pattern>
        <filter id="shadow"><feDropShadow dx="0" dy="6" stdDeviation="5" flood-opacity=".5"/></filter>
        <style>
          .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.serif{font-family:Georgia,'Times New Roman',serif}
          .gold{fill:#f1cf78}.cream{fill:#fff4d3}.muted{fill:#aab1ab}.ink{fill:#292218}.label{font-size:10px;font-weight:700;letter-spacing:2px}.value{font-size:18px;font-weight:800}
        </style>
      </defs>
      <rect width="680" height="300" rx="4" fill="#0f1412"/>
      <rect x="3" y="3" width="674" height="294" rx="3" fill="url(#stone)" stroke="#c89a45" stroke-width="3"/>
      <rect x="10" y="10" width="660" height="280" fill="url(#grain)" stroke="#6f572f"/>
      <path d="M18 18h26v4H22v22h-4zM662 18h-26v4h22v22h4zM18 282h26v-4H22v-22h-4zM662 282h-26v-4h22v-22h4z" fill="#e8bd62"/>

      <g filter="url(#shadow)">
        <rect x="22" y="22" width="636" height="58" fill="url(#green)" stroke="#b88a40" stroke-width="2"/>
        <rect x="29" y="29" width="44" height="44" fill="#d2a453" stroke="#f1cf78"/>
        <path d="M42 61V42l9-7 9 7v19l-9-5z" fill="#173c2e"/><path d="M45 43l6 4 6-4v9l-6 4-6-4z" fill="#e9ce86"/>
        <text x="88" y="46" class="mono gold label">DEVELOPER'S GUILD / STATUS ARCHIVE</text>
        <text x="88" y="68" class="serif cream" font-size="24" font-weight="800">${escapeXml(user.name)}</text>
        <text x="630" y="58" text-anchor="end" class="mono gold" font-size="24" font-weight="900">LV. ${escapeXml(level)}</text>
      </g>

      <g filter="url(#shadow)">
        <rect x="22" y="92" width="294" height="184" fill="#151b18" stroke="#8c6a35" stroke-width="2"/>
        <text x="38" y="116" class="mono gold label">BATTLE STATUS</text>
        <text x="38" y="143" class="mono muted" font-size="12">HP</text><text x="288" y="143" text-anchor="end" class="mono cream value">${escapeXml(hp)}</text>
        <rect x="38" y="151" width="250" height="10" fill="#0a0e0c" stroke="#65502e"/><rect x="40" y="153" width="${clamp(hp, 500) * 2.46}" height="6" fill="#4c9a71"/>
        <text x="38" y="185" class="mono muted" font-size="12">ATK</text><text x="288" y="185" text-anchor="end" class="mono cream value">${escapeXml(attack)}</text>
        <rect x="38" y="193" width="250" height="10" fill="#0a0e0c" stroke="#65502e"/><rect x="40" y="195" width="${clamp(attack, 150) * 2.46}" height="6" fill="#a85145"/>
        <text x="38" y="227" class="mono muted" font-size="12">DEF</text><text x="288" y="227" text-anchor="end" class="mono cream value">${escapeXml(defense)}</text>
        <rect x="38" y="235" width="250" height="10" fill="#0a0e0c" stroke="#65502e"/><rect x="40" y="237" width="${clamp(defense, 150) * 2.46}" height="6" fill="#517b8c"/>
        <text x="38" y="264" class="mono gold" font-size="11">${escapeXml(status.commit || 0)} COMMITS</text>
        <text x="288" y="264" text-anchor="end" class="mono gold" font-size="11">${escapeXml(status.coin || 0)} COINS</text>
      </g>

      <g filter="url(#shadow)">
        <rect x="330" y="92" width="328" height="184" fill="url(#paper)" stroke="#9b7137" stroke-width="2"/>
        <path d="M338 100h312v168H338z" fill="none" stroke="#5b4328" stroke-opacity=".34"/>
        <text x="348" y="118" class="mono ink label">ADVENTURER LOADOUT</text>
        <path d="M348 128h290" stroke="#6b4b26" stroke-opacity=".45"/>
        <text x="348" y="151" class="mono ink" font-size="10" font-weight="700">WEAPON</text>
        <text x="348" y="169" class="serif ink" font-size="15" font-weight="800">${escapeXml(weapon?.name || "No weapon equipped")}</text>
        <text x="628" y="169" text-anchor="end" class="mono ink" font-size="11">ATK +${escapeXml(weapon?.attack || 0)}</text>
        <text x="348" y="196" class="mono ink" font-size="10" font-weight="700">ARMOR</text>
        <text x="348" y="214" class="serif ink" font-size="15" font-weight="800">${escapeXml(armor?.name || "No armor equipped")}</text>
        <text x="628" y="214" text-anchor="end" class="mono ink" font-size="11">DEF +${escapeXml(armor?.defense || 0)}</text>
        <text x="348" y="241" class="mono ink" font-size="10" font-weight="700">AVATAR</text>
        <text x="348" y="259" class="serif ink" font-size="15" font-weight="800">${escapeXml(avatar?.name || "Default adventurer")}</text>
        <circle cx="628" cy="246" r="14" fill="#264d3c" stroke="#8b6839" stroke-width="2"/><path d="M622 247l4 4 8-10" fill="none" stroke="#f1cf78" stroke-width="3"/>
      </g>
    </svg>`;

    return new NextResponse(svg, { status: 200, headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    console.error("Error fetching user status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
