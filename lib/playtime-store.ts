import { db } from "@/lib/db";

const minutesPerSpin = 5 * 60;

export async function addPlaytime(steamId: string, playtimeMinutes: number) {
  return db.$transaction(async (tx) => {
    const account = await tx.steamAccount.upsert({ where: { steamId }, update: {}, create: { steamId } });
    const before = Math.floor(account.playtimeMinutes / minutesPerSpin);
    const total = account.playtimeMinutes + playtimeMinutes;
    const after = Math.floor(total / minutesPerSpin);
    const awardedSpins = after - before;
    const updated = await tx.steamAccount.update({ where: { steamId }, data: { playtimeMinutes: total, rouletteSpins: { increment: awardedSpins } } });
    return { totalPlaytimeMinutes: updated.playtimeMinutes, rouletteSpins: updated.rouletteSpins, awardedSpins };
  });
}
