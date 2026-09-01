"use client";

import Link from "next/link";
import { ArrowRight, Newspaper, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

type NewsItem = {
  id?: string;
  title: string;
  text: string;
  date: string;
};

export function HeroSidebar() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNews = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/news", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Не вдалося завантажити новини");
      }

      const data = await response.json();

      setNews(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (error) {
      console.error("News loading error:", error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();

    // Оновлюємо новини кожні 30 секунд
    const interval = setInterval(loadNews, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside
      className="
        absolute
        right-8
        top-1/2
        z-20
        hidden
        w-[460px]
        -translate-y-1/2
        xl:block
      "
    >
      <div
        className="
          overflow-hidden
          border
          border-white/10
          bg-[#090c09]/90
          shadow-2xl
          backdrop-blur-xl
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center border border-[#8b9f5c]/30 bg-[#1c2414]">
              <Newspaper size={17} className="text-[#b7c77d]" />
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#b7c77d]">
                Останні новини
              </p>

              <p className="mt-1 text-[10px] uppercase tracking-wider text-stone-500">
                Події сервера
              </p>
            </div>
          </div>

          <Link
            href="/news"
            className="
              flex
              items-center
              gap-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-stone-400
              transition
              hover:text-[#c4da83]
            "
          >
            Усі новини
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* CONTENT */}
        <div className="px-5">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-12 text-sm text-stone-500">
              <RefreshCw size={16} className="animate-spin" />
              Завантаження новин...
            </div>
          ) : news.length === 0 ? (
            <div className="py-12 text-center">
              <Newspaper
                size={28}
                className="mx-auto text-stone-600"
              />

              <p className="mt-4 text-sm text-stone-500">
                Новин поки немає
              </p>
            </div>
          ) : (
            <div>
              {news.map((item, index) => (
                <article
                  key={item.id ?? `${item.title}-${index}`}
                  className="
                    group
                    border-b
                    border-white/[0.08]
                    py-5
                    last:border-b-0
                  "
                >
                  <div className="flex gap-4">
                    {/* Номер */}
                    <div
                      className="
                        flex
                        h-14
                        w-14
                        shrink-0
                        items-center
                        justify-center
                        border
                        border-white/10
                        bg-black/50
                        text-[11px]
                        font-bold
                        tracking-wider
                        text-stone-600
                        transition
                        group-hover:border-[#84955a]/40
                        group-hover:text-[#b7c77d]
                      "
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    {/* Текст */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3
                          className="
                            line-clamp-1
                            text-sm
                            font-bold
                            uppercase
                            tracking-wide
                            text-[#c4da83]
                            transition
                            group-hover:text-[#e0edb1]
                          "
                        >
                          {item.title}
                        </h3>

                        <time
                          className="
                            shrink-0
                            text-[9px]
                            uppercase
                            tracking-wider
                            text-stone-600
                          "
                        >
                          {item.date}
                        </time>
                      </div>

                      <p
                        className="
                          mt-2
                          line-clamp-2
                          text-xs
                          leading-relaxed
                          text-stone-400
                        "
                      >
                        {item.text}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t border-white/10 bg-black/20 px-6 py-4">
          <Link
            href="/news"
            className="
              flex
              items-center
              justify-center
              gap-2
              text-[10px]
              font-bold
              uppercase
              tracking-[0.2em]
              text-stone-400
              transition
              hover:text-[#c4da83]
            "
          >
            Переглянути всі новини
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </aside>
  );
}