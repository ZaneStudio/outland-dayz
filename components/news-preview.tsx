"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ManagedNews } from "@/lib/news-store";

export function NewsPreview() {
  const [items, setItems] = useState<ManagedNews[] | null>(null);
  useEffect(() => { fetch("/api/news").then((response) => response.json()).then((news: ManagedNews[]) => setItems(news.slice(0, 3))).catch(() => setItems([])); }, []);
  if (items === null) return <div className="mt-10 grid gap-5 md:grid-cols-3"><div className="panel h-44 animate-pulse" /><div className="panel h-44 animate-pulse" /><div className="panel h-44 animate-pulse" /></div>;
  if (!items.length) return <div className="panel mt-10 p-8 text-center text-stone-400">Новин поки немає. Створіть першу в адмінпанелі.</div>;
  return <div className="mt-10 grid gap-5 md:grid-cols-3">{items.map((news) => <Link href={`/news#${news.slug}`} key={news.id} className="panel cut p-6 transition duration-300 hover:-translate-y-2 hover:border-[#84955a] hover:shadow-glow"><p className="text-xs text-[#acbd75]">{news.date}</p><h3 className="mt-3 text-lg font-bold">{news.title}</h3><p className="mt-3 text-sm leading-relaxed text-stone-400">{news.text}</p></Link>)}</div>;
}
