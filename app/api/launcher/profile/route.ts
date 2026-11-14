import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRequestUser } from "@/lib/launcher-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Увійдіть через Steam" }, { status: 401 });

  const isLite = req.nextUrl.searchParams.get("lite") === "1";

  try {
    if (isLite) {
      const [account, purchases] = await Promise.all([
        db.steamAccount.findUnique({
          where: { steamId: user.steamId },
          select: {
            balance: true,
            playtimeMinutes: true,
            rouletteSpins: true,
            createdAt: true,
            vip: {
              select: {
                expiresAt: true,
                plan: { select: { name: true } },
              },
            },
          },
        }),
        db.purchaseLog.findMany({
          where: { steamId: user.steamId },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
      ]);

      if (!account) {
        void db.steamAccount
          .upsert({
            where: { steamId: user.steamId },
            update: {},
            create: { steamId: user.steamId },
          })
          .catch(() => {});
      }

      return NextResponse.json(
        {
          user,
          account: {
            balance: account?.balance ?? 0,
            playtimeMinutes: account?.playtimeMinutes ?? 0,
            rouletteSpins: account?.rouletteSpins ?? 0,
            createdAt: account?.createdAt ?? new Date(),
          },
          vip: null,
          purchases,
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const [account, purchases] = await Promise.all([
      db.steamAccount.findUnique({
        where: { steamId: user.steamId },
        include: {
          vip: { include: { plan: true } },
          transactions: { orderBy: { createdAt: "desc" }, take: 20 },
          promoUses: { include: { promo: true }, orderBy: { createdAt: "desc" }, take: 20 },
        },
      }),
      db.purchaseLog.findMany({
        where: { steamId: user.steamId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    if (!account) {
      void db.steamAccount
        .upsert({
          where: { steamId: user.steamId },
          update: {},
          create: { steamId: user.steamId },
        })
        .catch(() => {});
    }

    return NextResponse.json(
      {
        user,
        account: {
          balance: account?.balance ?? 0,
          playtimeMinutes: account?.playtimeMinutes ?? 0,
          rouletteSpins: account?.rouletteSpins ?? 0,
          createdAt: account?.createdAt ?? new Date(),
        },
        vip: null,
        purchases,
        promoUses: (account?.promoUses ?? []).map((use) => ({
          id: use.id,
          code: use.promo.code,
          amount: use.promo.amount,
          createdAt: use.createdAt,
        })),
        transactions: account?.transactions ?? [],
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      {
        user,
        account: { balance: 0, playtimeMinutes: 0, rouletteSpins: 0, createdAt: new Date() },
        vip: null,
        purchases: [],
        promoUses: [],
        transactions: [],
        degraded: true,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
