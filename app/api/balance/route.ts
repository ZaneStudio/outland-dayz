import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/launcher-auth";
import { getBalance, creditBalance } from "@/lib/balance-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Увійдіть через Steam" }, { status: 401 });
  return NextResponse.json(await getBalance(user.steamId), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Увійдіть через Steam" }, { status: 401 });
  try {
    const { action, amount } = await req.json();
    if (action === "spend" && Number.isInteger(amount) && amount > 0) {
      const account = await getBalance(user.steamId);
      if (account.balance < amount) return NextResponse.json({ error: "Недостатньо коштів" }, { status: 400 });
      const id = `spend-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const updated = await creditBalance(user.steamId, -amount, "Покупка в магазині", id);
      return updated
        ? NextResponse.json({ success: true, balance: updated.balance })
        : NextResponse.json({ error: "Помилка транзакції" }, { status: 409 });
    }
    return NextResponse.json({ error: "Невідома дія" }, { status: 400 });
  } catch (error) {
    console.error("Balance POST error:", error);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
