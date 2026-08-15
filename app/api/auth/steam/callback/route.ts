import { NextRequest, NextResponse } from "next/server";
import { encodeSteamSession, steamSessionCookie } from "@/lib/steam-auth";

export async function GET(request: NextRequest) {
  try {
    const received = new URLSearchParams(request.nextUrl.searchParams);
    const claimedId = received.get("openid.claimed_id") || "";
    const steamId = claimedId.match(/\/id\/(\d+)$/)?.[1];
    if (!steamId) return NextResponse.redirect(new URL("/login?error=steam", request.url));

    received.set("openid.mode", "check_authentication");
    const verified = await fetch("https://steamcommunity.com/openid/login", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: received.toString(), cache: "no-store" });
    if (!verified.ok || !(await verified.text()).includes("is_valid:true")) return NextResponse.redirect(new URL("/login?error=verification", request.url));

    let name = `Steam #${steamId.slice(-6)}`, avatar = "";
    if (process.env.STEAM_API_KEY) {
      const profile = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`, { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null);
      const player = profile?.response?.players?.[0];
      if (player) { name = player.personaname || name; avatar = player.avatarfull || ""; }
    }

    const response = NextResponse.redirect(new URL("/profile", request.url));
    response.cookies.set(steamSessionCookie, encodeSteamSession({ steamId, name, avatar }), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return response;
  } catch { return NextResponse.redirect(new URL("/login?error=connection", request.url)); }
}
