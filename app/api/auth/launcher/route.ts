import { NextRequest, NextResponse } from "next/server";
import { getSteamSession } from "@/lib/steam-auth";
import { createLauncherToken, decodeLauncherToken } from "@/lib/launcher-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const allowedOrigin = process.env.NODE_ENV === "production"
    ? "https://outland-dayz.onrender.com"
    : new URL(req.url).origin;
  if (req.headers.get("origin") !== allowedOrigin) return NextResponse.json({ error: "Недозволена адреса запиту" }, { status: 403 });
  const user = await getSteamSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  if (!process.env.STEAM_SESSION_SECRET) return NextResponse.json({ error: "На Render потрібно налаштувати STEAM_SESSION_SECRET для підключення лаунчера." }, { status: 503 });
  const { state } = await req.json();
  if (!/^[a-f0-9]{64}$/.test(state)) return new NextResponse(null, { status: 400 });
  return NextResponse.json({ token: createLauncherToken(user, state) }, { headers: { "Cache-Control": "no-store" } });
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const data = decodeLauncherToken(token);
  return data
    ? NextResponse.json(data, { headers: { "Cache-Control": "no-store" } })
    : NextResponse.json({ error: "Expired session" }, { status: 401 });
}
