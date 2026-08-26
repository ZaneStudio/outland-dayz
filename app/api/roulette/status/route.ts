import { NextResponse } from "next/server";
import { getSteamSession } from "@/lib/steam-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSteamSession();
  if (!user) return NextResponse.json({ minutes: 0, rouletteSpins: 0, authenticated: false });
  const account = await db.steamAccount.upsert({ where: { steamId: user.steamId }, update: {}, create: { steamId: user.steamId } });
  return NextResponse.json({ minutes: account.playtimeMinutes, rouletteSpins: account.rouletteSpins, authenticated: true, source: "database" });
}
