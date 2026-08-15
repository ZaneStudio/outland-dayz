import { getSteamSession } from "@/lib/steam-auth";
export async function currentAdmin() { const user = await getSteamSession(); const ids = (process.env.ADMIN_STEAM_IDS || "").split(",").map(x => x.trim()).filter(Boolean); return user && ids.includes(user.steamId) ? user : null; }
