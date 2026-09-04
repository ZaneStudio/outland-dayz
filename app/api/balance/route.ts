import { NextRequest, NextResponse } from "next/server";
import { getSteamSession } from "@/lib/steam-auth";
import { getBalance, updateBalance } from "@/lib/balance-store"; // Додаємо функцію оновлення балансу

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSteamSession();
  if (!user) return NextResponse.json({ error: "Увійдіть через Steam" }, { status: 401 });
  const balance = await getBalance(user.steamId);
  return NextResponse.json({ balance });
}

export async function POST(req: NextRequest) {
  const user = await getSteamSession();
  if (!user) return NextResponse.json({ error: "Увійдіть через Steam" }, { status: 401 });

  try {
    const body = await req.json();
    const { action, amount } = body;

    if (action === 'spend' && amount > 0) {
      const currentBalance = await getBalance(user.steamId);
      
      if (currentBalance < amount) {
        return NextResponse.json({ error: "Недостатньо коштів" }, { status: 400 });
      }

      const newBalance = currentBalance - amount;
      await updateBalance(user.steamId, newBalance);

      return NextResponse.json({ success: true, balance: newBalance });
    }

    return NextResponse.json({ error: "Невідома дія" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}