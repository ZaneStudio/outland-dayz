import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // Перевірка OpenID від Steam
    const mode = searchParams.get("openid.mode");
    if (mode !== "id_res") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Витягуємо SteamID з claimed_id
    const claimedId = searchParams.get("openid.claimed_id") || "";
    const steamIdMatch = claimedId.match(/\/id\/([0-9]{17})/) || claimedId.match(/\/openid\/id\/([0-9]{17})/);
    
    let steamId = steamIdMatch ? steamIdMatch[1] : null;

    if (!steamId) {
      const assertedId = searchParams.get("openid.identity");
      const matchAlt = assertedId ? assertedId.match(/\/([0-9]{17})$/) : null;
      if (matchAlt) steamId = matchAlt[1];
    }

    if (!steamId) {
      return NextResponse.redirect(new URL("/?error=invalid_steam_id", req.url));
    }

    // Запит до Steam API для отримання нікнейма та аватарки гравця
    const apiKey = process.env.STEAM_API_KEY;
    let username = "Гравець Steam";
    let avatar = null;

    if (apiKey) {
      try {
        const steamRes = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`);
        if (steamRes.ok) {
          const steamData = await steamRes.json();
          const player = steamData.response?.players?.[0];
          if (player) {
            username = player.personaname || username;
            avatar = player.avatarfull || player.avatarmedium || player.avatar || null;
          }
        }
      } catch (err) {
        console.error("Failed to fetch Steam profile data:", err);
      }
    }

    // Автоматично зберігаємо або оновлюємо гравця в базі відвідувачів
    try {
      await db.steamVisitor.upsert({
        where: { steamId: steamId },
        update: {
          username: username,
          avatar: avatar,
          lastSeen: new Date(),
        },
        create: {
          steamId: steamId,
          username: username,
          avatar: avatar,
        },
      });
    } catch (dbErr) {
      console.error("Failed to save Steam visitor to DB:", dbErr);
    }

    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.set("steam_id", steamId, { httpOnly: true, secure: true, path: "/" });

    return response;
  } catch (error) {
    console.error("Steam callback error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", req.url));
  }
}