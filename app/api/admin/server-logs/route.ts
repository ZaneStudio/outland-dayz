import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { currentAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { getAdminDashboardData } from "@/lib/admin-players";
import { recordDirectServerEvent } from "@/lib/pterodactyl-logs";
import type { LogEventType } from "@/lib/dayz-log-parser";

export const dynamic = "force-dynamic";

function matchesSecret(provided: string, expected: string): boolean {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function GET(req: NextRequest) {
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ заборонено" }, { status: 403 });
  }

  const sync = req.nextUrl.searchParams.get("sync") === "1";
  const payload = await getAdminDashboardData({ sync });
  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: NextRequest) {
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ заборонено" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const profileId = typeof body.profileId === "string" ? body.profileId : "";
    const playerName = typeof body.playerName === "string" ? body.playerName.trim() : "";
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : null;
    const rawSteamId = typeof body.steamId === "string" ? body.steamId.trim() : "";
    const linkedSteamId = rawSteamId ? (/^7656119\d{10}$/.test(rawSteamId) ? rawSteamId : null) : null;

    if (rawSteamId && !linkedSteamId) {
      return NextResponse.json(
        { error: "Steam ID має починатися з 7656119 та містити 17 цифр" },
        { status: 400 }
      );
    }

    if (profileId) {
      const updated = await db.serverPlayerProfile.update({
        where: { id: profileId },
        data: {
          note: note || null,
          ...(rawSteamId === "" ? {} : { steamId: linkedSteamId }),
        },
      });
      return NextResponse.json({ ok: true, profile: updated });
    }

    if (linkedSteamId) {
      const lookupKey = `steam:${linkedSteamId}`;
      const existing = await db.serverPlayerProfile.findFirst({
        where: { OR: [{ lookupKey }, { steamId: linkedSteamId }] },
      });

      if (existing) {
        const updated = await db.serverPlayerProfile.update({
          where: { id: existing.id },
          data: { note: note || null },
        });
        return NextResponse.json({ ok: true, profile: updated });
      }

      const created = await db.serverPlayerProfile.create({
        data: {
          lookupKey,
          playerName: playerName || `Steam #${linkedSteamId.slice(-6)}`,
          steamId: linkedSteamId,
          note: note || null,
        },
      });
      return NextResponse.json({ ok: true, profile: created });
    }

    return NextResponse.json({ error: "Не вказано профіль гравця" }, { status: 400 });
  } catch (err) {
    console.error("Update player profile error:", err);
    return NextResponse.json({ error: "Не вдалося оновити профіль" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const expected = process.env.GAME_SERVER_SECRET;
  const authHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некоректний JSON" }, { status: 400 });
  }

  const secretProvided = authHeader || (typeof body.secret === "string" ? body.secret : "");
  const isServerAuth = Boolean(expected && secretProvided && matchesSecret(secretProvided, expected));
  const admin = isServerAuth ? null : await currentAdmin();

  if (!isServerAuth && !admin) {
    return NextResponse.json({ error: "Доступ заборонено" }, { status: 403 });
  }

  const playerName = typeof body.playerName === "string" ? body.playerName.trim() : "";
  if (!playerName) {
    return NextResponse.json({ error: "Не вказано playerName" }, { status: 400 });
  }

  const rawType = typeof body.eventType === "string" ? body.eventType.toUpperCase() : "CONNECT";
  const allowedTypes: LogEventType[] = [
    "CONNECT",
    "DISCONNECT",
    "DEATH",
    "KILL",
    "CHAT",
    "ADMIN",
    "OTHER",
  ];
  const eventType: LogEventType = allowedTypes.includes(rawType as LogEventType)
    ? (rawType as LogEventType)
    : "CONNECT";

  const steamId =
    typeof body.steamId === "string" && /^7656119\d{10}$/.test(body.steamId.trim())
      ? body.steamId.trim()
      : undefined;

  await recordDirectServerEvent({
    eventType,
    playerName,
    steamId,
    bohemiaId: typeof body.bohemiaId === "string" ? body.bohemiaId.trim() : undefined,
    ip: typeof body.ip === "string" ? body.ip.trim() : undefined,
    beGuid: typeof body.beGuid === "string" ? body.beGuid.trim() : undefined,
    details: typeof body.details === "string" ? body.details.trim().slice(0, 300) : undefined,
    sourceFile: typeof body.sourceFile === "string" ? body.sourceFile.trim() : "live-api",
    occurredAt:
      typeof body.occurredAt === "string" && !Number.isNaN(Date.parse(body.occurredAt))
        ? new Date(body.occurredAt)
        : new Date(),
  });

  return NextResponse.json({ ok: true });
}
