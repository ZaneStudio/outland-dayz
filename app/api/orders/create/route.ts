import { randomBytes, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSteamSession } from "@/lib/steam-auth";
import { getManagedProducts } from "@/lib/product-store";
import { creditBalance } from "@/lib/balance-store";
import { deliverPromoCodeToServer, type DeliveryRewardItem } from "@/lib/server-delivery";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getSteamSession();
  if (!user) return NextResponse.json({ error: "Увійдіть через Steam" }, { status: 401 });

  try {
    const body = await req.json();
    const items = body.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Невірні дані замовлення" }, { status: 400 });
    }

    // Генеруємо код у форматі: OUT-XXXX-XXXX
    const part1 = randomBytes(2).toString("hex").toUpperCase();
    const part2 = randomBytes(2).toString("hex").toUpperCase();
    const code =
      typeof body.code === "string" && body.code.startsWith("OUT-")
        ? body.code
        : `OUT-${part1}-${part2}`;
    const orderId =
      typeof body.orderId === "string" && body.orderId
        ? body.orderId
        : `UDZ-${Date.now().toString().slice(-6)}`;

    const allProducts = await getManagedProducts();
    const rewards: DeliveryRewardItem[] = [];
    let verifiedTotal = 0;

    for (const item of items) {
      const count = Math.max(1, Number(item.quantity) || 1);
      const dbProduct = allProducts.find((p) => p.id === item.id);
      const unitPrice = dbProduct ? dbProduct.price : Number(item.price) || 0;
      verifiedTotal += unitPrice * count;

      const gameClassname =
        dbProduct && dbProduct.classname && dbProduct.classname.trim() !== ""
          ? dbProduct.classname.trim()
          : String(item.name || "Item").trim();

      for (let i = 0; i < count; i++) {
        rewards.push({
          isVehicle: 0,
          Classname: gameClassname,
          QuantityPercent: -1,
          HealthPercent: -1,
          Attachments: [],
        });
      }
    }

    const delivery = await deliverPromoCodeToServer(code, rewards);

    if (!delivery.ok) {
      console.error("Server auto-delivery failed:", delivery);
      let refundedBalance: number | undefined;
      if (verifiedTotal > 0) {
        const refund = await creditBalance(
          user.steamId,
          verifiedTotal,
          "Повернення: помилка автовидачі на сервер",
          `refund-order-${randomUUID()}`
        );
        refundedBalance = refund?.balance;
      }

      return NextResponse.json(
        {
          success: false,
          delivered: false,
          refunded: verifiedTotal > 0,
          balance: refundedBalance,
          error:
            "Не вдалося доставити товар на ігровий сервер. Кошти повернуто на баланс.",
          detail: delivery.error,
        },
        { status: 502 }
      );
    }

    // Зберігаємо історію покупок у базу даних
    for (const item of items) {
      const count = Math.max(1, Number(item.quantity) || 1);
      const dbProduct = allProducts.find((p) => p.id === item.id);
      const unitPrice = dbProduct ? dbProduct.price : Number(item.price) || 0;
      const itemTotal = unitPrice * count;

      await db.purchaseLog.create({
        data: {
          orderId,
          steamId: user.steamId || "unknown",
          username: user.name || "Гравець",
          productName: dbProduct?.name || item.name || "Товар",
          price: itemTotal,
          code,
        },
      });
    }

    return NextResponse.json({
      success: true,
      delivered: true,
      deliveryMethod: delivery.method,
      code,
      orderId,
    });
  } catch (error) {
    console.error("Order creation API error:", error);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
