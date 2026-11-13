"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Coins,
  Crown,
  LogOut,
  Settings,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  Ticket,
  CreditCard,
  Copy,
  Check,
  Terminal,
  ArrowUpRight,
} from "lucide-react";
import {
  clearProfileCache,
  readCachedProfile,
  readCachedSessionUser,
  refreshProfile,
  saveCachedProfile,
  saveCachedSessionUser,
  type ProfileOrder,
  type SteamUser,
} from "@/lib/profile-client-cache";

export default function ProfilePage() {
  const [user, setUser] = useState<SteamUser | null>(() => readCachedProfile()?.user || readCachedSessionUser());
  const [authChecked, setAuthChecked] = useState<boolean>(() => Boolean(readCachedProfile()?.user || readCachedSessionUser()));
  const [orders, setOrders] = useState<ProfileOrder[]>(() => readCachedProfile()?.orders || []);
  const [balance, setBalance] = useState<number>(() => {
    const cached = readCachedProfile();
    if (cached) return cached.balance;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("outland_user_balance");
      if (saved !== null && !Number.isNaN(Number(saved))) return Number(saved);
    }
    return 0;
  });
  const [vipLabel, setVipLabel] = useState<string>(() => readCachedProfile()?.vipLabel || "Неактивний");
  const [promo, setPromo] = useState("");
  const [amount, setAmount] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const cachedProfile = readCachedProfile();
    const cachedUser = cachedProfile?.user || readCachedSessionUser();

    if (cachedUser) {
      setUser(cachedUser);
      setAuthChecked(true);
    }
    if (cachedProfile) {
      setBalance(cachedProfile.balance);
      setVipLabel(cachedProfile.vipLabel);
      setOrders(cachedProfile.orders);
    } else {
      const savedBalance = localStorage.getItem("outland_user_balance");
      if (savedBalance !== null && !Number.isNaN(Number(savedBalance))) {
        setBalance(Number(savedBalance));
      }
    }

    if (!cachedUser) {
      fetch("/api/auth/session", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!active) return;
          const sessionUser = (data?.user as SteamUser | undefined) || null;
          if (sessionUser) {
            saveCachedSessionUser(sessionUser);
            setUser(sessionUser);
          }
          setAuthChecked(true);
        })
        .catch(() => {
          if (active) setAuthChecked(true);
        });
    }

    const syncFromServer = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      try {
        const profile = await refreshProfile();
        if (!active) return;

        if (!profile) {
          setUser(null);
          setAuthChecked(true);
          return;
        }

        setUser(profile.user);
        setBalance(profile.balance);
        setVipLabel(profile.vipLabel);
        setOrders(profile.orders);
        setAuthChecked(true);
      } catch {
        if (active) setAuthChecked(true);
      }
    };

    void syncFromServer();
    window.addEventListener("focus", syncFromServer);
    const interval = setInterval(syncFromServer, 20000);

    return () => {
      active = false;
      window.removeEventListener("focus", syncFromServer);
      clearInterval(interval);
    };
  }, []);

  const handleCopySteamId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.steamId);
    setCopiedCode("steam");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(`!code ${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLogout = async () => {
    clearProfileCache();
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    window.location.href = "/";
  };

  const handleTopUp = () => {
    const addAmount = Number(amount);
    if (!addAmount || addAmount <= 0) {
      alert("Будь ласка, введіть суму для поповнення!");
      return;
    }

    if (!user?.steamId) {
      alert("Помилка: не знайдено Steam ID. Перезайдіть в аккаунт.");
      return;
    }

    const monobankJarUrl = `https://send.monobank.ua/jar/3UQUKK7EN8?a=${addAmount}&t=${user.steamId}`;
    window.open(monobankJarUrl, "_blank");
  };

  const handleActivatePromo = async () => {
    if (!promo.trim()) {
      alert("Введіть промокод!");
      return;
    }
    try {
      const res = await fetch("/api/promocodes/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promo }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Помилка активації промокоду");
        return;
      }
      const nextBalance = balance + (Number(data.amount) || 0);
      setBalance(nextBalance);
      if (user) {
        saveCachedProfile({
          savedAt: Date.now(),
          user,
          balance: nextBalance,
          vipLabel,
          orders,
        });
      }
      setPromo("");
      alert(`Успішно! На ваш баланс зараховано ${data.amount} ₴`);
      void refreshProfile().then((updated) => {
        if (updated) {
          setBalance(updated.balance);
          setVipLabel(updated.vipLabel);
          setOrders(updated.orders);
        }
      });
    } catch {
      alert("Помилка мережі");
    }
  };

  if (!user && !authChecked) {
    return (
      <main className="min-h-[calc(100vh-64px)] py-10 sm:py-12 relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-20 pointer-events-none">
          <img
            src="/images/hero-bg.jpg"
            alt="Outland DayZ Background"
            style={{ filter: "blur(6px) brightness(0.85)" }}
            className="h-full w-full scale-105 object-cover"
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-black/40 pointer-events-none" />
        <div className="hero-vignette absolute inset-0 -z-10 pointer-events-none" />
        <div className="grid-lines absolute inset-0 -z-10 opacity-50 pointer-events-none" />

        <div className="shell grid gap-6 lg:grid-cols-[430px_1fr]">
          <div className="rounded-3xl bg-black/50 backdrop-blur-md border border-white/10 p-7 h-[520px] animate-pulse" />
          <div className="rounded-3xl bg-black/50 backdrop-blur-md border border-white/10 p-7 h-[520px] animate-pulse" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-64px)] relative isolate overflow-hidden grid place-items-center py-14">
        <div className="absolute inset-0 -z-20 pointer-events-none">
          <img
            src="/images/hero-bg.jpg"
            alt="Background"
            style={{ filter: "blur(6px) brightness(0.85)" }}
            className="h-full w-full scale-105 object-cover"
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-black/50 pointer-events-none" />
        <div className="hero-vignette absolute inset-0 -z-10 pointer-events-none" />
        <div className="grid-lines absolute inset-0 -z-10 opacity-50 pointer-events-none" />

        <div className="hero-content-card rounded-3xl bg-black/50 backdrop-blur-md border border-white/10 p-8 sm:p-10 text-center space-y-4 max-w-md mx-auto shadow-2xl">
          <h2 className="heading text-2xl text-white">Потрібна авторизація</h2>
          <p className="text-xs text-stone-300 leading-relaxed">
            Увійдіть через Steam, щоб переглянути свій особистий профіль та історію покупок.
          </p>
          <Link
            href="/login"
            className="btn inline-flex items-center justify-center w-full !min-h-12 rounded-xl text-xs uppercase tracking-widest shadow-lg"
          >
            Увійти через Steam
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] py-10 sm:py-12 relative isolate overflow-hidden">
      {/* Розмитий атмосферний фон */}
      <div className="absolute inset-0 -z-20 pointer-events-none">
        <img
          src="/images/hero-bg.jpg"
          alt="Outland DayZ Background"
          style={{ filter: "blur(6px) brightness(0.85)" }}
          className="h-full w-full scale-105 object-cover"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-black/40 pointer-events-none" />
      <div className="hero-vignette absolute inset-0 -z-10 pointer-events-none" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-50 pointer-events-none" />

      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-[430px_1fr] items-start">
          {/* Ліва колонка: Профіль + Баланс + Поповнення та Промокод */}
          <div className="space-y-5">
            {/* Картка гравця та статусу */}
            <section className="hero-content-card rounded-3xl bg-black/50 backdrop-blur-md border border-white/10 p-6 sm:p-7 shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      width={68}
                      height={68}
                      alt="Steam avatar"
                      unoptimized
                      className="h-[68px] w-[68px] shrink-0 rounded-2xl border border-[#b6c980]/40 object-cover shadow-lg"
                    />
                  ) : (
                    <div className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-2xl bg-[#1c2413] text-2xl font-bold text-[#b6c980] border border-[#b6c980]/40 shadow-lg">
                      {user.name ? user.name.slice(0, 1) : "U"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-[#b6c980] animate-pulse" />
                      <span className="eyebrow text-[10px] text-[#b6c980]">Steam Профіль</span>
                    </div>
                    <h1 className="heading truncate text-2xl sm:text-3xl text-[#f2f5e9] leading-none">{user.name}</h1>
                    <button
                      onClick={handleCopySteamId}
                      title="Скопіювати Steam ID"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-mono text-stone-400 hover:text-[#b6c980] transition cursor-pointer"
                    >
                      <span>ID: {user.steamId}</span>
                      {copiedCode === "steam" ? (
                        <Check size={13} className="text-[#b6c980]" />
                      ) : (
                        <Copy size={13} className="opacity-70" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/profile/settings"
                    title="Налаштування"
                    aria-label="Налаштування"
                    className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-stone-300 hover:border-[#b6c980]/50 hover:text-white transition"
                  >
                    <Settings size={17} />
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Вийти з акаунта"
                    aria-label="Вийти з акаунта"
                    className="grid h-11 w-11 place-items-center rounded-xl border border-red-500/25 bg-red-500/10 text-[#f0b3aa] hover:bg-red-500/20 transition cursor-pointer"
                  >
                    <LogOut size={17} />
                  </button>
                </div>
              </div>

              {/* Панель Баланс + VIP */}
              <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-2 gap-3.5">
                <div className="rounded-2xl bg-black/40 border border-white/10 p-3.5 flex items-center gap-3.5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/25">
                    <Coins size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">Баланс</p>
                    <p className="mt-0.5 text-xl font-bold font-mono text-[#b6c980] truncate">{balance} ₴</p>
                  </div>
                </div>

                <Link
                  href="/vip"
                  className="rounded-2xl bg-black/40 border border-white/10 p-3.5 flex items-center gap-3.5 hover:border-[#d9ca72]/40 transition"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#282512] text-[#d9ca72] border border-[#d9ca72]/25">
                    <Crown size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">Статус</p>
                    <p className="mt-0.5 text-base font-bold text-stone-100 truncate">{vipLabel}</p>
                  </div>
                </Link>
              </div>
            </section>

            {/* Картка фінансів: Поповнення + Промокод */}
            <section className="hero-content-card rounded-3xl bg-black/50 backdrop-blur-md border border-white/10 p-6 sm:p-7 shadow-2xl space-y-6">
              {/* Поповнення Monobank */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                    <CreditCard size={17} className="text-[#b6c980]" />
                    Поповнення балансу
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400">Monobank</span>
                </div>

                <div className="flex gap-2.5">
                  <input
                    type="number"
                    placeholder="Сума, ₴"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-12 rounded-xl bg-black/40 border border-white/10 px-4 text-sm text-white placeholder-stone-500 focus:border-[#b6c980] focus:outline-none transition font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={handleTopUp}
                    className="btn !min-h-12 h-12 rounded-xl !px-5 text-xs uppercase tracking-wider shrink-0 cursor-pointer"
                  >
                    Поповнити <ArrowUpRight size={15} />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {[50, 100, 250, 500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(String(preset))}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-stone-300 hover:border-[#b6c980]/50 hover:text-[#b6c980] transition cursor-pointer"
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400">Steam ID додається автоматично</span>
                </div>
              </div>

              {/* Промокод */}
              <div className="pt-5 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                    <Ticket size={17} className="text-[#b6c980]" />
                    Промокод
                  </span>
                  <span className="text-[11px] text-stone-400">Бонус на рахунок</span>
                </div>

                <div className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="ВВЕДІТЬ КОД"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    className="w-full h-12 rounded-xl bg-black/40 border border-white/10 px-4 text-sm uppercase tracking-wider text-white placeholder-stone-500 focus:border-[#b6c980] focus:outline-none transition font-mono"
                  />
                  <button
                    onClick={handleActivatePromo}
                    className="btn btn-outline !min-h-12 h-12 rounded-xl !px-5 text-xs uppercase tracking-wider shrink-0 cursor-pointer hover:border-[#b6c980]"
                  >
                    Активувати
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Права колонка: Історія покупок */}
          <section className="hero-content-card rounded-3xl bg-black/50 backdrop-blur-md border border-white/10 p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
              <div className="flex items-center gap-3.5">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/30">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="heading text-2xl sm:text-3xl text-white leading-none">Історія покупок</h2>
                  <p className="mt-1.5 text-xs text-stone-400">
                    Скопіюйте команду <code className="text-[#b6c980] font-mono">!code</code> та введіть її у чат на сервері для видачі
                  </p>
                </div>
              </div>

              <span className="rounded-xl bg-black/40 border border-white/10 px-3.5 py-2 text-xs font-mono text-stone-300">
                Замовлень: <b className="text-[#b6c980]">{orders.length}</b>
              </span>
            </div>

            {orders.length > 0 ? (
              <div className="mt-5 max-h-[540px] overflow-y-auto space-y-3.5 pr-1.5 custom-scrollbar">
                {orders.map((order) => {
                  const displayCode = order.code || "OUT-7492-X9M1";
                  const fullCommand = `!code ${displayCode}`;

                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl bg-black/40 border border-white/10 p-5 transition hover:border-[#b6c980]/35"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="text-[#b6c980] shrink-0" size={16} />
                          <span className="font-mono text-sm font-bold text-white">{order.id}</span>
                          <span className="text-stone-600">·</span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-stone-400">
                            <Calendar size={13} /> {order.date}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyCode(displayCode)}
                            className="inline-flex items-center gap-2.5 rounded-xl bg-[#1c2413] hover:bg-[#263119] border border-[#b6c980]/30 px-3 py-1.5 text-xs font-mono text-[#b6c980] transition cursor-pointer"
                            title="Скопіювати команду видачі"
                          >
                            <Terminal size={13} />
                            <span className="font-bold">{fullCommand}</span>
                            <span className="rounded-lg bg-black/40 px-2 py-0.5 text-[10px] uppercase font-sans font-bold text-[#dce8b3]">
                              {copiedCode === displayCode ? "Скопійовано" : "Копіювати"}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-stone-200 truncate pr-3">{item.name}</span>
                            <span className="font-mono text-stone-400 shrink-0">{item.price} ₴</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-sm">
                        <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Разом:</span>
                        <span className="font-mono text-base font-bold text-[#b6c980]">{order.total} ₴</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-black/40 border border-white/10 p-12 text-center text-stone-400 text-sm flex flex-col items-center justify-center gap-3">
                <ShoppingBag size={28} className="text-stone-500" />
                <p>У вас поки немає замовлень.</p>
                <Link href="/shop" className="btn !min-h-10 rounded-xl !px-5 text-xs">
                  Перейти в магазин
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
