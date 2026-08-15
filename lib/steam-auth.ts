import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const cookieName = "outland_steam_session";
type SteamSession = { steamId: string; name: string; avatar: string };

function secret() { return process.env.STEAM_SESSION_SECRET || "development-secret-change-me"; }
function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }

export function encodeSteamSession(session: SteamSession) {
  const body = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodeSteamSession(value?: string): SteamSession | null {
  if (!value) return null;
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try { return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SteamSession; } catch { return null; }
}

export async function getSteamSession() { return decodeSteamSession((await cookies()).get(cookieName)?.value); }
export const steamSessionCookie = cookieName;
