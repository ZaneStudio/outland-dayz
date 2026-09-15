import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { getSteamSession } from "@/lib/steam-auth";

export type LauncherUser = { steamId: string; name: string; avatar: string };
export type LauncherTokenData = { user: LauncherUser; state: string; exp: number };

function secret() {
  const value = process.env.STEAM_SESSION_SECRET;
  if (!value) throw new Error("STEAM_SESSION_SECRET is required");
  return value;
}

function sign(body: string) {
  return createHmac("sha256", secret()).update(`launcher:${body}`).digest("base64url");
}

export function createLauncherToken(user: LauncherUser, state: string) {
  const body = Buffer.from(JSON.stringify({ user, state, exp: Date.now() + 30 * 86400000 })).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodeLauncherToken(value?: string): LauncherTokenData | null {
  try {
    if (!value) return null;
    const [body, signature] = value.split(".");
    if (!body || !signature) return null;
    const expected = sign(body);
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as LauncherTokenData;
    if (!data?.user?.steamId || !data.user.name || !data.state || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getRequestUser(req: NextRequest): Promise<LauncherUser | null> {
  const bearer = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const launcher = decodeLauncherToken(bearer);
  if (launcher) return launcher.user;
  return getSteamSession();
}
