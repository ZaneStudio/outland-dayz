import Link from "next/link";
import { Newspaper, ArrowRight } from "lucide-react";
import { getManagedNews } from "@/lib/news-store";

export async function HeroSidebar() {
  const allNews = await getManagedNews();
  const news = allNews.slice(0, 2); // Беремо останні 2 новини

  return (
    <aside className="absolute right-8 top-1/2 hidden -translate-y-1/2 w-80 lg:w-96 xl:w-[420px] lg:block z-20">
      <div className="rounded-2xl bg-black/50 p-6 backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Newspaper className="text-[#b6c980]" size={18} />
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-200">Останні новини</h2>
          </div>
          <Link 
            href="/news" 
            className="flex items-center gap-1 text-xs font-semibold text-[#b6c980] transition hover:text-white"
          >
            Усі новини <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {news.length === 0 ? (
            <p className="text-xs text-stone-400 py-4 text-center">Новин поки немає</p>
          ) : (
            news.map((item, index) => (
              <article key={item.id} className="group relative flex gap-4 rounded-xl bg-black/30 p-3.5 border border-white/5 transition hover:border-[#84955a]/50">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="h-16 w-20 flex-shrink-0 rounded-lg object-cover border border-white/10" 
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-stone-500">0{index + 1}</span>
                    <span className="text-[10px] text-[#b6c980]">{item.date}</span>
                  </div>
                  <h3 className="mt-1 truncate text-xs font-bold text-white group-hover:text-[#b6c980] transition">
                    {item.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-stone-400">
                    {item.text}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <Link 
            href="/news" 
            className="text-xs font-medium text-stone-400 hover:text-white transition"
          >
            ПЕРЕГЛЯНУТИ ВСІ НОВИНИ →
          </Link>
        </div>
      </div>
    </aside>
  );
}