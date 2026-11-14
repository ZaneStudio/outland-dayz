"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Check,
  Clock,
  Coins,
  Copy,
  Cpu,
  ExternalLink,
  FileText,
  Gamepad2,
  HardDrive,
  Info,
  Link2,
  LogIn,
  LogOut,
  MessageSquare,
  RefreshCw,
  Save,
  Search,
  Server,
  Shield,
  ShoppingBag,
  Skull,
  Terminal,
  Ticket,
  UserCheck,
  Users,
  Wallet,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import type {
  AdminDashboardPayload,
  ServerLogEventDTO,
  UnifiedPlayerSummary,
} from "@/lib/admin-players";

interface PlayerDetailPayload {
  summary: UnifiedPlayerSummary;
  vip: { planName: string; expiresAt: string | null } | null;
  serverEvents: Array<{
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
  }>;
  purchases: Array<{
    id: string;
    orderId: string;
    productName: string;
    price: number;
    code: string | null;
    createdAt: string;
  }>;
  transactions: Array<{
    id: string;
    amount: number;
    reason: string;
    createdAt: string;
  }>;
  promoUses: Array<{
    id: string;
    code: string;
    amount: number;
    createdAt: string;
  }>;
}

type MainTab = "players" | "logs" | "files";
type PlayerFilter = "ALL" | "ONLINE" | "SERVER" | "SITE";
type EventFilter = "ALL" | "CONNECT" | "DISCONNECT" | "COMBAT" | "CHAT";
type DrawerTab = "server" | "purchases" | "transactions";

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatRelativeTime(value?: string | null): string {
  if (!value) return "Немає даних";
  const ms = Date.now() - new Date(value).getTime();
  if (Number.isNaN(ms) || ms < 0) return "Щойно";
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return "Щойно";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} хв тому`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs} год тому`;
  const days = Math.floor(hrs / 24);
  return `${days} дн тому`;
}

function formatPlaytime(minutes: number): string {
  if (!minutes || minutes <= 0) return "0 хв";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins} хв`;
  return `${hrs} год ${mins} хв`;
}

function formatUptime(ms: number): string {
  if (!ms || ms <= 0) return "—";
  const totalSec = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  if (hrs > 0) return `${hrs}г ${mins}хв`;
  return `${mins}хв`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
}

function EventBadge({ type }: { type: string }) {
  switch (type) {
    case "CONNECT":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#a8be70]/40 bg-[#27331a]/80 px-2.5 py-1 text-xs font-bold text-[#d4e898]">
          <LogIn size={13} /> Вхід
        </span>
      );
    case "DISCONNECT":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-950/50 px-2.5 py-1 text-xs font-bold text-amber-200">
          <LogOut size={13} /> Вихід
        </span>
      );
    case "KILL":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-950/50 px-2.5 py-1 text-xs font-bold text-sky-200">
          <Skull size={13} /> Вбивство
        </span>
      );
    case "DEATH":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/35 bg-red-950/55 px-2.5 py-1 text-xs font-bold text-red-200">
          <Skull size={13} /> Смерть
        </span>
      );
    case "CHAT":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-bold text-stone-200">
          <MessageSquare size={13} /> Чат
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-stone-300">
          <Activity size={13} /> {type}
        </span>
      );
  }
}

function SourceBadge({ source }: { source: UnifiedPlayerSummary["source"] }) {
  if (source === "BOTH") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#a8be70]/35 bg-[#232f17] px-2.5 py-0.5 text-[11px] font-semibold text-[#cde28f]">
        <UserCheck size={12} /> Сервер + Сайт
      </span>
    );
  }
  if (source === "SERVER") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-950/50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
        <Gamepad2 size={12} /> Сервер DayZ
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-stone-300">
      <Shield size={12} /> Сайт / Steam
    </span>
  );
}

export default function VisitorsClient({
  initialData,
}: {
  initialData: AdminDashboardPayload;
}) {
  const [data, setData] = useState<AdminDashboardPayload>(initialData);
  const [mainTab, setMainTab] = useState<MainTab>("players");
  const [playerFilter, setPlayerFilter] = useState<PlayerFilter>("ALL");
  const [eventFilter, setEventFilter] = useState<EventFilter>("ALL");
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Player info modal / drawer state
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [playerDetail, setPlayerDetail] = useState<PlayerDetailPayload | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("server");

  // Note / SteamID linking form inside player menu
  const [noteInput, setNoteInput] = useState("");
  const [linkSteamInput, setLinkSteamInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const syncLogs = useCallback(async (withPterodactyl = true) => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/admin/server-logs?sync=${withPterodactyl ? "1" : "0"}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json: AdminDashboardPayload = await res.json();
        setData(json);
        setLastSyncedAt(new Date().toLocaleTimeString("uk-UA"));
      }
    } catch (err) {
      console.error("Failed to sync logs:", err);
    } finally {
      setSyncing(false);
    }
  }, []);

  // Initial background sync from Pterodactyl right after mount
  useEffect(() => {
    void syncLogs(true);
  }, [syncLogs]);

  // Optional auto-refresh every 30s
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      void syncLogs(true);
    }, 30000);
    return () => clearInterval(timer);
  }, [autoRefresh, syncLogs]);

  const openPlayerInfo = useCallback(async (playerKey: string) => {
    setSelectedKey(playerKey);
    setDrawerTab("server");
    setDetailLoading(true);
    setDetailError(null);
    setSaveMessage(null);
    try {
      const res = await fetch(`/api/admin/players/${encodeURIComponent(playerKey)}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setDetailError(err.error || "Не вдалося завантажити досьє гравця");
        setPlayerDetail(null);
      } else {
        const detail: PlayerDetailPayload = await res.json();
        setPlayerDetail(detail);
        setNoteInput(detail.summary.note || "");
        setLinkSteamInput(detail.summary.steamId || "");
      }
    } catch {
      setDetailError("Помилка мережі при завантаженні профілю");
      setPlayerDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Close drawer on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedKey(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(label);
    setTimeout(() => setCopiedId((prev) => (prev === label ? null : prev)), 1800);
  };

  const handleSaveNoteAndLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerDetail) return;
    setSavingProfile(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/admin/server-logs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: playerDetail.summary.profileId || undefined,
          playerName: playerDetail.summary.playerName,
          note: noteInput,
          steamId: linkSteamInput.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveMessage(json.error || "Помилка збереження");
      } else {
        setSaveMessage("Збережено!");
        const nextKey =
          linkSteamInput.trim() && /^7656119\d{10}$/.test(linkSteamInput.trim())
            ? `steam:${linkSteamInput.trim()}`
            : playerDetail.summary.key;
        await Promise.all([syncLogs(false), openPlayerInfo(nextKey)]);
      }
    } catch {
      setSaveMessage("Помилка мережі");
    } finally {
      setSavingProfile(false);
    }
  };

  const filteredPlayers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.players.filter((p) => {
      if (playerFilter === "ONLINE" && !p.isOnline) return false;
      if (playerFilter === "SERVER" && p.source === "SITE") return false;
      if (playerFilter === "SITE" && p.source === "SERVER") return false;
      if (!q) return true;
      return (
        p.playerName.toLowerCase().includes(q) ||
        (p.serverName || "").toLowerCase().includes(q) ||
        (p.steamId || "").includes(q) ||
        (p.bohemiaId || "").toLowerCase().includes(q) ||
        (p.beGuid || "").toLowerCase().includes(q) ||
        (p.lastIp || "").includes(q) ||
        (p.note || "").toLowerCase().includes(q)
      );
    });
  }, [data.players, playerFilter, search]);

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.events.filter((ev) => {
      if (eventFilter === "CONNECT" && ev.eventType !== "CONNECT") return false;
      if (eventFilter === "DISCONNECT" && ev.eventType !== "DISCONNECT") return false;
      if (eventFilter === "COMBAT" && ev.eventType !== "KILL" && ev.eventType !== "DEATH")
        return false;
      if (eventFilter === "CHAT" && ev.eventType !== "CHAT") return false;
      if (!q) return true;
      return (
        ev.playerName.toLowerCase().includes(q) ||
        (ev.steamId || "").includes(q) ||
        (ev.bohemiaId || "").toLowerCase().includes(q) ||
        (ev.ip || "").includes(q) ||
        (ev.details || "").toLowerCase().includes(q) ||
        (ev.sourceFile || "").toLowerCase().includes(q)
      );
    });
  }, [data.events, eventFilter, search]);

  const serverState = data.pterodactyl.serverState;
  const isServerRunning = serverState === "running";
  const resources = data.pterodactyl.resources;

  return (
    <main className="shell max-w-7xl py-8 lg:py-10">
      {/* Заголовок + живий статус сервера */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Моніторинг · DayZ Сервер</p>
          <h1 className="heading mt-2 text-4xl sm:text-5xl text-white">Логи та гравці</h1>
          <p className="mt-3 max-w-2xl text-sm text-stone-300 leading-relaxed">
            Усі заходи на сервер DayZ з файлів <code className="text-[#c4da83]">.ADM</code> /{" "}
            <code className="text-[#c4da83]">.RPT</code>, поточний онлайн та об’єднане досьє
            кожного гравця із профілями сайту, балансом і покупками.
          </p>
        </div>

        {/* Панель керування синхронізацією */}
        <div className="panel rounded-2xl p-4 flex flex-wrap items-center gap-3 border border-white/15">
          <div className="flex items-center gap-2.5 pr-3 border-r border-white/10">
            {data.pterodactyl.configured ? (
              isServerRunning ? (
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c4da83]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#aee05b] shadow-[0_0_10px_#aee05b] animate-pulse" />
                  Сервер Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-300">
                  <WifiOff size={14} className="text-amber-300" />
                  {serverState === "offline" ? "Сервер Offline" : `Статус: ${serverState}`}
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-200">
                <Server size={14} /> Локальний режим БД
              </span>
            )}
          </div>

          {resources && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300 pr-2">
              <span className="inline-flex items-center gap-1" title="CPU">
                <Cpu size={13} className="text-[#b6c87b]" />
                {resources.cpuAbsolute}%
              </span>
              <span className="inline-flex items-center gap-1" title="RAM">
                <HardDrive size={13} className="text-[#b6c87b]" />
                {Math.round(resources.memoryMb)} MB
              </span>
              <span className="inline-flex items-center gap-1" title="Аптайм">
                <Clock size={13} className="text-[#b6c87b]" />
                {formatUptime(resources.uptimeMs)}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setAutoRefresh((v) => !v)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              autoRefresh
                ? "border-[#a8be70]/45 bg-[#243018] text-[#d5e898]"
                : "border-white/15 bg-black/30 text-stone-300 hover:bg-white/5"
            }`}
          >
            Авто 30с: {autoRefresh ? "УВІМК" : "ВИМК"}
          </button>

          <button
            type="button"
            disabled={syncing}
            onClick={() => void syncLogs(true)}
            className="btn !min-h-[38px] !px-4 !text-xs disabled:opacity-60"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Оновлення..." : "Оновити логи"}
          </button>
        </div>
      </div>

      {/* Статус синхронізації / попередження якщо потрібно */}
      {!data.pterodactyl.configured && (
        <div className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-950/25 px-4 py-3 text-xs text-amber-100/90 flex items-center gap-3">
          <Info size={16} className="shrink-0 text-amber-300" />
          <span>
            Змінні <code>PTERODACTYL_API_KEY</code> та <code>PTERODACTYL_SERVER_ID</code> зараз не
            задані в цьому середовищі — відображаються гравці й логи з бази даних. На Render, де
            налаштовано доступ до панелі хостингу, логи серверу підтягуються автоматично.
          </span>
        </div>
      )}

      {data.pterodactyl.error && (
        <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-xs text-red-200 flex items-center gap-3">
          <Info size={16} className="shrink-0 text-red-300" />
          <span>Помилка опитування Pterodactyl: {data.pterodactyl.error}</span>
        </div>
      )}

      {/* 4 Картки статистики */}
      <section className="mt-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <div className="panel rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-stone-300">
            <span>Онлайн на сервері</span>
            <Wifi size={15} className="text-[#c4da83]" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#dbe9ad]">{data.stats.onlineNow}</p>
          <p className="mt-1 text-xs text-stone-400">
            {lastSyncedAt ? `Оновлено о ${lastSyncedAt}` : "За останнім .ADM логом"}
          </p>
        </div>

        <div className="panel rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-stone-300">
            <span>Усього гравців</span>
            <Users size={15} className="text-[#c4da83]" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-white">{data.stats.totalPlayers}</p>
          <p className="mt-1 text-xs text-stone-400">
            Сервер: {data.stats.serverPlayers} · Сайт: {data.stats.siteVisitors}
          </p>
        </div>

        <div className="panel rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-stone-300">
            <span>Входів за 24 год</span>
            <LogIn size={15} className="text-[#c4da83]" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-white">{data.stats.joins24h}</p>
          <p className="mt-1 text-xs text-stone-400">Зафіксовані підключення</p>
        </div>

        <div className="panel rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-stone-300">
            <span>Записів у логах</span>
            <Activity size={15} className="text-[#c4da83]" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-white">{data.stats.totalEvents}</p>
          <p className="mt-1 text-xs text-stone-400">Збережена історія у БД</p>
        </div>
      </section>

      {/* Вкладки та пошук */}
      <section className="mt-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMainTab("players")}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition cursor-pointer ${
              mainTab === "players"
                ? "border-[#a8be70]/50 bg-[#253118] text-[#e8f4c9]"
                : "border-white/10 bg-black/35 text-stone-300 hover:bg-white/5"
            }`}
          >
            <Users size={16} />
            Гравці та досьє
            <span className="rounded-md bg-black/40 px-2 py-0.5 text-xs text-[#c4da83]">
              {data.players.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("logs")}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition cursor-pointer ${
              mainTab === "logs"
                ? "border-[#a8be70]/50 bg-[#253118] text-[#e8f4c9]"
                : "border-white/10 bg-black/35 text-stone-300 hover:bg-white/5"
            }`}
          >
            <Activity size={16} />
            Журнал підключень
            <span className="rounded-md bg-black/40 px-2 py-0.5 text-xs text-[#c4da83]">
              {data.events.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("files")}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition cursor-pointer ${
              mainTab === "files"
                ? "border-[#a8be70]/50 bg-[#253118] text-[#e8f4c9]"
                : "border-white/10 bg-black/35 text-stone-300 hover:bg-white/5"
            }`}
          >
            <Terminal size={16} />
            Файли сервера
            <span className="rounded-md bg-black/40 px-2 py-0.5 text-xs text-[#c4da83]">
              {data.pterodactyl.filesScanned.length}
            </span>
          </button>
        </div>

        {mainTab !== "files" && (
          <div className="relative w-full md:w-80">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук: нік, SteamID, Bohemia ID, IP..."
              className="w-full rounded-xl border border-white/15 bg-black/45 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-stone-400 focus:border-[#b6c87b] focus:outline-none"
            />
          </div>
        )}
      </section>

      {/* Вкладка 1: Гравці та досьє */}
      {mainTab === "players" && (
        <section className="mt-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {(
              [
                ["ALL", "Усі гравці"],
                ["ONLINE", `Зараз на сервері (${data.stats.onlineNow})`],
                ["SERVER", "Заходили на сервер"],
                ["SITE", "Авторизовані в Steam"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPlayerFilter(key)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  playerFilter === key
                    ? "border-[#a8be70]/55 bg-[#29361b] text-[#e3f2b6]"
                    : "border-white/10 bg-black/30 text-stone-300 hover:border-white/25"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="panel rounded-2xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-xs uppercase tracking-wider text-stone-300">
                    <th className="px-5 py-3.5">Гравець</th>
                    <th className="px-4 py-3.5">Джерело / Ідентифікатори</th>
                    <th className="px-4 py-3.5">Активність на сервері</th>
                    <th className="px-4 py-3.5">Економіка</th>
                    <th className="px-5 py-3.5 text-right">Досьє</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-stone-400">
                        За цим фільтром гравців не знайдено.
                      </td>
                    </tr>
                  ) : (
                    filteredPlayers.map((player) => (
                      <tr
                        key={player.key}
                        onClick={() => void openPlayerInfo(player.key)}
                        className="border-b border-white/5 hover:bg-[#1e2715]/55 transition cursor-pointer"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              {player.avatar ? (
                                <img
                                  src={player.avatar}
                                  alt={player.playerName}
                                  className="h-10 w-10 rounded-xl object-cover border border-white/15"
                                />
                              ) : (
                                <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-[#1a2213] text-sm font-bold text-[#c4da83]">
                                  {player.playerName.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              {player.isOnline && (
                                <span
                                  title="Онлайн на сервері"
                                  className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#0d110b] bg-[#aee05b] shadow-[0_0_8px_#aee05b]"
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white truncate max-w-[200px]">
                                  {player.playerName}
                                </span>
                                {player.isOnline && (
                                  <span className="rounded-md bg-[#263617] border border-[#a8be70]/40 px-2 py-0.5 text-[11px] font-bold text-[#d4eb96]">
                                    ONLINE
                                  </span>
                                )}
                              </div>
                              {player.note && (
                                <p className="mt-0.5 text-xs text-amber-200/85 truncate max-w-[240px]">
                                  {player.note}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-1">
                            <div>
                              <SourceBadge source={player.source} />
                            </div>
                            <div className="font-mono text-xs text-stone-300 flex items-center gap-2">
                              {player.steamId ? (
                                <span>Steam: {player.steamId}</span>
                              ) : player.bohemiaId ? (
                                <span>BI UID: {player.bohemiaId.slice(0, 18)}…</span>
                              ) : (
                                <span className="text-stone-400">Без Steam ID</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="text-xs space-y-0.5">
                            <p className="text-stone-200 font-medium">
                              {player.lastServerSeenAt
                                ? `Сервер: ${formatRelativeTime(player.lastServerSeenAt)}`
                                : player.lastSiteSeenAt
                                ? `Сайт: ${formatRelativeTime(player.lastSiteSeenAt)}`
                                : "—"}
                            </p>
                            <p className="text-stone-400">
                              Заходів: <b className="text-stone-200">{player.joinCount}</b>
                              {player.lastIp ? ` · IP: ${player.lastIp}` : ""}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="text-xs space-y-0.5">
                            <p className="font-mono font-bold text-[#c4da83]">{player.balance} ₴</p>
                            <p className="text-stone-400">
                              Покупок: <b className="text-stone-200">{player.purchasesCount}</b> (
                              {player.totalSpent} ₴)
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void openPlayerInfo(player.key);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#a8be70]/35 bg-[#202a16] px-3 py-1.5 text-xs font-bold text-[#d5e898] hover:bg-[#2c3a1e] transition cursor-pointer"
                          >
                            <Info size={14} /> Інфо
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Вкладка 2: Журнал підключень */}
      {mainTab === "logs" && (
        <section className="mt-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {(
              [
                ["ALL", "Усі події"],
                ["CONNECT", "Входи (Connect)"],
                ["DISCONNECT", "Виходи (Disconnect)"],
                ["COMBAT", "Смерті та вбивства"],
                ["CHAT", "Чат"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setEventFilter(key)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  eventFilter === key
                    ? "border-[#a8be70]/55 bg-[#29361b] text-[#e3f2b6]"
                    : "border-white/10 bg-black/30 text-stone-300 hover:border-white/25"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="panel rounded-2xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-xs uppercase tracking-wider text-stone-300">
                    <th className="px-5 py-3.5">Час</th>
                    <th className="px-4 py-3.5">Подія</th>
                    <th className="px-4 py-3.5">Гравець</th>
                    <th className="px-4 py-3.5">Ідентифікатори / IP</th>
                    <th className="px-4 py-3.5">Деталі</th>
                    <th className="px-5 py-3.5 text-right">Файл логу</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-stone-400">
                        Поки що подій підключення не зафіксовано. Натисніть «Оновити логи» для
                        синхронізації з сервером.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((ev: ServerLogEventDTO) => (
                      <tr
                        key={ev.id}
                        onClick={() => void openPlayerInfo(ev.playerKey)}
                        className="border-b border-white/5 hover:bg-[#1e2715]/55 transition cursor-pointer"
                      >
                        <td className="px-5 py-3 whitespace-nowrap font-mono text-xs text-stone-300">
                          {formatDateTime(ev.occurredAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <EventBadge type={ev.eventType} />
                        </td>
                        <td className="px-4 py-3 font-bold text-white">{ev.playerName}</td>
                        <td className="px-4 py-3 font-mono text-xs text-stone-300">
                          {ev.steamId ? (
                            <span>Steam: {ev.steamId}</span>
                          ) : ev.bohemiaId ? (
                            <span>BI: {ev.bohemiaId.slice(0, 16)}…</span>
                          ) : (
                            "—"
                          )}
                          {ev.ip && <span className="block text-stone-400">IP: {ev.ip}</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-stone-300 max-w-xs truncate">
                          {ev.details || "—"}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-xs text-stone-400">
                          {ev.sourceFile || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Вкладка 3: Файли та консоль (Pterodactyl) */}
      {mainTab === "files" && (
        <section className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="panel rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2.5">
              <FileText size={18} className="text-[#c4da83]" />
              <h2 className="text-lg font-bold text-white">Проскановані файли логів</h2>
            </div>
            <p className="mt-1 text-xs text-stone-400">
              Автоматичний пошук файлів <code>.ADM</code>, <code>.RPT</code>, <code>.log</code> у
              директоріях сервера на Pterodactyl.
            </p>

            <div className="mt-4 space-y-2.5">
              {data.pterodactyl.filesScanned.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-black/35 p-4 text-xs text-stone-400">
                  {data.pterodactyl.configured
                    ? "Файли логів ще не завантажено в цій сесії — натисніть «Оновити логи»."
                    : "Потрібно вказати PTERODACTYL_API_KEY та PTERODACTYL_SERVER_ID."}
                </div>
              ) : (
                data.pterodactyl.filesScanned.map((file) => (
                  <div
                    key={file.path}
                    className="rounded-xl border border-white/10 bg-black/40 p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-white truncate">{file.path}</p>
                      <p className="mt-1 text-xs text-stone-400">
                        {formatBytes(file.size)} · Змінено: {formatDateTime(file.modifiedAt)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg border border-[#a8be70]/35 bg-[#232f17] px-2.5 py-1 text-xs font-bold text-[#c4da83]">
                      {file.parsedEvents} подій
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel rounded-2xl p-5 border border-white/10 flex flex-col">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Terminal size={18} className="text-[#c4da83]" />
                <h2 className="text-lg font-bold text-white">
                  Останні рядки {data.pterodactyl.rawTailFile || "логу"}
                </h2>
              </div>
              {typeof data.pterodactyl.newEventsInserted === "number" && (
                <span className="text-xs text-[#c4da83]">
                  +{data.pterodactyl.newEventsInserted} нових подій
                </span>
              )}
            </div>

            <div className="mt-4 flex-1 rounded-xl border border-white/10 bg-[#050705] p-3.5 font-mono text-xs text-stone-300 max-h-[460px] overflow-y-auto space-y-1">
              {data.pterodactyl.rawTail && data.pterodactyl.rawTail.length > 0 ? (
                data.pterodactyl.rawTail.map((line, idx) => (
                  <div key={idx} className="leading-relaxed break-all hover:text-white">
                    {line}
                  </div>
                ))
              ) : (
                <p className="text-stone-500">
                  Немає сирих рядків для перегляду. Натисніть «Оновити логи» зверху.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* МЕНЮ ІНФОРМАЦІЇ ПРО ГРАВЦЯ (Модальне досьє) */}
      {selectedKey && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md"
          onClick={() => setSelectedKey(null)}
        >
          <aside
            className="relative h-full w-full max-w-3xl overflow-y-auto border-l border-white/15 bg-[#0c100b]/95 p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Кнопка закриття */}
            <button
              type="button"
              onClick={() => setSelectedKey(null)}
              aria-label="Закрити меню інформації"
              className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-black/50 text-stone-300 hover:border-[#a8be70]/50 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>

            {detailLoading && !playerDetail ? (
              <div className="py-20 text-center text-stone-300">
                <RefreshCw size={28} className="mx-auto mb-3 animate-spin text-[#c4da83]" />
                Завантажуємо досьє гравця...
              </div>
            ) : detailError ? (
              <div className="mt-10 rounded-2xl border border-red-400/30 bg-red-950/30 p-6 text-center text-red-200">
                {detailError}
              </div>
            ) : playerDetail ? (
              <div className="space-y-6">
                {/* Верхній профіль гравця */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center pr-12">
                  <div className="relative shrink-0">
                    {playerDetail.summary.avatar ? (
                      <img
                        src={playerDetail.summary.avatar}
                        alt={playerDetail.summary.playerName}
                        className="h-20 w-20 rounded-2xl object-cover border border-[#a8be70]/35 shadow-lg"
                      />
                    ) : (
                      <div className="grid h-20 w-20 place-items-center rounded-2xl border border-white/15 bg-[#1b2314] text-2xl font-bold text-[#c4da83]">
                        {playerDetail.summary.playerName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {playerDetail.summary.isOnline && (
                      <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#0c100b] bg-[#aee05b] shadow-[0_0_10px_#aee05b]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-2xl font-extrabold text-white truncate">
                        {playerDetail.summary.playerName}
                      </h2>
                      {playerDetail.summary.isOnline ? (
                        <span className="rounded-full border border-[#a8be70]/45 bg-[#253318] px-3 py-0.5 text-xs font-bold text-[#d5ed99]">
                          Зараз на сервері
                        </span>
                      ) : (
                        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-0.5 text-xs font-semibold text-stone-300">
                          Офлайн
                        </span>
                      )}
                      <SourceBadge source={playerDetail.summary.source} />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-300">
                      <span>Перша поява: {formatDateTime(playerDetail.summary.firstSeenAt)}</span>
                      <span>
                        Остання активність: {formatDateTime(playerDetail.summary.lastActivityAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ідентифікатори (Steam, Bohemia UID, GUID, IP) */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3.5">
                    <p className="text-[11px] uppercase tracking-wider text-stone-400">SteamID64</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="font-mono text-sm text-white truncate">
                        {playerDetail.summary.steamId || "Не прив’язано"}
                      </span>
                      {playerDetail.summary.steamId && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(playerDetail.summary.steamId!, "steamId")
                            }
                            className="rounded-lg border border-white/15 p-1.5 text-stone-300 hover:text-white cursor-pointer"
                            title="Копіювати SteamID64"
                          >
                            {copiedId === "steamId" ? <Check size={14} className="text-[#c4da83]" /> : <Copy size={14} />}
                          </button>
                          <a
                            href={`https://steamcommunity.com/profiles/${playerDetail.summary.steamId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-white/15 p-1.5 text-stone-300 hover:text-[#c4da83]"
                            title="Відкрити профіль Steam"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/40 p-3.5">
                    <p className="text-[11px] uppercase tracking-wider text-stone-400">
                      Bohemia Interactive UID
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="font-mono text-sm text-white truncate">
                        {playerDetail.summary.bohemiaId || "—"}
                      </span>
                      {playerDetail.summary.bohemiaId && (
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(playerDetail.summary.bohemiaId!, "bohemiaId")
                          }
                          className="rounded-lg border border-white/15 p-1.5 text-stone-300 hover:text-white cursor-pointer shrink-0"
                        >
                          {copiedId === "bohemiaId" ? (
                            <Check size={14} className="text-[#c4da83]" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/40 p-3.5">
                    <p className="text-[11px] uppercase tracking-wider text-stone-400">
                      Останній IP
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="font-mono text-sm text-white">
                        {playerDetail.summary.lastIp || "—"}
                      </span>
                      {playerDetail.summary.lastIp && (
                        <button
                          type="button"
                          onClick={() => handleCopy(playerDetail.summary.lastIp!, "ip")}
                          className="rounded-lg border border-white/15 p-1.5 text-stone-300 hover:text-white cursor-pointer shrink-0"
                        >
                          {copiedId === "ip" ? <Check size={14} className="text-[#c4da83]" /> : <Copy size={14} />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/40 p-3.5">
                    <p className="text-[11px] uppercase tracking-wider text-stone-400">
                      BattlEye GUID
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="font-mono text-sm text-white truncate">
                        {playerDetail.summary.beGuid || "—"}
                      </span>
                      {playerDetail.summary.beGuid && (
                        <button
                          type="button"
                          onClick={() => handleCopy(playerDetail.summary.beGuid!, "beGuid")}
                          className="rounded-lg border border-white/15 p-1.5 text-stone-300 hover:text-white cursor-pointer shrink-0"
                        >
                          {copiedId === "beGuid" ? (
                            <Check size={14} className="text-[#c4da83]" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4 Показники економіки та активності */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-white/10 bg-[#151b11] p-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <Wallet size={14} className="text-[#c4da83]" /> Баланс
                    </div>
                    <p className="mt-1.5 font-mono text-xl font-bold text-[#d5e99d]">
                      {playerDetail.summary.balance} ₴
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#151b11] p-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <ShoppingBag size={14} className="text-[#c4da83]" /> Покупки
                    </div>
                    <p className="mt-1.5 font-mono text-xl font-bold text-white">
                      {playerDetail.summary.totalSpent} ₴
                    </p>
                    <p className="text-[11px] text-stone-400">
                      Замовлень: {playerDetail.summary.purchasesCount}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#151b11] p-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <LogIn size={14} className="text-[#c4da83]" /> Входи
                    </div>
                    <p className="mt-1.5 font-mono text-xl font-bold text-white">
                      {playerDetail.summary.joinCount}
                    </p>
                    <p className="text-[11px] text-stone-400">Підключень на сервер</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#151b11] p-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <Clock size={14} className="text-[#c4da83]" /> Час у грі
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-white">
                      {formatPlaytime(playerDetail.summary.playtimeMinutes)}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      Спінів рулетки: {playerDetail.summary.rouletteSpins}
                    </p>
                  </div>
                </div>

                {/* Нотатка адміністратора + прив'язка SteamID */}
                <form
                  onSubmit={handleSaveNoteAndLink}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#c4da83]">
                      Нотатка адміна та прив’язка SteamID64
                    </span>
                    {saveMessage && <span className="text-xs text-[#c4da83]">{saveMessage}</span>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_210px]">
                    <input
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Наприклад: Лідер клану, перевірений гравець..."
                      className="rounded-xl border border-white/15 bg-black/50 px-3.5 py-2 text-sm text-white placeholder:text-stone-500 focus:border-[#b6c87b] focus:outline-none"
                    />
                    <div className="relative">
                      <Link2
                        size={14}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                      />
                      <input
                        type="text"
                        value={linkSteamInput}
                        onChange={(e) => setLinkSteamInput(e.target.value)}
                        placeholder="SteamID64 (7656119...)"
                        className="w-full rounded-xl border border-white/15 bg-black/50 pl-9 pr-3 py-2 font-mono text-xs text-white placeholder:text-stone-500 focus:border-[#b6c87b] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#a8be70]/45 bg-[#243118] px-4 py-2 text-xs font-bold text-[#d8ec9c] hover:bg-[#2f401f] transition cursor-pointer disabled:opacity-60"
                    >
                      <Save size={14} />
                      {savingProfile ? "Збереження..." : "Зберегти досьє"}
                    </button>
                  </div>
                </form>

                {/* Внутрішні вкладки досьє */}
                <div>
                  <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
                    <button
                      type="button"
                      onClick={() => setDrawerTab("server")}
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                        drawerTab === "server"
                          ? "bg-[#253218] text-[#d9ee9d] border border-[#a8be70]/40"
                          : "bg-black/30 text-stone-300 border border-white/10 hover:bg-white/5"
                      }`}
                    >
                      Логи сервера ({playerDetail.serverEvents.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawerTab("purchases")}
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                        drawerTab === "purchases"
                          ? "bg-[#253218] text-[#d9ee9d] border border-[#a8be70]/40"
                          : "bg-black/30 text-stone-300 border border-white/10 hover:bg-white/5"
                      }`}
                    >
                      Покупки та промокоди ({playerDetail.purchases.length + playerDetail.promoUses.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawerTab("transactions")}
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                        drawerTab === "transactions"
                          ? "bg-[#253218] text-[#d9ee9d] border border-[#a8be70]/40"
                          : "bg-black/30 text-stone-300 border border-white/10 hover:bg-white/5"
                      }`}
                    >
                      Транзакції балансу ({playerDetail.transactions.length})
                    </button>
                  </div>

                  {/* Логи сервера гравця */}
                  {drawerTab === "server" && (
                    <div className="mt-4 space-y-2.5">
                      {playerDetail.serverEvents.length === 0 ? (
                        <p className="rounded-xl border border-white/10 bg-black/35 p-6 text-center text-sm text-stone-400">
                          Для цього гравця ще немає зафіксованих подій у серверних логах.
                        </p>
                      ) : (
                        playerDetail.serverEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className="rounded-xl border border-white/10 bg-black/40 p-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-start gap-3">
                              <EventBadge type={ev.eventType} />
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {ev.details || ev.eventType}
                                </p>
                                <p className="mt-0.5 font-mono text-xs text-stone-400">
                                  {ev.sourceFile || "server"}
                                  {ev.ip ? ` · IP: ${ev.ip}` : ""}
                                </p>
                              </div>
                            </div>
                            <span className="font-mono text-xs text-stone-300 whitespace-nowrap">
                              {formatDateTime(ev.occurredAt)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Покупки та промокоди */}
                  {drawerTab === "purchases" && (
                    <div className="mt-4 space-y-4">
                      {playerDetail.promoUses.length > 0 && (
                        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#c4da83] flex items-center gap-1.5">
                            <Ticket size={14} /> Активовані промокоди
                          </h3>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {playerDetail.promoUses.map((u) => (
                              <span
                                key={u.id}
                                className="inline-flex items-center gap-2 rounded-lg border border-[#a8be70]/35 bg-[#202b15] px-3 py-1.5 text-xs"
                              >
                                <b className="font-mono text-white">{u.code}</b>
                                <span className="text-[#c4da83]">+{u.amount} ₴</span>
                                <span className="text-stone-400">
                                  ({new Date(u.createdAt).toLocaleDateString("uk-UA")})
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {playerDetail.purchases.length === 0 ? (
                        <p className="rounded-xl border border-white/10 bg-black/35 p-6 text-center text-sm text-stone-400">
                          Покупок у магазині ще не було.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {playerDetail.purchases.map((p) => (
                            <div
                              key={p.id}
                              className="rounded-xl border border-white/10 bg-black/40 p-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <p className="text-sm font-bold text-white">{p.productName}</p>
                                <p className="mt-0.5 text-xs text-stone-400">
                                  {p.orderId} · {formatDateTime(p.createdAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                {p.code && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(`!code ${p.code}`, p.id)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#a8be70]/35 bg-[#202b15] px-2.5 py-1 font-mono text-xs text-[#d6ea9b] hover:bg-[#2a381b] cursor-pointer"
                                  >
                                    {copiedId === p.id ? <Check size={12} /> : <Copy size={12} />}
                                    !code {p.code}
                                  </button>
                                )}
                                <span className="font-mono text-sm font-bold text-[#c4da83]">
                                  {p.price} ₴
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Транзакції балансу */}
                  {drawerTab === "transactions" && (
                    <div className="mt-4 space-y-2.5">
                      {playerDetail.transactions.length === 0 ? (
                        <p className="rounded-xl border border-white/10 bg-black/35 p-6 text-center text-sm text-stone-400">
                          Операцій з балансом поки немає.
                        </p>
                      ) : (
                        playerDetail.transactions.map((t) => (
                          <div
                            key={t.id}
                            className="rounded-xl border border-white/10 bg-black/40 p-3.5 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Coins
                                size={16}
                                className={t.amount >= 0 ? "text-[#c4da83]" : "text-amber-300"}
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">{t.reason}</p>
                                <p className="text-xs text-stone-400">
                                  {formatDateTime(t.createdAt)}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`font-mono text-sm font-bold shrink-0 ${
                                t.amount >= 0 ? "text-[#c4da83]" : "text-red-300"
                              }`}
                            >
                              {t.amount >= 0 ? `+${t.amount}` : t.amount} ₴
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      )}
    </main>
  );
}
