import { randomUUID } from "crypto";
import { db } from "@/lib/db";

export type VipPlanInput = {
  name: string;
  price: number;
  durationDays: number | null;
  features: string[];
  active?: boolean;
};

const cleanFeatures = (features: string[]) => features.map((item) => item.trim()).filter(Boolean);

export async function getVipPlans(includeInactive = false) {
  return db.vipPlan.findMany({
    where: includeInactive ? undefined : { active: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createVipPlan(input: VipPlanInput) {
  return db.vipPlan.create({
    data: { id: randomUUID(), ...input, features: cleanFeatures(input.features), active: input.active ?? true },
  });
}

export async function updateVipPlan(id: string, input: Partial<VipPlanInput>) {
  try {
    return await db.vipPlan.update({
      where: { id },
      data: { ...input, features: input.features ? cleanFeatures(input.features) : undefined },
    });
  } catch {
    return null;
  }
}

export async function deleteVipPlan(id: string) {
  try {
    await db.vipPlan.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function getSteamVip(steamId: string) {
  return db.steamVip.findUnique({ where: { steamId }, include: { plan: true } });
}

export async function purchaseVipPlan(steamId: string, planId: string) {
  return db.$transaction(async (tx) => {
    const plan = await tx.vipPlan.findFirst({ where: { id: planId, active: true } });
    if (!plan) return { error: "VIP-пакет більше недоступний." as const };

    await tx.steamAccount.upsert({ where: { steamId }, update: {}, create: { steamId } });
    const debited = await tx.steamAccount.updateMany({
      where: { steamId, balance: { gte: plan.price } },
      data: { balance: { decrement: plan.price } },
    });
    if (!debited.count) return { error: "Недостатньо коштів на балансі." as const };

    const previous = await tx.steamVip.findUnique({ where: { steamId } });
    const expiresAt = plan.durationDays === null
      ? null
      : new Date(Math.max(previous?.expiresAt?.getTime() ?? 0, Date.now()) + plan.durationDays * 86_400_000);

    await tx.steamVip.upsert({
      where: { steamId },
      create: { steamId, planId: plan.id, expiresAt },
      update: { planId: plan.id, expiresAt },
    });
    await tx.balanceTransaction.create({
      data: { id: randomUUID(), steamId, amount: -plan.price, reason: `VIP: ${plan.name}` },
    });
    const account = await tx.steamAccount.findUniqueOrThrow({ where: { steamId } });
    return { plan, balance: account.balance, expiresAt };
  });
}
