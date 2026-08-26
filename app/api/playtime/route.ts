import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { addPlaytime } from "@/lib/playtime-store";

export const dynamic = "force-dynamic";

function matchesSecret(provided: string, expected: string) {
  const left = Buffer.from(provided), right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: NextRequest) {
  const expected = process.env.GAME_SERVER_SECRET;
  if (!expected) return NextResponse.json({ error: "GAME_SERVER_SECRET не налаштований" }, { status: 503 });
  let body: { steamId?: unknown; playtimeMinutes?: unknown; secret?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Некоректний JSON" }, { status: 400 }); }
  const authorization = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const provided = authorization || (typeof body.secret === "string" ? body.secret : "");
  if (!matchesSecret(provided, expected)) return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
  const steamId = typeof body.steamId === "string" ? body.steamId.trim() : "";
  const minutes = Number(body.playtimeMinutes);
  if (!/^7656119\d{10}$/.test(steamId)) return NextResponse.json({ error: "Некоректний Steam ID" }, { status: 400 });
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) return NextResponse.json({ error: "playtimeMinutes має бути цілим числом від 1 до 1440" }, { status: 400 });
  const result = await addPlaytime(steamId, minutes);
  return NextResponse.json({ ok: true, steamId, addedMinutes: minutes, ...result });
}
