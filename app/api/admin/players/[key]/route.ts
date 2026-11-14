import { NextRequest, NextResponse } from "next/server";
import { currentAdmin } from "@/lib/admin";
import { getAdminPlayerDetail } from "@/lib/admin-players";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ заборонено" }, { status: 403 });
  }

  const { key } = await context.params;
  const detail = await getAdminPlayerDetail(key);
  if (!detail) {
    return NextResponse.json({ error: "Гравця не знайдено" }, { status: 404 });
  }

  // Enrich Steam avatar/persona via Steam Web API if we have steamId but no cached avatar
  if (detail.summary.steamId && !detail.summary.avatar && process.env.STEAM_API_KEY) {
    try {
      const res = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${detail.summary.steamId}`,
        { cache: "no-store", signal: AbortSignal.timeout(3500) }
      );
      if (res.ok) {
        const json = await res.json();
        const player = json?.response?.players?.[0];
        if (player) {
          detail.summary.avatar = player.avatarfull || null;
        }
      }
    } catch {
      // Ignore Steam lookup failures
    }
  }

  return NextResponse.json(detail, { headers: { "Cache-Control": "no-store" } });
}
