import { db } from "@/lib/db";
import {
  fetchPterodactylResources,
  syncServerLogsFromPterodactyl,
  type PterodactylResources,
  type ScannedLogFileInfo,
} from "@/lib/pterodactyl-logs";

export type PlayerSourceKind = "BOTH" | "SERVER" | "SITE";

export interface UnifiedPlayerSummary {
  key: string;
  playerName: string;
  serverName: string | null;
  avatar: string | null;
  steamId: string | null;
  bohemiaId: string | null;
  beGuid: string | null;
  lastIp: string | null;
  profileId: string | null;
  isOnline: boolean;
  source: PlayerSourceKind;
  joinCount: number;
  balance: number;
  playtimeMinutes: number;
  rouletteSpins: number;
  purchasesCount: number;
  totalSpent: number;
  transactionsCount: number;
  promoUsesCount: number;
  note: string | null;
  lastServerSeenAt: string | null;
  lastSiteSeenAt: string | null;
  lastActivityAt: string;
  firstSeenAt: string;
}

export interface ServerLogEventDTO {
  id: string;
  eventType: string;
  playerName: string;
  steamId: string | null;
  bohemiaId: string | null;
  ip: string | null;
  beGuid: string | null;
  details: string | null;
  sourceFile: string | null;
  occurredAt: string;
  playerKey: string;
}

export interface AdminDashboardPayload {
  pterodactyl: {
    configured: boolean;
    serverState: string;
    resources: PterodactylResources | null;
    filesScanned: ScannedLogFileInfo[];
    newEventsInserted?: number;
    rawTail?: string[];
    rawTailFile?: string;
    error?: string;
  };
  stats: {
    onlineNow: number;
    totalPlayers: number;
    serverPlayers: number;
    siteVisitors: number;
    joins24h: number;
    totalEvents: number;
  };
  players: UnifiedPlayerSummary[];
  events: ServerLogEventDTO[];
}

function minDate(a?: Date | null, b?: Date | null): Date {
  if (a && b) return a < b ? a : b;
  return a || b || new Date();
}

function maxDate(a?: Date | null, b?: Date | null): Date {
  if (a && b) return a > b ? a : b;
  return a || b || new Date();
}

export async function getAdminDashboardData(options?: {
  sync?: boolean;
  limitEvents?: number;
}): Promise<AdminDashboardPayload> {
  let syncResult: Awaited<ReturnType<typeof syncServerLogsFromPterodactyl>> | null = null;
  let quickResources: PterodactylResources | null = null;

  if (options?.sync) {
    syncResult = await syncServerLogsFromPterodactyl();
  } else if (process.env.PTERODACTYL_API_KEY && process.env.PTERODACTYL_SERVER_ID) {
    quickResources = await fetchPterodactylResources();
  }

  const dayAgo = new Date(Date.now() - 24 * 3600 * 1000);

  const [
    serverProfiles,
    visitors,
    accounts,
    purchaseAgg,
    latestPurchases,
    recentEvents,
    joins24h,
    totalEvents,
  ] = await Promise.all([
    db.serverPlayerProfile.findMany({ orderBy: { lastSeenAt: "desc" } }),
    db.steamVisitor.findMany({ orderBy: { lastSeen: "desc" } }),
    db.steamAccount.findMany({
      include: {
        _count: { select: { transactions: true, promoUses: true } },
      },
    }),
    db.purchaseLog.groupBy({
      by: ["steamId"],
      _count: { _all: true },
      _sum: { price: true },
      _max: { createdAt: true },
    }),
    db.purchaseLog.findMany({
      select: { steamId: true, username: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    db.serverLogEvent.findMany({
      orderBy: { occurredAt: "desc" },
      take: options?.limitEvents ?? 250,
    }),
    db.serverLogEvent.count({
      where: { eventType: "CONNECT", occurredAt: { gte: dayAgo } },
    }),
    db.serverLogEvent.count(),
  ]);

  const visitorBySteam = new Map(visitors.map((v) => [v.steamId, v]));
  const visitorByLowerName = new Map(visitors.map((v) => [v.username.trim().toLowerCase(), v]));
  const accountBySteam = new Map(accounts.map((a) => [a.steamId, a]));
  const purchaseBySteam = new Map(purchaseAgg.map((p) => [p.steamId, p]));
  const purchaseNameBySteam = new Map<string, string>();
  for (const p of latestPurchases) {
    if (!purchaseNameBySteam.has(p.steamId) && p.username) {
      purchaseNameBySteam.set(p.steamId, p.username);
    }
  }

  const unifiedMap = new Map<string, UnifiedPlayerSummary>();
  const usedSteamIds = new Set<string>();
  const playerKeyByNameLower = new Map<string, string>();
  const playerKeyByBohemia = new Map<string, string>();

  // 1) Start with DayZ Server Player Profiles
  for (const prof of serverProfiles) {
    const matchedVisitor =
      (prof.steamId ? visitorBySteam.get(prof.steamId) : undefined) ||
      visitorByLowerName.get(prof.playerName.trim().toLowerCase());

    const resolvedSteamId = prof.steamId || matchedVisitor?.steamId || null;
    if (resolvedSteamId) usedSteamIds.add(resolvedSteamId);

    const acc = resolvedSteamId ? accountBySteam.get(resolvedSteamId) : undefined;
    const purch = resolvedSteamId ? purchaseBySteam.get(resolvedSteamId) : undefined;
    const key = resolvedSteamId ? `steam:${resolvedSteamId}` : `profile:${prof.id}`;

    const hasSite = Boolean(matchedVisitor || acc || purch);
    const firstSeen = minDate(prof.firstSeenAt, matchedVisitor?.createdAt || acc?.createdAt);
    const lastActivity = maxDate(prof.lastSeenAt, matchedVisitor?.lastSeen || purch?._max.createdAt);

    const summary: UnifiedPlayerSummary = {
      key,
      playerName: prof.playerName || matchedVisitor?.username || `Гравець`,
      serverName: prof.playerName,
      avatar: matchedVisitor?.avatar || null,
      steamId: resolvedSteamId,
      bohemiaId: prof.bohemiaId,
      beGuid: prof.beGuid,
      lastIp: prof.lastIp,
      profileId: prof.id,
      isOnline: prof.isOnline,
      source: hasSite ? "BOTH" : "SERVER",
      joinCount: prof.joinCount,
      balance: acc?.balance ?? 0,
      playtimeMinutes: acc?.playtimeMinutes ?? 0,
      rouletteSpins: acc?.rouletteSpins ?? 0,
      purchasesCount: purch?._count._all ?? 0,
      totalSpent: purch?._sum.price ?? 0,
      transactionsCount: acc?._count.transactions ?? 0,
      promoUsesCount: acc?._count.promoUses ?? 0,
      note: prof.note,
      lastServerSeenAt: prof.lastSeenAt.toISOString(),
      lastSiteSeenAt: matchedVisitor?.lastSeen?.toISOString() ?? null,
      lastActivityAt: lastActivity.toISOString(),
      firstSeenAt: firstSeen.toISOString(),
    };

    // If two server profiles resolved to the same steamId, merge cleanly
    const existingSameKey = unifiedMap.get(key);
    if (existingSameKey) {
      existingSameKey.isOnline = existingSameKey.isOnline || summary.isOnline;
      existingSameKey.joinCount += summary.joinCount;
      if (!existingSameKey.bohemiaId && summary.bohemiaId) existingSameKey.bohemiaId = summary.bohemiaId;
      if (!existingSameKey.beGuid && summary.beGuid) existingSameKey.beGuid = summary.beGuid;
      if (!existingSameKey.lastIp && summary.lastIp) existingSameKey.lastIp = summary.lastIp;
      if (!existingSameKey.note && summary.note) existingSameKey.note = summary.note;
      if (summary.lastActivityAt > existingSameKey.lastActivityAt) {
        existingSameKey.lastActivityAt = summary.lastActivityAt;
      }
      if (
        summary.lastServerSeenAt &&
        (!existingSameKey.lastServerSeenAt || summary.lastServerSeenAt > existingSameKey.lastServerSeenAt)
      ) {
        existingSameKey.lastServerSeenAt = summary.lastServerSeenAt;
      }
    } else {
      unifiedMap.set(key, summary);
    }

    playerKeyByNameLower.set(prof.playerName.trim().toLowerCase(), key);
    if (prof.bohemiaId) playerKeyByBohemia.set(prof.bohemiaId, key);
  }

  // 2) Add remaining SteamVisitors / SteamAccounts / PurchaseLogs who haven't joined from parsed logs yet
  const allRemainingSteamIds = new Set<string>();
  for (const v of visitors) allRemainingSteamIds.add(v.steamId);
  for (const a of accounts) allRemainingSteamIds.add(a.steamId);
  for (const p of purchaseAgg) {
    if (/^7656119\d{10}$/.test(p.steamId)) allRemainingSteamIds.add(p.steamId);
  }

  for (const steamId of allRemainingSteamIds) {
    if (usedSteamIds.has(steamId)) continue;
    const v = visitorBySteam.get(steamId);
    const acc = accountBySteam.get(steamId);
    const purch = purchaseBySteam.get(steamId);
    const key = `steam:${steamId}`;
    const displayName =
      v?.username || purchaseNameBySteam.get(steamId) || `Steam #${steamId.slice(-6)}`;
    const firstSeen = minDate(v?.createdAt, acc?.createdAt);
    const lastActivity = maxDate(v?.lastSeen, maxDate(purch?._max.createdAt, acc?.updatedAt));

    unifiedMap.set(key, {
      key,
      playerName: displayName,
      serverName: null,
      avatar: v?.avatar || null,
      steamId,
      bohemiaId: null,
      beGuid: null,
      lastIp: null,
      profileId: null,
      isOnline: false,
      source: "SITE",
      joinCount: 0,
      balance: acc?.balance ?? 0,
      playtimeMinutes: acc?.playtimeMinutes ?? 0,
      rouletteSpins: acc?.rouletteSpins ?? 0,
      purchasesCount: purch?._count._all ?? 0,
      totalSpent: purch?._sum.price ?? 0,
      transactionsCount: acc?._count.transactions ?? 0,
      promoUsesCount: acc?._count.promoUses ?? 0,
      note: null,
      lastServerSeenAt: null,
      lastSiteSeenAt: v?.lastSeen?.toISOString() ?? null,
      lastActivityAt: lastActivity.toISOString(),
      firstSeenAt: firstSeen.toISOString(),
    });
    playerKeyByNameLower.set(displayName.trim().toLowerCase(), key);
  }

  const players = Array.from(unifiedMap.values()).sort((a, b) => {
    if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
    if ((a.lastServerSeenAt || "") !== (b.lastServerSeenAt || "")) {
      if (a.lastServerSeenAt && !b.lastServerSeenAt) return -1;
      if (!a.lastServerSeenAt && b.lastServerSeenAt) return 1;
    }
    return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
  });

  const events: ServerLogEventDTO[] = recentEvents.map((ev) => {
    const playerKey =
      (ev.steamId ? `steam:${ev.steamId}` : undefined) ||
      (ev.bohemiaId ? playerKeyByBohemia.get(ev.bohemiaId) : undefined) ||
      playerKeyByNameLower.get(ev.playerName.trim().toLowerCase()) ||
      `name:${ev.playerName}`;

    return {
      id: ev.id,
      eventType: ev.eventType,
      playerName: ev.playerName,
      steamId: ev.steamId,
      bohemiaId: ev.bohemiaId,
      ip: ev.ip,
      beGuid: ev.beGuid,
      details: ev.details,
      sourceFile: ev.sourceFile,
      occurredAt: ev.occurredAt.toISOString(),
      playerKey,
    };
  });

  const configured = Boolean(process.env.PTERODACTYL_API_KEY && process.env.PTERODACTYL_SERVER_ID);

  return {
    pterodactyl: syncResult
      ? {
          configured: syncResult.configured,
          serverState: syncResult.serverState,
          resources: syncResult.resources,
          filesScanned: syncResult.filesScanned,
          newEventsInserted: syncResult.newEventsInserted,
          rawTail: syncResult.rawTail,
          rawTailFile: syncResult.rawTailFile,
          error: syncResult.error,
        }
      : {
          configured,
          serverState: quickResources?.state || (configured ? "unknown" : "unconfigured"),
          resources: quickResources,
          filesScanned: [],
        },
    stats: {
      onlineNow: players.filter((p) => p.isOnline).length,
      totalPlayers: players.length,
      serverPlayers: players.filter((p) => p.source === "SERVER" || p.source === "BOTH").length,
      siteVisitors: visitors.length,
      joins24h,
      totalEvents,
    },
    players,
    events,
  };
}

export async function getAdminPlayerDetail(rawKey: string) {
  const decodedKey = decodeURIComponent(rawKey).trim();
  let steamId: string | null = null;
  let profileId: string | null = null;
  let fallbackName: string | null = null;

  if (decodedKey.startsWith("steam:")) {
    steamId = decodedKey.slice("steam:".length);
  } else if (decodedKey.startsWith("profile:")) {
    profileId = decodedKey.slice("profile:".length);
  } else if (decodedKey.startsWith("name:")) {
    fallbackName = decodedKey.slice("name:".length);
  } else if (/^7656119\d{10}$/.test(decodedKey)) {
    steamId = decodedKey;
  } else {
    profileId = decodedKey;
  }

  let serverProfile = profileId
    ? await db.serverPlayerProfile.findUnique({ where: { id: profileId } })
    : steamId
    ? await db.serverPlayerProfile.findFirst({ where: { steamId } })
    : fallbackName
    ? await db.serverPlayerProfile.findFirst({
        where: { playerName: { equals: fallbackName, mode: "insensitive" } },
      })
    : null;

  if (!steamId && serverProfile?.steamId) {
    steamId = serverProfile.steamId;
  }

  // Try matching SteamVisitor by name if serverProfile exists without steamId
  let visitor = steamId
    ? await db.steamVisitor.findUnique({ where: { steamId } })
    : serverProfile
    ? await db.steamVisitor.findFirst({
        where: { username: { equals: serverProfile.playerName, mode: "insensitive" } },
      })
    : fallbackName
    ? await db.steamVisitor.findFirst({
        where: { username: { equals: fallbackName, mode: "insensitive" } },
      })
    : null;

  if (!steamId && visitor?.steamId) {
    steamId = visitor.steamId;
  }

  if (!serverProfile && visitor) {
    serverProfile = await db.serverPlayerProfile.findFirst({
      where: {
        OR: [
          { steamId: visitor.steamId },
          { playerName: { equals: visitor.username, mode: "insensitive" } },
        ],
      },
    });
  }

  const targetName = serverProfile?.playerName || visitor?.username || fallbackName;

  const eventWhereOr: any[] = [];
  if (steamId) eventWhereOr.push({ steamId });
  if (serverProfile?.bohemiaId) eventWhereOr.push({ bohemiaId: serverProfile.bohemiaId });
  if (targetName) eventWhereOr.push({ playerName: { equals: targetName, mode: "insensitive" } });

  const [account, purchases, serverEvents] = await Promise.all([
    steamId
      ? db.steamAccount.findUnique({
          where: { steamId },
          include: {
            vip: { include: { plan: true } },
            transactions: { orderBy: { createdAt: "desc" }, take: 100 },
            promoUses: { include: { promo: true }, orderBy: { createdAt: "desc" }, take: 50 },
          },
        })
      : Promise.resolve(null),
    steamId
      ? db.purchaseLog.findMany({
          where: { steamId },
          orderBy: { createdAt: "desc" },
          take: 100,
        })
      : Promise.resolve([]),
    eventWhereOr.length > 0
      ? db.serverLogEvent.findMany({
          where: { OR: eventWhereOr },
          orderBy: { occurredAt: "desc" },
          take: 150,
        })
      : Promise.resolve([]),
  ]);

  if (!serverProfile && !visitor && !account && purchases.length === 0 && serverEvents.length === 0) {
    return null;
  }

  const displayName =
    serverProfile?.playerName ||
    visitor?.username ||
    purchases[0]?.username ||
    (steamId ? `Steam #${steamId.slice(-6)}` : fallbackName || "Гравець");

  const firstSeen = minDate(serverProfile?.firstSeenAt, visitor?.createdAt || account?.createdAt);
  const lastActivity = maxDate(
    serverProfile?.lastSeenAt,
    visitor?.lastSeen || purchases[0]?.createdAt
  );

  const totalSpent = purchases.reduce((sum, p) => sum + (p.price || 0), 0);

  return {
    summary: {
      key: steamId ? `steam:${steamId}` : serverProfile ? `profile:${serverProfile.id}` : `name:${displayName}`,
      playerName: displayName,
      serverName: serverProfile?.playerName || null,
      avatar: visitor?.avatar || null,
      steamId: steamId || null,
      bohemiaId: serverProfile?.bohemiaId || null,
      beGuid: serverProfile?.beGuid || null,
      lastIp: serverProfile?.lastIp || null,
      profileId: serverProfile?.id || null,
      isOnline: serverProfile?.isOnline ?? false,
      source:
        serverProfile && (visitor || account || purchases.length > 0)
          ? ("BOTH" as const)
          : serverProfile
          ? ("SERVER" as const)
          : ("SITE" as const),
      joinCount: serverProfile?.joinCount ?? 0,
      balance: account?.balance ?? 0,
      playtimeMinutes: account?.playtimeMinutes ?? 0,
      rouletteSpins: account?.rouletteSpins ?? 0,
      purchasesCount: purchases.length,
      totalSpent,
      transactionsCount: account?.transactions.length ?? 0,
      promoUsesCount: account?.promoUses.length ?? 0,
      note: serverProfile?.note ?? null,
      lastServerSeenAt: serverProfile?.lastSeenAt?.toISOString() ?? null,
      lastSiteSeenAt: visitor?.lastSeen?.toISOString() ?? null,
      lastActivityAt: lastActivity.toISOString(),
      firstSeenAt: firstSeen.toISOString(),
    } satisfies UnifiedPlayerSummary,
    vip: account?.vip
      ? {
          planName: account.vip.plan.name,
          expiresAt: account.vip.expiresAt?.toISOString() ?? null,
        }
      : null,
    serverEvents: serverEvents.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      playerName: e.playerName,
      steamId: e.steamId,
      bohemiaId: e.bohemiaId,
      ip: e.ip,
      beGuid: e.beGuid,
      details: e.details,
      sourceFile: e.sourceFile,
      occurredAt: e.occurredAt.toISOString(),
    })),
    purchases: purchases.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      productName: p.productName,
      price: p.price,
      code: p.code,
      createdAt: p.createdAt.toISOString(),
    })),
    transactions: (account?.transactions ?? []).map((t) => ({
      id: t.id,
      amount: t.amount,
      reason: t.reason,
      createdAt: t.createdAt.toISOString(),
    })),
    promoUses: (account?.promoUses ?? []).map((u) => ({
      id: u.id,
      code: u.promo.code,
      amount: u.promo.amount,
      createdAt: u.createdAt.toISOString(),
    })),
  };
}
