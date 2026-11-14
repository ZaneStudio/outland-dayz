import { getSteamSession } from "@/lib/steam-auth";

const BUILTIN_ADMIN_STEAM_IDS = [
  "76561199250591196",
  "76561198789928918",
];

export async function currentAdmin() {
  const user = await getSteamSession();
  const envIds = (process.env.ADMIN_STEAM_IDS || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const allowedIds = new Set([...BUILTIN_ADMIN_STEAM_IDS, ...envIds]);
  return user && allowedIds.has(user.steamId) ? user : null;
}
