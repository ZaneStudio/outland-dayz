import { NextRequest, NextResponse } from "next/server";
import { getSteamSession } from "@/lib/steam-auth";
import { purchaseVipPlan } from "@/lib/vip-store";

export async function POST(request: NextRequest) {
  const user = await getSteamSession();
  if (!user) return NextResponse.json({ error: "Увійдіть через Steam." }, { status: 401 });
  const { planId } = await request.json();
  if (!planId || typeof planId !== "string") return NextResponse.json({ error: "Оберіть VIP-пакет." }, { status: 400 });
  const result = await purchaseVipPlan(user.steamId, planId);
  return "error" in result ? NextResponse.json(result, { status: 400 }) : NextResponse.json(result);
}
