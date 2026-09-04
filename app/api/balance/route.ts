import { NextRequest, NextResponse } from "next/server";
import { getSteamSession } from "@/lib/steam-auth";
import { getBalance, creditBalance } from "@/lib/balance-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSteamSession();
  if (!user) return NextResponse.json({ error: "Увійдіть через Steam" }, { status: 401 });
  const data = await getBalance(user.steamId);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await getSteamSession();
  if (!user) return NextResponse.json({ error: "Увійдіть через Steam" }, { status: 401 });

  try {
    const body = await req.json();
    const { action, amount } = body;

    if (action === 'spend' && amount > 0) {
      const accountData = await getBalance(user.steamId);
      const currentBalance = accountData.balance;
      
      if (currentBalance < amount) {
        return NextResponse.json({ error: "Недостатньо коштів" }, { status: 400 });
      }

      // Передаємо від'ємну суму в creditBalance, щоб списати кошти та зберегти транзакцію в базі
      const txId = `spend-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const updatedAccount = await creditBalance(user.steamId, -amount, "Покупка в магазині", txId);

      if (!updatedAccount) {
        return NextResponse.json({ error: "Помилка транзакції" }, { status: 400 });
      }

      return NextResponse.json({ success: true, balance: updatedAccount.balance });
    }

    return NextResponse.json({ error: "Невідома дія" }, { status: 400 });
  } catch (error) {
    console.error("Balance POST error:", error);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}