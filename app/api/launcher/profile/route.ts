import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRequestUser } from "@/lib/launcher-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Увійдіть через Steam" }, { status: 401 });

  const [account, purchases, promoUses, vip] = await Promise.all([
    db.steamAccount.upsert({
      where: { steamId: user.steamId },
      update: {},
      create: { steamId: user.steamId },
      include: { transactions: { orderBy: { createdAt: "desc" }, take: 20 } }
    }),
    db.purchaseLog.findMany({ where: { steamId: user.steamId }, orderBy: { createdAt: "desc" }, take: 50 }),
    db.promoUse.findMany({ where: { steamId: user.steamId }, include: { promo: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.steamVip.findUnique({ where: { steamId: user.steamId }, include: { plan: true } })
  ]);

  return NextResponse.json({
    user,
    account: {
      balance: account.balance,
      playtimeMinutes: account.playtimeMinutes,
      rouletteSpins: account.rouletteSpins,
      createdAt: account.createdAt
    },
    vip: vip ? { name: vip.plan.name, expiresAt: vip.expiresAt } : null,
    purchases,
    promoUses: promoUses.map(use => ({ id: use.id, code: use.promo.code, amount: use.promo.amount, createdAt: use.createdAt })),
    transactions: account.transactions
  }, { headers: { "Cache-Control": "no-store" } });
}
