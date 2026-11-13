import { db } from "@/lib/db";

export async function getBalance(steamId: string) {
  const account = await db.steamAccount.findUnique({
    where: { steamId },
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 20 } },
  });

  if (!account) {
    void db.steamAccount.upsert({ where: { steamId }, update: {}, create: { steamId } }).catch(() => {});
    return { balance: 0, history: [] };
  }

  return { balance: account.balance, history: account.transactions };
}

export async function creditBalance(steamId: string, amount: number, reason: string, id: string) {
  try {
    return await db.$transaction(async (tx) => {
      await tx.steamAccount.upsert({ where: { steamId }, update: {}, create: { steamId } });
      await tx.balanceTransaction.create({ data: { id, steamId, amount, reason } });
      return tx.steamAccount.update({ where: { steamId }, data: { balance: { increment: amount } } });
    });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") return null;
    throw error;
  }
}
