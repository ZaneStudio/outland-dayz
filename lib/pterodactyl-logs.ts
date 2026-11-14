import { createHash } from "crypto";
import { db } from "@/lib/db";
import {
  normalizePlayerKey,
  parseDayZLogContent,
  type LogEventType,
  type ParsedDayZEvent,
} from "@/lib/dayz-log-parser";

export interface PterodactylResources {
  state: string;
  cpuAbsolute: number;
  memoryMb: number;
  diskMb: number;
  networkRxMb: number;
  networkTxMb: number;
  uptimeMs: number;
}

export interface ScannedLogFileInfo {
  path: string;
  name: string;
  size: number;
  modifiedAt: string;
  parsedEvents: number;
}

export interface PterodactylSyncResult {
  configured: boolean;
  serverState: string;
  resources: PterodactylResources | null;
  filesScanned: ScannedLogFileInfo[];
  newEventsInserted: number;
  playersUpdated: number;
  rawTail: string[];
  rawTailFile?: string;
  error?: string;
}

interface PterodactylFileEntry {
  name: string;
  path: string;
  size: number;
  isFile: boolean;
  modifiedAt: string;
}

function getPanelBaseUrl(): string {
  return (process.env.PTERODACTYL_PANEL_URL || "https://console.uahost.eu").replace(/\/+$/, "");
}

async function listDirectory(
  baseUrl: string,
  serverId: string,
  apiKey: string,
  directory: string
): Promise<PterodactylFileEntry[]> {
  try {
    const res = await fetch(
      `${baseUrl}/api/client/servers/${serverId}/files/list?directory=${encodeURIComponent(directory)}`,
      {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(7000),
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const list = Array.isArray(json?.data) ? json.data : [];
    return list
      .map((entry: any) => {
        const attr = entry?.attributes;
        if (!attr?.name) return null;
        const cleanDir = directory === "/" ? "" : directory.replace(/\/+$/, "");
        return {
          name: String(attr.name),
          path: `${cleanDir}/${attr.name}`,
          size: Number(attr.size || 0),
          isFile: Boolean(attr.is_file),
          modifiedAt: String(attr.modified_at || ""),
        } as PterodactylFileEntry;
      })
      .filter((x: PterodactylFileEntry | null): x is PterodactylFileEntry => Boolean(x));
  } catch {
    return [];
  }
}

async function fetchFileContent(
  baseUrl: string,
  serverId: string,
  apiKey: string,
  filePath: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `${baseUrl}/api/client/servers/${serverId}/files/contents?file=${encodeURIComponent(filePath)}`,
      {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "text/plain, */*" },
        cache: "no-store",
        signal: AbortSignal.timeout(9000),
      }
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function fetchPterodactylResources(): Promise<PterodactylResources | null> {
  const apiKey = process.env.PTERODACTYL_API_KEY;
  const serverId = process.env.PTERODACTYL_SERVER_ID;
  if (!apiKey || !serverId) return null;

  const baseUrl = getPanelBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/client/servers/${serverId}/resources`, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const attr = json?.attributes;
    const r = attr?.resources;
    if (!attr || !r) return null;
    return {
      state: String(attr.current_state || "unknown"),
      cpuAbsolute: Math.round(Number(r.cpu_absolute || 0) * 10) / 10,
      memoryMb: Math.round(Number(r.memory_bytes || 0) / (1024 * 1024)),
      diskMb: Math.round(Number(r.disk_bytes || 0) / (1024 * 1024)),
      networkRxMb: Math.round((Number(r.network_rx_bytes || 0) / (1024 * 1024)) * 10) / 10,
      networkTxMb: Math.round((Number(r.network_tx_bytes || 0) / (1024 * 1024)) * 10) / 10,
      uptimeMs: Number(r.uptime || 0),
    };
  } catch {
    return null;
  }
}

async function resolveSteamIdByNameMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const [visitors, purchases] = await Promise.all([
    db.steamVisitor.findMany({ select: { steamId: true, username: true } }),
    db.purchaseLog.findMany({
      select: { steamId: true, username: true },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
  ]);

  for (const p of purchases) {
    if (p.username && /^7656119\d{10}$/.test(p.steamId)) {
      map.set(p.username.trim().toLowerCase(), p.steamId);
    }
  }
  for (const v of visitors) {
    if (v.username && /^7656119\d{10}$/.test(v.steamId)) {
      map.set(v.username.trim().toLowerCase(), v.steamId);
    }
  }
  return map;
}

export async function syncServerLogsFromPterodactyl(): Promise<PterodactylSyncResult> {
  const apiKey = process.env.PTERODACTYL_API_KEY;
  const serverId = process.env.PTERODACTYL_SERVER_ID;

  if (!apiKey || !serverId) {
    return {
      configured: false,
      serverState: "unconfigured",
      resources: null,
      filesScanned: [],
      newEventsInserted: 0,
      playersUpdated: 0,
      rawTail: [],
    };
  }

  const baseUrl = getPanelBaseUrl();

  try {
    const [resources, profilesEntries, rootEntries] = await Promise.all([
      fetchPterodactylResources(),
      listDirectory(baseUrl, serverId, apiKey, "/profiles"),
      listDirectory(baseUrl, serverId, apiKey, "/"),
    ]);

    const serverState = resources?.state || "unknown";

    // Also peek into log-related subfolders inside /profiles (1 level deep)
    const candidateDirs = profilesEntries
      .filter(
        (e) =>
          !e.isFile &&
          /^(logs?|admlogs?|vppadmintools|ft_mods|serverprofile|dayzserver|battleye)$/i.test(e.name)
      )
      .slice(0, 6);

    const subEntriesList = await Promise.all(
      candidateDirs.map((d) => listDirectory(baseUrl, serverId, apiKey, d.path))
    );

    const allFiles = [...profilesEntries, ...rootEntries, ...subEntriesList.flat()].filter(
      (entry) =>
        entry.isFile &&
        entry.size > 0 &&
        entry.size <= 12 * 1024 * 1024 &&
        /\.(adm|rpt|log)$/i.test(entry.name)
    );

    const dedupedFilesMap = new Map<string, PterodactylFileEntry>();
    for (const f of allFiles) {
      dedupedFilesMap.set(f.path, f);
    }
    const uniqueFiles = Array.from(dedupedFilesMap.values()).sort(
      (a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
    );

    const admFiles = uniqueFiles.filter((f) => /\.adm$/i.test(f.name)).slice(0, 5);
    const rptFiles = uniqueFiles.filter((f) => /\.rpt$/i.test(f.name)).slice(0, 2);
    const otherLogFiles = uniqueFiles
      .filter((f) => /\.log$/i.test(f.name) && !/crash/i.test(f.name))
      .slice(0, 2);

    const filesToScan = [...admFiles, ...rptFiles, ...otherLogFiles];
    if (filesToScan.length === 0) {
      return {
        configured: true,
        serverState,
        resources,
        filesScanned: [],
        newEventsInserted: 0,
        playersUpdated: 0,
        rawTail: [],
      };
    }

    const newestAdmPath = admFiles[0]?.path;
    const newestSessionPath = newestAdmPath || rptFiles[0]?.path || filesToScan[0]?.path;

    const downloaded = await Promise.all(
      filesToScan.map(async (f) => ({
        file: f,
        content: await fetchFileContent(baseUrl, serverId, apiKey, f.path),
      }))
    );

    const globalIpByName = new Map<string, string>();
    const globalGuidByName = new Map<string, string>();
    const globalBohemiaByName = new Map<string, string>();
    const globalSteamByName = await resolveSteamIdByNameMap();

    const parsedPerFile = downloaded.map(({ file, content }) => {
      if (!content) return { file, parsed: null, content: null };
      const isNewest = file.path === newestSessionPath;
      const parsed = parseDayZLogContent(content, file.path, {
        fileModifiedAt: file.modifiedAt,
        isNewestFile: isNewest,
      });
      parsed.ipByName.forEach((v, k) => globalIpByName.set(k, v));
      parsed.guidByName.forEach((v, k) => globalGuidByName.set(k, v));
      parsed.bohemiaByName.forEach((v, k) => globalBohemiaByName.set(k, v));
      parsed.steamByName.forEach((v, k) => globalSteamByName.set(k, v));
      return { file, parsed, content };
    });

    const filesScanned: ScannedLogFileInfo[] = [];
    const allEvents: ParsedDayZEvent[] = [];
    let rawTail: string[] = [];
    let rawTailFile: string | undefined;
    let activeKeys = new Map<
      string,
      { playerName: string; bohemiaId?: string; steamId?: string; connectedAt: Date }
    >();

    for (const item of parsedPerFile) {
      if (!item.parsed) continue;
      if (item.file.path === newestSessionPath) {
        activeKeys = item.parsed.activePlayerKeys;
        if (item.content) {
          const lines = item.content.split(/\r?\n/).filter((l) => l.trim().length > 0);
          rawTail = lines.slice(-80);
          rawTailFile = item.file.name;
        }
      }

      for (const ev of item.parsed.events) {
        const lowerName = ev.playerName.trim().toLowerCase();
        allEvents.push({
          ...ev,
          ip: ev.ip || globalIpByName.get(lowerName),
          beGuid: ev.beGuid || globalGuidByName.get(lowerName),
          bohemiaId: ev.bohemiaId || globalBohemiaByName.get(lowerName),
          steamId: ev.steamId || globalSteamByName.get(lowerName),
        });
      }

      filesScanned.push({
        path: item.file.path,
        name: item.file.name,
        size: item.file.size,
        modifiedAt: item.file.modifiedAt,
        parsedEvents: item.parsed.events.length,
      });
    }

    let newEventsInserted = 0;
    if (allEvents.length > 0) {
      // Insert in chunks to avoid Postgres bind limit
      for (let i = 0; i < allEvents.length; i += 250) {
        const chunk = allEvents.slice(i, i + 250);
        const res = await db.serverLogEvent.createMany({
          data: chunk.map((ev) => ({
            dedupeKey: ev.dedupeKey,
            eventType: ev.eventType,
            playerName: ev.playerName,
            steamId: ev.steamId || null,
            bohemiaId: ev.bohemiaId || null,
            ip: ev.ip || null,
            beGuid: ev.beGuid || null,
            details: ev.details || null,
            sourceFile: ev.sourceFile,
            occurredAt: ev.occurredAt,
          })),
          skipDuplicates: true,
        });
        newEventsInserted += res.count;
      }
    }

    // Aggregate players from all DB events (so rotated history stays complete!)
    const serverEvents = await db.serverLogEvent.findMany({
      orderBy: { occurredAt: "asc" },
      take: 5000,
    });

    interface AggPlayer {
      lookupKey: string;
      playerName: string;
      steamId?: string;
      bohemiaId?: string;
      beGuid?: string;
      lastIp?: string;
      joinCount: number;
      firstSeenAt: Date;
      lastSeenAt: Date;
      lastDisconnectAt?: Date;
    }

    const aggByKey = new Map<string, AggPlayer>();
    const activeNamesLower = new Set<string>();
    const activeBohemiaIds = new Set<string>();
    if (serverState === "running") {
      activeKeys.forEach((v) => {
        activeNamesLower.add(v.playerName.trim().toLowerCase());
        if (v.bohemiaId) activeBohemiaIds.add(v.bohemiaId);
      });
    }

    for (const ev of serverEvents) {
      const lowerName = ev.playerName.trim().toLowerCase();
      const matchedSteam = ev.steamId || globalSteamByName.get(lowerName);
      const matchedBohemia = ev.bohemiaId || globalBohemiaByName.get(lowerName);
      const key = normalizePlayerKey(ev.playerName, matchedBohemia, matchedSteam);

      const existing = aggByKey.get(key);
      if (!existing) {
        aggByKey.set(key, {
          lookupKey: key,
          playerName: ev.playerName,
          steamId: matchedSteam,
          bohemiaId: matchedBohemia,
          beGuid: ev.beGuid || globalGuidByName.get(lowerName),
          lastIp: ev.ip || globalIpByName.get(lowerName),
          joinCount: ev.eventType === "CONNECT" ? 1 : 0,
          firstSeenAt: ev.occurredAt,
          lastSeenAt: ev.occurredAt,
          lastDisconnectAt: ev.eventType === "DISCONNECT" ? ev.occurredAt : undefined,
        });
      } else {
        existing.playerName = ev.playerName;
        if (matchedSteam && !existing.steamId) existing.steamId = matchedSteam;
        if (matchedBohemia && !existing.bohemiaId) existing.bohemiaId = matchedBohemia;
        if (ev.beGuid) existing.beGuid = ev.beGuid;
        if (ev.ip) existing.lastIp = ev.ip;
        if (ev.eventType === "CONNECT") existing.joinCount += 1;
        if (ev.occurredAt < existing.firstSeenAt) existing.firstSeenAt = ev.occurredAt;
        if (ev.occurredAt > existing.lastSeenAt) existing.lastSeenAt = ev.occurredAt;
        if (
          ev.eventType === "DISCONNECT" &&
          (!existing.lastDisconnectAt || ev.occurredAt > existing.lastDisconnectAt)
        ) {
          existing.lastDisconnectAt = ev.occurredAt;
        }
      }
    }

    // Reset online flags first if server is not running
    if (serverState !== "running") {
      await db.serverPlayerProfile.updateMany({
        where: { isOnline: true },
        data: { isOnline: false },
      });
    } else {
      await db.serverPlayerProfile.updateMany({ data: { isOnline: false } });
    }

    let playersUpdated = 0;
    for (const player of aggByKey.values()) {
      const isOnline =
        serverState === "running" &&
        ((player.bohemiaId && activeBohemiaIds.has(player.bohemiaId)) ||
          activeNamesLower.has(player.playerName.trim().toLowerCase()));

      await db.serverPlayerProfile.upsert({
        where: { lookupKey: player.lookupKey },
        update: {
          playerName: player.playerName,
          ...(player.steamId ? { steamId: player.steamId } : {}),
          ...(player.bohemiaId ? { bohemiaId: player.bohemiaId } : {}),
          ...(player.beGuid ? { beGuid: player.beGuid } : {}),
          ...(player.lastIp ? { lastIp: player.lastIp } : {}),
          isOnline,
          joinCount: player.joinCount,
          firstSeenAt: player.firstSeenAt,
          lastSeenAt: player.lastSeenAt,
          lastDisconnectAt: player.lastDisconnectAt || null,
        },
        create: {
          lookupKey: player.lookupKey,
          playerName: player.playerName,
          steamId: player.steamId || null,
          bohemiaId: player.bohemiaId || null,
          beGuid: player.beGuid || null,
          lastIp: player.lastIp || null,
          isOnline,
          joinCount: player.joinCount,
          firstSeenAt: player.firstSeenAt,
          lastSeenAt: player.lastSeenAt,
          lastDisconnectAt: player.lastDisconnectAt || null,
        },
      });
      playersUpdated += 1;
    }

    return {
      configured: true,
      serverState,
      resources,
      filesScanned,
      newEventsInserted,
      playersUpdated,
      rawTail,
      rawTailFile,
    };
  } catch (error) {
    return {
      configured: true,
      serverState: "error",
      resources: null,
      filesScanned: [],
      newEventsInserted: 0,
      playersUpdated: 0,
      rawTail: [],
      error: error instanceof Error ? error.message : "Помилка синхронізації з Pterodactyl",
    };
  }
}

export async function recordDirectServerEvent(input: {
  eventType: LogEventType;
  playerName: string;
  steamId?: string;
  bohemiaId?: string;
  ip?: string;
  beGuid?: string;
  details?: string;
  sourceFile?: string;
  occurredAt?: Date;
}) {
  const occurredAt = input.occurredAt || new Date();
  const lookupKey = normalizePlayerKey(input.playerName, input.bohemiaId, input.steamId);
  const dedupeKey = createHash("sha256")
    .update([
      input.sourceFile || "webhook",
      occurredAt.toISOString(),
      input.eventType,
      input.playerName,
      input.steamId || "",
      input.bohemiaId || "",
    ].join("|"))
    .digest("hex")
    .slice(0, 32);

  await db.serverLogEvent.upsert({
    where: { dedupeKey },
    update: {},
    create: {
      dedupeKey,
      eventType: input.eventType,
      playerName: input.playerName,
      steamId: input.steamId || null,
      bohemiaId: input.bohemiaId || null,
      ip: input.ip || null,
      beGuid: input.beGuid || null,
      details: input.details || null,
      sourceFile: input.sourceFile || "live-webhook",
      occurredAt,
    },
  });

  const existing = await db.serverPlayerProfile.findUnique({ where: { lookupKey } });
  const isOnline =
    input.eventType === "CONNECT"
      ? true
      : input.eventType === "DISCONNECT"
      ? false
      : existing?.isOnline ?? false;

  await db.serverPlayerProfile.upsert({
    where: { lookupKey },
    update: {
      playerName: input.playerName,
      ...(input.steamId ? { steamId: input.steamId } : {}),
      ...(input.bohemiaId ? { bohemiaId: input.bohemiaId } : {}),
      ...(input.ip ? { lastIp: input.ip } : {}),
      ...(input.beGuid ? { beGuid: input.beGuid } : {}),
      isOnline,
      ...(input.eventType === "CONNECT" ? { joinCount: { increment: 1 } } : {}),
      lastSeenAt: occurredAt,
      ...(input.eventType === "DISCONNECT" ? { lastDisconnectAt: occurredAt } : {}),
    },
    create: {
      lookupKey,
      playerName: input.playerName,
      steamId: input.steamId || null,
      bohemiaId: input.bohemiaId || null,
      lastIp: input.ip || null,
      beGuid: input.beGuid || null,
      isOnline,
      joinCount: input.eventType === "CONNECT" ? 1 : 0,
      firstSeenAt: occurredAt,
      lastSeenAt: occurredAt,
      lastDisconnectAt: input.eventType === "DISCONNECT" ? occurredAt : null,
    },
  });
}
