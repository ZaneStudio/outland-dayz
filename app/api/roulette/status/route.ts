import { NextResponse } from "next/server";
import { getSteamSession } from "@/lib/steam-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSteamSession();
  if (!user) return NextResponse.json({ minutes: 0, authenticated: false });

  const endpoint = process.env.DAYZ_PLAYTIME_API_URL;
  if (!endpoint) return NextResponse.json({ minutes: 0, authenticated: true, source: "not-configured" });

  try {
    const url = new URL(endpoint);
    url.searchParams.set("steamId", user.steamId);
    const response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
    const data = await response.json();
    const minutes = Number(data.minutes ?? data.playtimeMinutes ?? 0);
    return NextResponse.json({ minutes: Number.isFinite(minutes) ? Math.max(0, Math.floor(minutes)) : 0, authenticated: true, source: "server" });
  } catch {
    return NextResponse.json({ minutes: 0, authenticated: true, source: "unavailable" });
  }
}
