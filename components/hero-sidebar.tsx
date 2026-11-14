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
      <div className="hero-content-card hero-news-panel w-full h-full flex flex-col justify-between rounded-3xl border border-white/10 bg-black/50 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div>
          {/* Шапка віджета новин */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/35 shadow-md">
                <Newspaper size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#b6c980]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#b6c980]">
                    Архів подій
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wider text-[#f2f5e9] mt-0.5">
                  Останні новини
                </h2>
              </div>
            </div>

            <span className="rounded-xl bg-black/45 border border-white/10 px-3 py-1.5 text-xs font-mono text-[#c8dc8f]">
              Актуально
            </span>
          </div>

          {/* Список останніх новин */}
          <div className="mt-5 space-y-4">
            {news === null ? (
              <div className="space-y-4 py-1">
                <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
                <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
              </div>
            ) : news.length === 0 ? (
              <p className="py-10 text-center text-sm text-stone-300">Новин поки немає</p>
            ) : (
              news.map((item) => (
                <Link
                  key={item.id}
                  href="/news"
                  className="group flex gap-4 rounded-2xl border border-white/10 bg-black/45 p-4 transition-all duration-300 hover:border-[#b6c980]/45 hover:bg-black/65"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      decoding="async"
                      className="h-20 w-24 sm:h-24 sm:w-28 shrink-0 rounded-xl border border-white/10 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  )}
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#c8dc8f]">
                      <Calendar size={13} className="text-[#b6c980] shrink-0" />
                      <span>{item.date}</span>
                    </div>

                    <h3 className="mt-1.5 text-base font-bold text-[#f4f7ed] leading-snug transition group-hover:text-[#dce8b3] line-clamp-1">
                      {item.title}
                    </h3>

                    <p className="mt-1.5 line-clamp-2 text-[13px] sm:text-sm leading-relaxed text-stone-200">
                      {item.text}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Єдина кнопка переходу до всіх новин у стилі сайту, вирівняна по нижньому краю */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <Link
            href="/news"
            className="btn btn-outline w-full !min-h-14 h-14 rounded-xl text-[13px] uppercase tracking-wider inline-flex items-center justify-center gap-2"
          >
            <span>Усі новини</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
