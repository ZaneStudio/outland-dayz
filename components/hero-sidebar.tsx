"use client";

import Link from "next/link";
import { Newspaper, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

type News = { id: string; title: string; text: string; date: string; image?: string | null };

export function HeroSidebar() {
  const [news, setNews] = useState<News[] | null>(null);
  useEffect(() => { fetch("/api/news", { cache: "no-store" }).then((response) => response.ok ? response.json() : []).then((items) => setNews(Array.isArray(items) ? items.slice(0, 2) : [])).catch(() => setNews([])); }, []);
  return <aside className="absolute right-8 top-1/2 z-20 hidden w-80 -translate-y-1/2 lg:block lg:w-96 xl:w-[420px]"><div className="hero-news-panel rounded-2xl border border-white/10 bg-black/50 p-6 shadow-2xl backdrop-blur-md"><div className="flex items-center justify-between border-b border-white/10 pb-4"><div className="flex items-center gap-2.5"><Newspaper className="text-[#b6c980]" size={18} /><h2 className="text-xs font-bold uppercase tracking-widest text-stone-200">Останні новини</h2></div><Link href="/news" className="flex items-center gap-1 text-xs font-semibold text-[#b6c980] transition hover:text-white">Усі новини <ArrowRight size={14} /></Link></div><div className="mt-4 space-y-3">{news === null ? <div className="space-y-3 py-1"><div className="h-20 animate-pulse rounded-xl bg-white/5" /><div className="h-20 animate-pulse rounded-xl bg-white/5" /></div> : news.length === 0 ? <p className="py-4 text-center text-xs text-stone-400">Новин поки немає</p> : news.map((item, index) => <article key={item.id} className="group relative flex gap-4 rounded-xl border border-white/5 bg-black/30 p-3.5 transition hover:border-[#84955a]/50 hover:bg-black/45">{item.image && <img src={item.image} alt="" className="h-16 w-20 shrink-0 rounded-lg border border-white/10 object-cover" />}<div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-mono text-stone-500">0{index + 1}</span><span className="text-[10px] text-[#b6c980]">{item.date}</span></div><h3 className="mt-1 truncate text-xs font-bold text-white transition group-hover:text-[#b6c980]">{item.title}</h3><p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-stone-400">{item.text}</p></div></article>)}</div><div className="mt-4 border-t border-white/10 pt-3 text-center"><Link href="/news" className="text-xs font-medium text-stone-400 transition hover:text-white">ПЕРЕГЛЯНУТИ ВСІ НОВИНИ →</Link></div></div></aside>;
}
