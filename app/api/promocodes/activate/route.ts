import { NextRequest, NextResponse } from "next/server";
import { getSteamSession } from "@/lib/steam-auth";
import { activatePromoCode } from "@/lib/promo-store";

export async function POST(request: NextRequest) {
  const user = await getSteamSession();
  if (!user) return NextResponse.json({ error: "Увійдіть через Steam" }, { status: 401 });

  const body = await request.json();
  const result = await activatePromoCode(String(body.code || ""), user.steamId);

  if ("error" in result) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json({ success: true, amount: result.amount });
}