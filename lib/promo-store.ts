import { randomBytes, randomUUID } from "crypto"; 
import { db } from "@/lib/db";

export type PromoCode = {
  id: string;
  code: string;
  amount: number;
  maxActivations: number;
  activations: number;
  activatedSteamIds: string[];
  expiresAt: string;
  createdAt: string;
};

const map = (item: {
  id: string;
  code: string;
  amount: number;
  maxActivations: number;
  activations: number;
  expiresAt: string;
  createdAt: Date;
  uses: { steamId: string }[];
}): PromoCode => ({
  ...item,
  createdAt: item.createdAt.toISOString(),
  activatedSteamIds: item.uses.map(x => x.steamId)
});

export async function getPromoCodes() {
  const codes = await db.managedPromoCode.findMany({
    include: { uses: { select: { steamId: true } } },
    orderBy: { createdAt: "desc" }
  });
  return codes.map(map);
}

export async function createPromoCode(input: { amount: number; maxActivations: number; expiresAt: string }) {
  const created = await db.managedPromoCode.create({
    data: {
      id: randomUUID(),
      code: `OUT-${randomBytes(4).toString("hex").toUpperCase()}`,
      amount: Number(input.amount),
      maxActivations: Number(input.maxActivations),
      expiresAt: input.expiresAt,
      activations: 0
    },
    include: { uses: { select: { steamId: true } } }
  });
  return map(created);
}

export async function activatePromoCode(code: string, steamId: string) {
  return db.$transaction(async tx => {
    const cleanCode = code.toUpperCase().trim();
    
    const promo = await tx.managedPromoCode.findUnique({
      where: { code: cleanCode },
      include: { uses: { where: { steamId } } }
    });

    if (!promo) return { error: "Промокод не знайдено" };
    
    if (new Date(`${promo.expiresAt}T23:59:59`).getTime() < Date.now()) {
      return { error: "Термін дії промокоду завершився" };
    }
    
    if (promo.activations >= promo.maxActivations) {
      return { error: "Ліміт активацій вичерпано" };
    }
    
    if (promo.uses && promo.uses.length > 0) {
      return { error: "Ви вже використали цей промокод" };
    }

    // Забезпечуємо наявність акаунта і записуємо використання
    await tx.steamAccount.upsert({
      where: { steamId },
      update: {},
      create: { steamId }
    });

    await tx.promoUse.create({
      data: {
        promoId: promo.id,
        steamId
      }
    });

    await tx.managedPromoCode.update({
      where: { id: promo.id },
      data: { activations: { increment: 1 } }
    });

    // Нараховуємо баланс користувачу
    await tx.steamAccount.update({
      where: { steamId },
      data: { balance: { increment: promo.amount } }
    });

    return { amount: promo.amount, code: promo.code };
  });
}