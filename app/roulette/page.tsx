"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleDollarSign, Clock3, Crown, Gift, LockKeyhole, Package, Sparkles, Ticket, Trophy, Coins } from "lucide-react";
import type { RoulettePrize } from "@/lib/roulette-store";

const requiredMinutes = 300;
const rouletteAdminSteamIds = new Set(["76561198988049214", "76561199170253798"]);
const icons = { crown: Crown, coins: CircleDollarSign, gift: Gift, package: Package, trophy: Trophy, sparkles: Sparkles };
type SteamUser = { steamId: string; name: string; avatar: string };
const formatTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00`;

export default function RoulettePage() {
  const [user, setUser] = useState<SteamUser | null | undefined>(undefined);
  const [balance, setBalance] = useState<number | null>(null);
  const [prizes, setPrizes] = useState<RoulettePrize[]>([]);
  const [playMinutes, setPlayMinutes] = useState<number | null>(null);
  const [spinsAvailable, setSpinsAvailable] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  
  const isRouletteAdmin = Boolean(user && rouletteAdminSteamIds.has(user.steamId));

  useEffect(() => { 
    fetch("/api/auth/session").then(r => r.ok ? r.json() : null).then(data => setUser(data?.user ?? null)).catch(() => setUser(null)); 
    fetch("/api/roulette/prizes", { cache: "no-store" }).then(r => r.json()).then(setPrizes).catch(() => setPrizes([])); 
    fetch("/api/balance", { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(d => setBalance(d?.balance ?? null));
  }, []);

  useEffect(() => { 
    if (!user) return; 
    fetch("/api/roulette/status", { cache: "no-store" }).then(r => r.json()).then(data => { setPlayMinutes(Number(data.minutes) || 0); setSpinsAvailable(Number(data.rouletteSpins) || 0); }).catch(() => setPlayMinutes(0)); 
  }, [user]);

  const spin = () => {
    if (!prizes.length || (!isRouletteAdmin && spinsAvailable < 1) || playing) return;
    const index = Math.floor(Math.random() * prizes.length);
    const sector = 360 / prizes.length;
    const current = ((rotation % 360) + 360) % 360;
    const correction = (360 - ((current + index * sector) % 360)) % 360;
    const target = rotation + 7 * 360 + correction;
    setPlaying(true); 
    setResult(null); 
    setRotation(target);
    window.setTimeout(() => { 
      setResult(prizes[index].label); 
      setHistory(items => [prizes[index].label, ...items].slice(0, 3)); 
      if (!isRouletteAdmin) setSpinsAvailable(0); 
      setPlaying(false); 
    }, 4700);
  };

  const ready = isRouletteAdmin || spinsAvailable > 0;
  const sector = prizes.length ? 360 / prizes.length : 45;

  return (
    <main className="min-h-screen pb-24 relative isolate overflow-hidden">
      {/* Атмосферний фон */}
      <div className="absolute inset-0 -z-20 pointer-events-none">
        <img
          src="/images/hero-bg.jpg"
          alt="Outland DayZ Background"
          className="h-full w-full scale-105 object-cover"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-black/40 pointer-events-none" />
      <div className="hero-vignette absolute inset-0 -z-10 pointer-events-none" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-50 pointer-events-none" />

      {/* Верхня панель з балансом (без лінії) */}
      <section className="relative py-6 sm:py-8">
        <div className="shell flex items-center justify-end">
          {balance !== null && (
            <div className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 flex min-w-52 items-center gap-3 px-5 py-3 shadow-xl">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#2a351b] text-[#d8ec9a] border border-white/5">
                <Coins size={18} />
              </span>
              <div>
                <p className="eyebrow">Ваш баланс</p>
                <p className="mt-0.5 text-lg font-bold text-[#d8ec9a]">{balance} ₴</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="shell mt-6 sm:mt-8">
        <div className="grid items-stretch gap-8 lg:grid-cols-[1fr_1fr]">
          
          {/* Ліва плашка */}
          <section className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 p-8 shadow-2xl animate-enter flex flex-col justify-between">
            <div>
              <p className="eyebrow">Нагорода за виживання</p>
              <h1 className="heading mt-2 text-5xl sm:text-6xl text-[#f2f5e9]">Рулетка</h1>
              <h2 className="mt-3 text-lg font-bold text-[#e3ebd4]">Грай на сервері та отримуй нагороди!</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-300">
                Проведи 5 годин на сервері, щоб отримати безкоштовний оберт рулетки з цінними призами.
              </p>
            </div>

            <div className="mt-8">
              {user === undefined || (user && playMinutes === null) ? (
                <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-5 text-stone-400 animate-pulse text-sm">
                  Завантажуємо ігрову статистику...
                </div>
              ) : !user ? (
                <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-6">
                  <div className="flex items-center gap-3 text-[#c5d983] mb-2">
                    <LockKeyhole size={20} />
                    <span className="font-bold text-white text-base">Увійдіть через Steam</span>
                  </div>
                  <p className="text-xs text-stone-400 mb-4">
                    Щоб враховувати ваш час у грі та відкривати нагороди.
                  </p>
                  <Link href="/login" className="btn inline-flex items-center gap-2 !min-h-11 w-full justify-center">
                    <Ticket size={16} /> Увійти через Steam
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-4">
                    <p className="eyebrow">{isRouletteAdmin ? "Режим адміністратора" : "Ваш час на сервері"}</p>
                    <div className="mt-2 flex items-center gap-3">
                      {isRouletteAdmin ? <Sparkles className="text-[#e8ca67]" size={24} /> : <Clock3 className="text-[#9acb4c]" size={24} />}
                      <p className="text-xl font-bold text-[#f2f5e9]">
                        {isRouletteAdmin ? "БЕЗЛІМІТ" : <>{formatTime(playMinutes ?? 0)} <span className="text-stone-500 text-sm">/ 05:00:00</span></>}
                      </p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/60 border border-white/10">
                      <div className="roulette-progress h-full rounded-full" style={{ width: `${isRouletteAdmin ? 100 : ((playMinutes ?? 0) % requiredMinutes) / requiredMinutes * 100}%` }} />
                    </div>
                  </div>

                  <p className="font-semibold text-[#b7d778] text-xs">
                    {isRouletteAdmin ? "Адміністратор: необмежена кількість обертів." : spinsAvailable ? `Доступно безкоштовних обертів: ${spinsAvailable}` : `Зіграйте ще ${formatTime(Math.max(0, requiredMinutes - ((playMinutes ?? 0) % requiredMinutes)))} для доступу.`}
                  </p>

                  <button 
                    onClick={spin} 
                    disabled={!ready || playing || !prizes.length} 
                    className="btn w-full !min-h-12 rounded-xl disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {playing ? "Рулетка обертається..." : <><Sparkles size={17} /> Оберти рулетку</>}
                  </button>

                  {result && (
                    <div className="rounded-xl bg-black/60 backdrop-blur-md border border-[#879d5b] p-3 animate-enter flex items-center gap-3 text-[#d7e69d] text-sm">
                      <Gift size={18} />
                      <span>Ви виграли: <b>{result}</b></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Права частина з колесом */}
          <section className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 p-8 shadow-2xl animate-enter delay-2 flex flex-col items-center justify-center">
            {prizes.length ? (
              <div className="roulette-wheel-wrap">
                <div className="roulette-pointer" />
                <div 
                  className="roulette-wheel" 
                  style={{ "--spin": `${rotation}deg`, "--counter-spin": `${-rotation}deg`, "--sector": `${sector}deg` } as React.CSSProperties}
                >
                  <div className="roulette-center">
                    <span>OUTLAND</span>
                    <span>DAYZ</span>
                  </div>
                  {prizes.map((prize, index) => { 
                    const Icon = icons[prize.icon as keyof typeof icons] || Gift; 
                    return (
                      <div key={prize.id} className="roulette-prize" style={{ "--angle": `${index * sector}deg` } as React.CSSProperties}>
                        <div className="roulette-prize-content">
                          {prize.image ? <img src={prize.image} alt="" className="roulette-prize-image" /> : <Icon className="text-[#d6df9d]" size={30} />}
                          <span>{prize.label}</span>
                        </div>
                      </div>
                    ); 
                  })}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-stone-400 text-sm">У рулетці поки немає призів. Додайте їх в адмінпанелі.</div>
            )}
          </section>

        </div>

        {/* Нижній інформаційний блок */}
        <section className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 mt-12 grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_360px] shadow-2xl">
          <div>
            <p className="eyebrow">Як це працює?</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {[
                [Clock3, "1. Грай на сервері", "Проводь час на сервері — він зараховується до прогресу."],
                [Ticket, "2. Отримуй оберти", "Кожні 5 годин відкривають один безкоштовний оберт."],
                [Gift, "3. Вигравай призи", "Випробуй удачу та забери цінну нагороду."]
              ].map(([Icon, title, text]) => {
                const I = Icon as typeof Clock3;
                return (
                  <div key={String(title)}>
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2a351b] text-[#b9d27c] border border-white/5 mb-3">
                      <I size={20} />
                    </div>
                    <h3 className="font-bold text-[#f2f5e9] text-base">{String(title)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-400">{String(text)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="eyebrow">Ваша історія виграшів</p>
            <div className="mt-5 space-y-3">
              {history.length ? history.map((item, index) => (
                <div key={`${item}-${index}`} className="flex items-center gap-3 border-b border-white/10 pb-3 text-sm text-stone-300">
                  <Gift className="text-[#bfd47f]" size={16} />
                  <span className="flex-1">{item}</span>
                  <span className="text-xs text-stone-500">щойно</span>
                </div>
              )) : (
                <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-stone-500 text-center">
                  Виграшів поки немає. Зробіть свій перший оберт.
                </p>
              )}
            </div>
          </aside>
        </section>

      </div>
    </main>
  );
}