"use client";

import Link from "next/link";
import { Newspaper, ArrowRight, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

type News = {
  id: string;
  title: string;
  text: string;
  date: string;
  image?: string | null;
};

let memoryNewsCache: News[] | null = null;

export function HeroSidebar() {
  const [news, setNews] = useState<News[] | null>(() => memoryNewsCache);

  useEffect(() => {
    fetch("/api/news")
      .then((response) => (response.ok ? response.json() : []))
      .then((items) => {
        const latest = Array.isArray(items) ? items.slice(0, 2) : [];
        memoryNewsCache = latest;
        setNews(latest);
      })
      .catch(() => {
        if (!memoryNewsCache) setNews([]);
      });
  }, []);

  return (
    <aside className="h-full flex">
      <div className="hero-content-card hero-news-panel w-full h-full flex flex-col justify-between rounded-3xl border border-white/10 bg-black/50 p-7 sm:p-8 shadow-2xl backdrop-blur-md">
        {/* Шапка віджета новин — ідентична за висотою до шапки лівої картки */}
        <div className="flex h-14 items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/35 shadow-md">
              <Newspaper size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#b6c980]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#b6c980]">
                  Архів подій
                </span>
              </div>
              <h2 className="text-base font-extrabold uppercase tracking-wider text-[#f2f5e9] mt-0.5 truncate">
                Останні новини
              </h2>
            </div>
          </div>

          <span className="shrink-0 rounded-xl bg-black/45 border border-white/10 px-3.5 py-1.5 text-xs font-mono font-bold text-[#dce8b3]">
            Актуально
          </span>
        </div>

        {/* Список останніх новин — рівномірно заповнює середину картки без пустого місця */}
        <div className="my-6 flex-1 flex flex-col">
          {news === null ? (
            <div className="grid flex-1 grid-rows-2 gap-3.5">
              <div className="animate-pulse rounded-2xl bg-white/5" />
              <div className="animate-pulse rounded-2xl bg-white/5" />
            </div>
          ) : news.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-black/35 p-6 text-center text-sm text-stone-300">
              Новин поки немає
            </div>
          ) : (
            <div className="grid flex-1 grid-rows-2 gap-3.5">
              {news.map((item) => (
                <Link
                  key={item.id}
                  href="/news"
                  className="group flex h-full items-center gap-4 rounded-2xl border border-white/10 bg-black/45 p-3.5 sm:p-4 transition-all duration-300 hover:border-[#b6c980]/45 hover:bg-black/65"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      decoding="async"
                      className="h-20 w-24 sm:h-[88px] sm:w-[112px] shrink-0 rounded-xl border border-white/10 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  )}
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#c8dc8f]">
                      <Calendar size={13} className="text-[#b6c980] shrink-0" />
                      <span>{item.date}</span>
                    </div>

                    <h3 className="mt-1 text-[15px] sm:text-base font-bold text-[#f4f7ed] leading-snug transition group-hover:text-[#dce8b3] line-clamp-1">
                      {item.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-[13px] sm:text-sm leading-relaxed text-stone-200">
                      {item.text}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Єдина кнопка переходу до всіх новин — на одній лінії з кнопками лівої картки */}
        <div className="pt-5 border-t border-white/10">
          <Link
            href="/news"
            className="btn btn-outline w-full !min-h-[52px] h-[52px] rounded-xl text-[13px] uppercase tracking-wider inline-flex items-center justify-center gap-2"
          >
            <span>Усі новини</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
