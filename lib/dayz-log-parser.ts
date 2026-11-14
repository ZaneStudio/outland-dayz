import { createHash } from "crypto";

export type LogEventType =
  | "CONNECT"
  | "DISCONNECT"
  | "DEATH"
  | "KILL"
  | "CHAT"
  | "ADMIN"
  | "OTHER";

export interface ParsedDayZEvent {
  dedupeKey: string;
  eventType: LogEventType;
  playerName: string;
  steamId?: string;
  bohemiaId?: string;
  ip?: string;
  beGuid?: string;
  details?: string;
  sourceFile: string;
  occurredAt: Date;
}

export interface ParsedDayZLogResult {
  events: ParsedDayZEvent[];
  sessionStartAt?: Date;
  activePlayerKeys: Map<string, { playerName: string; bohemiaId?: string; steamId?: string; connectedAt: Date }>;
  guidByName: Map<string, string>;
  ipByName: Map<string, string>;
  bohemiaByName: Map<string, string>;
  steamByName: Map<string, string>;
}

function makeDedupeKey(parts: (string | undefined)[]): string {
  return createHash("sha256")
    .update(parts.map((p) => p ?? "").join("|"))
    .digest("hex")
    .slice(0, 32);
}

function addDaysToYmd(ymd: string, deltaDays: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function extractDateFromFilename(fileName: string): string | null {
  const m = fileName.match(/(\d{4})[-_](\d{2})[-_](\d{2})/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

function parseHmsToSeconds(hms: string): number {
  const [h, m, s] = hms.split(":").map(Number);
  return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
}

function buildUtcDate(ymd: string, hms: string, offsetHours: number): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  const [hh, mm, ss] = hms.split(":").map(Number);
  const ms = Date.UTC(y, m - 1, d, hh || 0, mm || 0, ss || 0) - offsetHours * 3600 * 1000;
  return new Date(ms);
}

function inferTimezoneOffsetHours(
  lastNaiveYmd: string | null,
  lastNaiveHms: string | null,
  fileModifiedAt?: string | Date
): number {
  if (!lastNaiveYmd || !lastNaiveHms || !fileModifiedAt) return 0;
  const modDate = typeof fileModifiedAt === "string" ? new Date(fileModifiedAt) : fileModifiedAt;
  if (Number.isNaN(modDate.getTime())) return 0;

  const naiveAsUtc = buildUtcDate(lastNaiveYmd, lastNaiveHms, 0).getTime();
  const diffHours = (naiveAsUtc - modDate.getTime()) / (3600 * 1000);
  const rounded = Math.round(diffHours);
  if (Math.abs(diffHours - rounded) <= 0.35 && rounded >= -12 && rounded <= 14) {
    return rounded;
  }
  return 0;
}

function extractSteamId(text: string): string | undefined {
  const m = text.match(/\b(7656119\d{10})\b/);
  return m?.[1];
}

function extractBohemiaId(text: string): string | undefined {
  const m = text.match(/\bid=([A-Za-z0-9+/=_-]{6,})/i);
  return m?.[1];
}

export function normalizePlayerKey(name: string, bohemiaId?: string | null, steamId?: string | null): string {
  if (bohemiaId && bohemiaId !== "Unknown") return `bi:${bohemiaId}`;
  if (steamId && /^7656119\d{10}$/.test(steamId)) return `steam:${steamId}`;
  return `name:${name.trim().toLowerCase()}`;
}

export function parseDayZLogContent(
  content: string,
  sourceFile: string,
  options?: { fileModifiedAt?: string | Date; isNewestFile?: boolean }
): ParsedDayZLogResult {
  const lines = content.split(/\r?\n/);
  const baseName = sourceFile.split("/").pop() || sourceFile;
  const isAdm = /\.adm$/i.test(baseName);

  let currentDate =
    extractDateFromFilename(baseName) ||
    (options?.fileModifiedAt
      ? new Date(options.fileModifiedAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10));

  let sessionStartNaive: { ymd: string; hms: string } | null = null;
  let lastSecondsOfDay = -1;
  let lastNaiveYmd: string | null = null;
  let lastNaiveHms: string | null = null;

  interface RawParsedItem {
    ymd: string;
    hms: string;
    eventType: LogEventType;
    playerName: string;
    steamId?: string;
    bohemiaId?: string;
    ip?: string;
    beGuid?: string;
    details?: string;
    lineKeySuffix: string;
  }

  const rawItems: RawParsedItem[] = [];
  const guidByName = new Map<string, string>();
  const ipByName = new Map<string, string>();
  const bohemiaByName = new Map<string, string>();
  const steamByName = new Map<string, string>();

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]?.trim();
    if (!rawLine) continue;

    // 1) AdminLog header date
    const adminHeader = rawLine.match(/AdminLog started on (\d{4}-\d{2}-\d{2}) at (\d{2}:\d{2}:\d{2})/i);
    if (adminHeader) {
      currentDate = adminHeader[1];
      lastSecondsOfDay = parseHmsToSeconds(adminHeader[2]);
      sessionStartNaive = { ymd: currentDate, hms: adminHeader[2] };
      lastNaiveYmd = currentDate;
      lastNaiveHms = adminHeader[2];
      continue;
    }

    // 2) RPT header date like 2026/11/14, 18:30:12
    const rptDateHeader = rawLine.match(/(\d{4})[\/-](\d{2})[\/-](\d{2}),?\s+(\d{2}:\d{2}:\d{2})/);
    if (rptDateHeader && !rawLine.includes("|")) {
      currentDate = `${rptDateHeader[1]}-${rptDateHeader[2]}-${rptDateHeader[3]}`;
      lastSecondsOfDay = parseHmsToSeconds(rptDateHeader[4]);
      lastNaiveYmd = currentDate;
      lastNaiveHms = rptDateHeader[4];
    }

    // Extract leading timestamp: "14:23:10 | ..." or "14:23:10.123 ..."
    const tsMatch = rawLine.match(/^(\d{2}:\d{2}:\d{2})(?:\.\d+)?\s*(?:\|\s*)?(.*)$/);
    if (!tsMatch) continue;

    const hms = tsMatch[1];
    const body = tsMatch[2].trim();
    if (!body) continue;

    const secs = parseHmsToSeconds(hms);
    if (lastSecondsOfDay !== -1 && secs + 3600 < lastSecondsOfDay) {
      currentDate = addDaysToYmd(currentDate, 1);
    }
    lastSecondsOfDay = secs;
    lastNaiveYmd = currentDate;
    lastNaiveHms = hms;

    const lineSteamId = extractSteamId(body);

    // BattlEye Verified GUID
    const beGuidMatch = body.match(/BattlEye Server:\s*Verified GUID\s*\(([a-f0-9]+)\)\s*of player\s*#\d+\s+(.+)$/i);
    if (beGuidMatch) {
      const guid = beGuidMatch[1];
      const name = beGuidMatch[2].trim();
      if (name) guidByName.set(name.toLowerCase(), guid);
      continue;
    }

    // BattlEye Connect: BattlEye Server: Player #0 Name (IP:port) connected
    const beConnMatch = body.match(
      /BattlEye Server:\s*Player\s*#(\d+)\s+(.+?)\s*\((\d{1,3}(?:\.\d{1,3}){3}):\d+\)\s+connected/i
    );
    if (beConnMatch) {
      const playerName = beConnMatch[2].trim();
      const ip = beConnMatch[3];
      ipByName.set(playerName.toLowerCase(), ip);
      if (lineSteamId) steamByName.set(playerName.toLowerCase(), lineSteamId);
      rawItems.push({
        ymd: currentDate,
        hms,
        eventType: "CONNECT",
        playerName,
        steamId: lineSteamId,
        ip,
        beGuid: guidByName.get(playerName.toLowerCase()),
        details: `BattlEye #${beConnMatch[1]} (${ip})`,
        lineKeySuffix: `be-conn-${i}`,
      });
      continue;
    }

    // BattlEye Disconnect: BattlEye Server: Player #0 Name disconnected
    const beDiscMatch = body.match(/BattlEye Server:\s*Player\s*#(\d+)\s+(.+?)\s+disconnected/i);
    if (beDiscMatch) {
      const playerName = beDiscMatch[2].trim();
      rawItems.push({
        ymd: currentDate,
        hms,
        eventType: "DISCONNECT",
        playerName,
        steamId: lineSteamId || steamByName.get(playerName.toLowerCase()),
        ip: ipByName.get(playerName.toLowerCase()),
        beGuid: guidByName.get(playerName.toLowerCase()),
        details: `BattlEye #${beDiscMatch[1]} відключився`,
        lineKeySuffix: `be-disc-${i}`,
      });
      continue;
    }

    // ADM Connect: Player "Name" is connected (id=...) OR Player "Name"(id=...) is connected
    const admConnMatch = body.match(
      /^Player\s+"([^"]+)"(?:\s*\(([^)]*)\))?\s+is connected(?:\s*\(([^)]*)\))?/i
    );
    if (admConnMatch) {
      const playerName = admConnMatch[1].trim();
      const meta = `${admConnMatch[2] || ""} ${admConnMatch[3] || ""}`;
      const bohemiaId = extractBohemiaId(meta) || extractBohemiaId(body);
      if (bohemiaId) bohemiaByName.set(playerName.toLowerCase(), bohemiaId);
      if (lineSteamId) steamByName.set(playerName.toLowerCase(), lineSteamId);
      rawItems.push({
        ymd: currentDate,
        hms,
        eventType: "CONNECT",
        playerName,
        steamId: lineSteamId || steamByName.get(playerName.toLowerCase()),
        bohemiaId,
        ip: ipByName.get(playerName.toLowerCase()),
        beGuid: guidByName.get(playerName.toLowerCase()),
        details: "Підключився до сервера",
        lineKeySuffix: `adm-conn`,
      });
      continue;
    }

    // ADM Disconnect: Player "Name"(id=...) has been disconnected
    const admDiscMatch = body.match(
      /^Player\s+"([^"]+)"(?:\s*\(([^)]*)\))?\s+has been disconnected(?:\s*\(([^)]*)\))?/i
    );
    if (admDiscMatch) {
      const playerName = admDiscMatch[1].trim();
      const meta = `${admDiscMatch[2] || ""} ${admDiscMatch[3] || ""}`;
      const bohemiaId = extractBohemiaId(meta) || extractBohemiaId(body) || bohemiaByName.get(playerName.toLowerCase());
      rawItems.push({
        ymd: currentDate,
        hms,
        eventType: "DISCONNECT",
        playerName,
        steamId: lineSteamId || steamByName.get(playerName.toLowerCase()),
        bohemiaId,
        ip: ipByName.get(playerName.toLowerCase()),
        beGuid: guidByName.get(playerName.toLowerCase()),
        details: "Вийшов із сервера",
        lineKeySuffix: `adm-disc`,
      });
      continue;
    }

    // Generic RPT Connect: Player Name (123456) connected
    if (!isAdm) {
      const rptConn = body.match(/^Player\s+(.+?)\s*\(([^)]+)\)\s+connected/i);
      if (rptConn && !rptConn[1].startsWith('"')) {
        const playerName = rptConn[1].trim();
        rawItems.push({
          ymd: currentDate,
          hms,
          eventType: "CONNECT",
          playerName,
          steamId: lineSteamId,
          details: `Підключився (${rptConn[2]})`,
          lineKeySuffix: `rpt-conn`,
        });
        continue;
      }
      const rptDisc = body.match(/^Player\s+([^\s(][^)]*?)\s+disconnected/i);
      if (rptDisc && !rptDisc[1].startsWith('"')) {
        const playerName = rptDisc[1].trim();
        rawItems.push({
          ymd: currentDate,
          hms,
          eventType: "DISCONNECT",
          playerName,
          steamId: lineSteamId,
          details: "Відключився",
          lineKeySuffix: `rpt-disc`,
        });
        continue;
      }
    }

    // ADM Kill / Death
    const admDeadMatch = body.match(/^Player\s+"([^"]+)"\s+\(DEAD\)\s*\(([^)]*)\)\s*(.*)$/i);
    if (admDeadMatch) {
      const victimName = admDeadMatch[1].trim();
      const bohemiaId = extractBohemiaId(admDeadMatch[2]) || bohemiaByName.get(victimName.toLowerCase());
      const rest = admDeadMatch[3].trim();
      const killedByPlayer = rest.match(/killed by Player\s+"([^"]+)"(?:\s*\(([^)]*)\))?\s*(.*)$/i);
      if (killedByPlayer) {
        const killerName = killedByPlayer[1].trim();
        const killerBohemiaId = extractBohemiaId(killedByPlayer[2] || "");
        rawItems.push({
          ymd: currentDate,
          hms,
          eventType: "KILL",
          playerName: killerName,
          bohemiaId: killerBohemiaId || bohemiaByName.get(killerName.toLowerCase()),
          details: `Вбив гравця ${victimName} ${killedByPlayer[3] || ""}`.trim(),
          lineKeySuffix: `adm-kill-${victimName}`,
        });
        rawItems.push({
          ymd: currentDate,
          hms,
          eventType: "DEATH",
          playerName: victimName,
          steamId: lineSteamId,
          bohemiaId,
          details: `Загинув від ${killerName}`,
          lineKeySuffix: `adm-death-by-${killerName}`,
        });
      } else {
        rawItems.push({
          ymd: currentDate,
          hms,
          eventType: "DEATH",
          playerName: victimName,
          steamId: lineSteamId,
          bohemiaId,
          details: rest || "Загинув",
          lineKeySuffix: `adm-death`,
        });
      }
      continue;
    }

    // ADM Chat: Chat("Name"(id=...): message)
    const chatMatch = body.match(/^Chat\("([^"]+)"\(([^)]*)\):\s*(.+)\)$/i);
    if (chatMatch) {
      const playerName = chatMatch[1].trim();
      const bohemiaId = extractBohemiaId(chatMatch[2]) || bohemiaByName.get(playerName.toLowerCase());
      if (bohemiaId) bohemiaByName.set(playerName.toLowerCase(), bohemiaId);
      rawItems.push({
        ymd: currentDate,
        hms,
        eventType: "CHAT",
        playerName,
        steamId: lineSteamId,
        bohemiaId,
        details: chatMatch[3].trim().slice(0, 300),
        lineKeySuffix: `adm-chat-${chatMatch[3].slice(0, 24)}`,
      });
      continue;
    }
  }

  const offsetHours = inferTimezoneOffsetHours(lastNaiveYmd, lastNaiveHms, options?.fileModifiedAt);
  const events: ParsedDayZEvent[] = [];
  const activePlayerKeys = new Map<
    string,
    { playerName: string; bohemiaId?: string; steamId?: string; connectedAt: Date }
  >();

  for (const item of rawItems) {
    const occurredAt = buildUtcDate(item.ymd, item.hms, offsetHours);
    const enrichedIp = item.ip || ipByName.get(item.playerName.toLowerCase());
    const enrichedGuid = item.beGuid || guidByName.get(item.playerName.toLowerCase());
    const enrichedBohemia = item.bohemiaId || bohemiaByName.get(item.playerName.toLowerCase());
    const enrichedSteam = item.steamId || steamByName.get(item.playerName.toLowerCase());

    const dedupeKey = makeDedupeKey([
      baseName,
      occurredAt.toISOString(),
      item.eventType,
      item.playerName,
      enrichedBohemia,
      item.lineKeySuffix,
    ]);

    events.push({
      dedupeKey,
      eventType: item.eventType,
      playerName: item.playerName,
      steamId: enrichedSteam,
      bohemiaId: enrichedBohemia,
      ip: enrichedIp,
      beGuid: enrichedGuid,
      details: item.details,
      sourceFile: baseName,
      occurredAt,
    });

    if (options?.isNewestFile) {
      const key = normalizePlayerKey(item.playerName, enrichedBohemia, enrichedSteam);
      if (item.eventType === "CONNECT") {
        activePlayerKeys.set(key, {
          playerName: item.playerName,
          bohemiaId: enrichedBohemia,
          steamId: enrichedSteam,
          connectedAt: occurredAt,
        });
      } else if (item.eventType === "DISCONNECT") {
        activePlayerKeys.delete(key);
      }
    }
  }

  return {
    events,
    sessionStartAt: sessionStartNaive
      ? buildUtcDate(sessionStartNaive.ymd, sessionStartNaive.hms, offsetHours)
      : undefined,
    activePlayerKeys,
    guidByName,
    ipByName,
    bohemiaByName,
    steamByName,
  };
}
