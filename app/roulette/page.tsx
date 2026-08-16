"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleDollarSign, Clock3, Crown, Gift, LockKeyhole, Package, Sparkles, Ticket, Trophy } from "lucide-react";

const requiredMinutes = 300;
const rouletteAdminSteamIds = new Set(["76561198988049214"]);
const prizes = [
  { label: "VIP 3 дні", icon: Crown, tone: "text-[#edc55c]" },
  { label: "50 000 монет", icon: CircleDollarSign, tone: "text-[#e5ca74]" },
  { label: "Скін «Виживальник»", icon: Gift, tone: "text-[#c6d78c]" },
  { label: "Будівельний набір", icon: Package, tone: "text-[#c6d78c]" },
  { label: "100 000 монет", icon: CircleDollarSign, tone: "text-[#e5ca74]" },
  { label: "VIP 7 днів", icon: Crown, tone: "text-[#edc55c]" },
  { label: "Зброя RPK-16", icon: Trophy, tone: "text-[#c6d78c]" },
  { label: "Custom AVATAR", icon: Sparkles, tone: "text-[#c6d78c]" },
];

type SteamUser = { steamId: string; name: string; avatar: string };
const formatTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00`;

export default function RoulettePage() {
  const [user, setUser] = useState<SteamUser | null | undefined>(undefined);
  const [playing, setPlaying] = useState(false);
  const [turn, setTurn] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [spinsAvailable, setSpinsAvailable] = useState(0);
  const [playMinutes, setPlayMinutes] = useState<number | null>(null);
  const unlocked = (playMinutes ?? 0) >= requiredMinutes;
  const isRouletteAdmin = Boolean(user && rouletteAdminSteamIds.has(user.steamId));

  useEffect(() => { fetch("/api/auth/session").then(r => r.ok ? r.json() : null).then(data => setUser(data?.user ?? null)).catch(() => setUser(null)); }, []);
  useEffect(() => { if (!user) return; fetch("/api/roulette/status", { cache: "no-store" }).then(r => r.json()).then(data => { const minutes = Number(data.minutes) || 0; setPlayMinutes(minutes); setSpinsAvailable(minutes >= requiredMinutes ? 1 : 0); }).catch(() => setPlayMinutes(0)); }, [user]);
  const spin = () => {
    if ((!isRouletteAdmin && spinsAvailable < 1) || playing) return;
    const index = Math.floor(Math.random() * prizes.length);
    setPlaying(true); setResult(null); setTurn(value => value + 5 + index);
    window.setTimeout(() => { setResult(prizes[index].label); setHistory(items => [prizes[index].label, ...items].slice(0, 3)); if (!isRouletteAdmin) setSpinsAvailable(0); setPlaying(false); }, 3900);
  };

  return <main className="roulette-page min-h-[calc(100vh-64px)] border-b border-white/10"><div className="shell py-12 sm:py-20"><div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]"><section className="animate-enter"><p className="eyebrow">Нагорода за виживання</p><h1 className="heading mt-3 text-6xl sm:text-7xl">Рулетка</h1><h2 className="mt-5 text-xl font-bold text-[#e3ebd4]">Грай на сервері та отримуй нагороди!</h2><p className="mt-4 max-w-lg leading-relaxed text-stone-300">Проведи 5 годин на сервері, щоб отримати безкоштовний оберт рулетки з цінними призами.</p>
        {user === undefined || (user && playMinutes === null) ? <div className="panel mt-9 animate-pulse p-5 text-stone-400">Завантажуємо ігрову статистику...</div> : !user ? <div className="panel cut mt-9 p-6"><LockKeyhole className="text-[#c5d983]" /><p className="mt-4 font-bold">Увійдіть через Steam</p><p className="mt-2 text-sm text-stone-400">Щоб враховувати ваш час у грі та відкривати нагороди.</p><Link href="/login" className="btn mt-5"><Ticket size={16} /> Увійти через Steam</Link></div> : <><div className="panel cut mt-9 p-5"><p className="eyebrow">{isRouletteAdmin ? "Режим адміністратора" : "Ваш час на сервері"}</p><div className="mt-4 flex items-center gap-3">{isRouletteAdmin ? <Sparkles className="text-[#e8ca67]" size={27} /> : <Clock3 className="text-[#9acb4c]" size={27} />}<p className="text-2xl font-bold">{isRouletteAdmin ? "БЕЗЛІМІТ" : <>{formatTime(playMinutes ?? 0)} <span className="text-stone-500">/ 05:00:00</span></>}</p></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-black/40"><div className="roulette-progress h-full rounded-full" style={{ width: `${isRouletteAdmin ? 100 : Math.min(100, (playMinutes ?? 0) / requiredMinutes * 100)}%` }} /></div></div><p className="mt-6 font-semibold text-[#b7d778]">{isRouletteAdmin ? "Адміністратор: необмежена кількість обертів." : spinsAvailable ? "Доступний 1 безкоштовний оберт!" : unlocked ? "Наступний оберт буде доступний після нових 5 годин гри." : `Зіграйте ще ${formatTime(requiredMinutes - (playMinutes ?? 0))} для доступу.`}</p><button onClick={spin} disabled={(!isRouletteAdmin && spinsAvailable < 1) || playing} className="btn roulette-spin-button mt-4 min-w-64 disabled:cursor-not-allowed disabled:opacity-45">{playing ? "Рулетка обертається..." : <><Sparkles size={17} /> Оберти рулетку</>}</button>{result && <div className="roulette-result animate-enter mt-5"><Gift size={19} /><span>Ви виграли: <b>{result}</b></span></div>}</>}</section>
        <section className="roulette-wheel-wrap animate-enter delay-2"><div className="roulette-pointer" /><div className={`roulette-wheel ${playing ? "is-spinning" : ""}`} style={{ "--turn": turn } as React.CSSProperties}><div className="roulette-center"><span>OUTLAND</span><span>DAYZ</span></div>{prizes.map((prize, index) => { const Icon = prize.icon; return <div key={prize.label} className="roulette-prize" style={{ "--angle": `${index * 45}deg` } as React.CSSProperties}><Icon className={prize.tone} size={28} /><span>{prize.label}</span></div>; })}</div></section></div>
      <section className="panel cut mt-14 grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_360px]"><div><p className="eyebrow">Як це працює?</p><div className="mt-6 grid gap-6 sm:grid-cols-3">{[[Clock3,"1. Грай на сервері","Проводь час на сервері — він зараховується до прогресу."],[Ticket,"2. Отримуй оберти","Кожні 5 годин відкривають один безкоштовний оберт."],[Gift,"3. Вигравай призи","Випробуй удачу та забери цінну нагороду."]].map(([Icon,title,text])=>{const I=Icon as typeof Clock3;return <div key={String(title)}><I className="text-[#b9d27c]" size={33}/><h3 className="mt-4 font-bold">{String(title)}</h3><p className="mt-2 text-sm leading-relaxed text-stone-400">{String(text)}</p></div>})}</div></div><aside className="border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"><p className="eyebrow">Ваша історія виграшів</p><div className="mt-5 space-y-3">{history.length ? history.map((item,index)=><div key={`${item}-${index}`} className="flex items-center gap-3 border-b border-white/10 pb-3 text-sm"><Gift className="text-[#bfd47f]" size={16}/><span className="flex-1">{item}</span><span className="text-xs text-stone-500">щойно</span></div>) : <p className="rounded border border-dashed border-white/10 p-4 text-sm text-stone-500">Виграшів поки немає. Зробіть свій перший оберт.</p>}</div></aside></section>
    </div></main>;
}
