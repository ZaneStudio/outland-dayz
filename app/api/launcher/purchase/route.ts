import { randomBytes, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRequestUser } from "@/lib/launcher-auth";
import { getManagedProducts } from "@/lib/product-store";

export const dynamic = "force-dynamic";

class InsufficientBalance extends Error {}

async function deliverCode(code: string, classname: string) {
  const apiKey = process.env.PTERODACTYL_API_KEY;
  const serverId = process.env.PTERODACTYL_SERVER_ID;
  if (!apiKey || !serverId) throw new Error("Хостинг не налаштовано");
  const fileContent = JSON.stringify({
    maxUsages: 1,
    currentUsages: 0,
    blacklistedSteamIDS: [],
    rewards: [{ isVehicle: 0, Classname: classname, QuantityPercent: -1, HealthPercent: -1, Attachments: [] }]
  }, null, 2);
  const directory = "/profiles/FT_Mods/Promocodes_Free/Codes";
  const uploadUrlRes = await fetch(`https://console.uahost.eu/api/client/servers/${serverId}/files/upload`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" }
  });
  if (!uploadUrlRes.ok) throw new Error("Не вдалося підготувати видачу товару");
  const uploadData = await uploadUrlRes.json();
  const formData = new FormData();
  formData.append("files", new Blob([fileContent], { type: "application/json" }), `${code}.json`);
  const uploadRes = await fetch(`${uploadData.attributes.url}&directory=${encodeURIComponent(directory)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData
  });
  if (!uploadRes.ok) throw new Error("Не вдалося видати товар на сервері");
}

export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Увійдіть через Steam" }, { status: 401 });
  try {
    const { productId } = await req.json();
    if (typeof productId !== "string" || !productId) return NextResponse.json({ error: "Не вказано товар" }, { status: 400 });
    const product = (await getManagedProducts()).find(item => item.id === productId);
    if (!product) return NextResponse.json({ error: "Товар не знайдено" }, { status: 404 });
    if (!Number.isInteger(product.price) || product.price <= 0) return NextResponse.json({ error: "Некоректна ціна товару" }, { status: 400 });

    const code = `OUT-${randomBytes(2).toString("hex").toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;
    const orderId = `UDZ-${Date.now().toString().slice(-6)}-${randomBytes(2).toString("hex").toUpperCase()}`;
    const debitId = `launcher-buy-${randomUUID()}`;

    await db.$transaction(async tx => {
      await tx.steamAccount.upsert({ where: { steamId: user.steamId }, update: {}, create: { steamId: user.steamId } });
      const changed = await tx.steamAccount.updateMany({
        where: { steamId: user.steamId, balance: { gte: product.price } },
        data: { balance: { decrement: product.price } }
      });
      if (changed.count !== 1) throw new InsufficientBalance();
      await tx.balanceTransaction.create({ data: { id: debitId, steamId: user.steamId, amount: -product.price, reason: `Покупка: ${product.name}` } });
      await tx.purchaseLog.create({ data: { orderId, steamId: user.steamId, username: user.name, productName: product.name, price: product.price, code } });
    });

    try {
      await deliverCode(code, product.classname?.trim() || product.name);
    } catch (deliveryError) {
      await db.$transaction(async tx => {
        await tx.steamAccount.update({ where: { steamId: user.steamId }, data: { balance: { increment: product.price } } });
        await tx.balanceTransaction.create({ data: { id: `refund-${randomUUID()}`, steamId: user.steamId, amount: product.price, reason: `Повернення: ${product.name}` } });
        await tx.purchaseLog.deleteMany({ where: { orderId } });
      });
      throw deliveryError;
    }

    const account = await db.steamAccount.findUnique({ where: { steamId: user.steamId }, select: { balance: true } });
    return NextResponse.json({ success: true, code, orderId, balance: account?.balance ?? 0, item: { id: product.id, name: product.name, price: product.price } });
  } catch (error) {
    if (error instanceof InsufficientBalance) return NextResponse.json({ error: "Недостатньо коштів" }, { status: 400 });
    console.error("Launcher purchase error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Помилка покупки" }, { status: 500 });
  }
}
