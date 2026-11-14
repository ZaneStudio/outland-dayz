import { randomBytes, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRequestUser } from "@/lib/launcher-auth";
import { getManagedProducts } from "@/lib/product-store";
import { deliverPromoCodeToServer } from "@/lib/server-delivery";

export const dynamic = "force-dynamic";

class InsufficientBalance extends Error {}

export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Увійдіть через Steam" }, { status: 401 });
  try {
    const { productId } = await req.json();
    if (typeof productId !== "string" || !productId) {
      return NextResponse.json({ error: "Не вказано товар" }, { status: 400 });
    }
    const product = (await getManagedProducts()).find((item) => item.id === productId);
    if (!product) return NextResponse.json({ error: "Товар не знайдено" }, { status: 404 });
    if (!Number.isInteger(product.price) || product.price <= 0) {
      return NextResponse.json({ error: "Некоректна ціна товару" }, { status: 400 });
    }

    const code = `OUT-${randomBytes(2).toString("hex").toUpperCase()}-${randomBytes(2)
      .toString("hex")
      .toUpperCase()}`;
    const orderId = `UDZ-${Date.now().toString().slice(-6)}-${randomBytes(2)
      .toString("hex")
      .toUpperCase()}`;
    const debitId = `launcher-buy-${randomUUID()}`;

    await db.$transaction(async (tx) => {
      await tx.steamAccount.upsert({
        where: { steamId: user.steamId },
        update: {},
        create: { steamId: user.steamId },
      });
      const changed = await tx.steamAccount.updateMany({
        where: { steamId: user.steamId, balance: { gte: product.price } },
        data: { balance: { decrement: product.price } },
      });
      if (changed.count !== 1) throw new InsufficientBalance();
      await tx.balanceTransaction.create({
        data: {
          id: debitId,
          steamId: user.steamId,
          amount: -product.price,
          reason: `Покупка: ${product.name}`,
        },
      });
      await tx.purchaseLog.create({
        data: {
          orderId,
          steamId: user.steamId,
          username: user.name,
          productName: product.name,
          price: product.price,
          code,
        },
      });
    });

    let deliveryMethod = "none";
    try {
      const delivery = await deliverPromoCodeToServer(code, [
        { Classname: product.classname?.trim() || product.name },
      ]);
      if (!delivery.ok) {
        throw new Error(delivery.error || "Помилка доставки на ігровий сервер");
      }
      deliveryMethod = delivery.method;
    } catch (deliveryError) {
      await db.$transaction(async (tx) => {
        await tx.steamAccount.update({
          where: { steamId: user.steamId },
          data: { balance: { increment: product.price } },
        });
        await tx.balanceTransaction.create({
          data: {
            id: `refund-${randomUUID()}`,
            steamId: user.steamId,
            amount: product.price,
            reason: `Повернення: ${product.name}`,
          },
        });
        await tx.purchaseLog.deleteMany({ where: { orderId } });
      });
      throw deliveryError;
    }

    const account = await db.steamAccount.findUnique({
      where: { steamId: user.steamId },
      select: { balance: true },
    });
    return NextResponse.json({
      success: true,
      delivered: true,
      deliveryMethod,
      code,
      orderId,
      balance: account?.balance ?? 0,
      item: { id: product.id, name: product.name, price: product.price },
    });
  } catch (error) {
    if (error instanceof InsufficientBalance) {
      return NextResponse.json({ error: "Недостатньо коштів" }, { status: 400 });
    }
    console.error("Launcher purchase error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Помилка покупки" },
      { status: 500 }
    );
  }
}
