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
    <aside className="absolute right-8 top-1/2 z-20 hidden -translate-y-1/2 lg:block lg:w-[410px] xl:w-[450px]">
      <div className="hero-content-card hero-news-panel rounded-2xl border border-white/10 bg-black/50 p-6 shadow-2xl backdrop-blur-md">
        {/* Шапка віджета новин */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/35 shadow-md">
              <Newspaper size={19} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#b6c980]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#b6c980]">
                  Архів подій
                </span>
              </div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#f2f5e9] mt-0.5">
                Останні новини
              </h2>
            </div>
          </div>
        </div>

        {/* Список останніх новин */}
        <div className="mt-4 space-y-3.5">
          {news === null ? (
            <div className="space-y-3.5 py-1">
              <div className="h-24 animate-pulse rounded-xl bg-white/5" />
              <div className="h-24 animate-pulse rounded-xl bg-white/5" />
            </div>
          ) : news.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-300">Новин поки немає</p>
          ) : (
            news.map((item) => (
              <Link
                key={item.id}
                href="/news"
                className="group flex gap-4 rounded-xl border border-white/10 bg-black/45 p-3.5 transition-all duration-300 hover:border-[#b6c980]/45 hover:bg-black/60"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    decoding="async"
                    className="h-20 w-24 sm:h-[84px] sm:w-[104px] shrink-0 rounded-xl border border-white/10 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                )}
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#c8dc8f]">
                    <Calendar size={12} className="text-[#b6c980] shrink-0" />
                    <span>{item.date}</span>
                  </div>

                  <h3 className="mt-1 text-sm sm:text-[15px] font-bold text-[#f4f7ed] leading-snug transition group-hover:text-[#dce8b3] line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="mt-1.5 line-clamp-2 text-xs sm:text-[13px] leading-relaxed text-stone-200">
                    {item.text}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Єдина кнопка переходу до всіх новин у стилі сайту */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <Link
            href="/news"
            className="btn btn-outline w-full !min-h-11 h-11 rounded-xl text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2"
          >
            <span>Усі новини</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
