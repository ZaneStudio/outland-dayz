import Link from "next/link";
import { ArrowLeft, Calendar, Newspaper, Sparkles, ShieldCheck } from "lucide-react";
import { getManagedNews } from "@/lib/news-store";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await getManagedNews();

  return (
    <main className="min-h-screen pb-28 relative isolate overflow-x-clip">
      {/* Атмосферний фон у єдиному стилі сайту, зафіксований по розміру екрану */}
      <div className="fixed inset-0 h-screen w-screen overflow-hidden -z-20 pointer-events-none">
        <img
          src="/images/hero-bg.jpg"
          alt="Outland DayZ Background"
          style={{ filter: "blur(6px) brightness(0.85)" }}
          className="h-full w-full scale-105 object-cover object-center"
        />
      </div>
      <div className="fixed inset-0 -z-10 bg-black/40 pointer-events-none" />
      <div className="hero-vignette fixed inset-0 -z-10 pointer-events-none" />
      <div className="grid-lines fixed inset-0 -z-10 opacity-50 pointer-events-none" />

      <div className="shell mt-10 sm:mt-14 max-w-5xl space-y-8">
        {/* Верхня шапка розділу новин */}
        <section className="hero-content-card relative rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 p-6 sm:p-8 lg:p-10 shadow-2xl flex flex-wrap items-center justify-between gap-6 overflow-hidden group">
          <div className="absolute -right-24 -top-24 w-64 h-64 bg-[#b6c980]/10 blur-3xl rounded-full pointer-events-none group-hover:bg-[#b6c980]/15 transition duration-700" />

          <div className="flex items-start sm:items-center gap-5 min-w-0 relative z-10">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/40 shadow-xl shadow-[#b6c980]/10">
              <Newspaper size={28} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#b6c980] animate-pulse" />
                <p className="eyebrow text-[#b6c980] tracking-widest">Архів подій · Outland DayZ</p>
              </div>
              <h1 className="heading text-3xl sm:text-5xl text-[#f2f5e9] mt-2">Усі новини сервера</h1>
              <p className="mt-2 text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
                Офіційні оновлення, анонси вайпів, розробка нових механік та важливі події спільноти.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <div className="rounded-2xl bg-black/50 border border-white/10 px-4 py-2.5 flex items-center gap-2.5">
              <Sparkles size={15} className="text-[#b6c980]" />
              <span className="text-xs text-stone-400">Публікацій:</span>
              <b className="font-mono text-sm text-[#dce8b3]">{news.length}</b>
            </div>
            <Link
              href="/"
              className="btn btn-outline !min-h-11 px-5 rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-2 border-white/20 hover:bg-white/10 hover:border-[#b6c980] transition shadow-lg"
            >
              <ArrowLeft size={15} /> На головну
            </Link>
          </div>
        </section>

        {/* Сітка новин */}
        {news.length === 0 ? (
          <div className="hero-content-card rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 p-12 text-center text-stone-400 shadow-2xl flex flex-col items-center gap-3">
            <Newspaper size={32} className="text-stone-600" />
            <p className="text-base font-bold text-stone-300">Новин поки немає</p>
            <p className="text-xs text-stone-500">Слідкуйте за оновленнями — незабаром тут з’являться перші анонси.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {news.map((item, index) => (
              <article
                key={item.id}
                id={item.slug}
                className="hero-content-card group relative rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:border-[#b6c980]/40"
              >
                <div>
                  {item.image ? (
                    <div className="relative h-56 sm:h-64 w-full overflow-hidden border-b border-white/10 bg-[#11150d]">
                      <img
                        src={item.image}
                        alt={item.title}
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                        <span className="rounded-xl bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-[#b6c980]">
                          Новина #{String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="rounded-xl bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 text-[11px] font-medium text-stone-200 inline-flex items-center gap-1.5">
                          <Calendar size={12} className="text-[#b6c980]" />
                          {item.date}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 pt-6 flex items-center justify-between gap-2">
                      <span className="rounded-xl bg-[#1c2413] border border-[#b6c980]/30 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-[#b6c980]">
                        Новина #{String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-xs text-stone-400 inline-flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#b6c980]" />
                        {item.date}
                      </span>
                    </div>
                  )}

                  <div className="p-6 sm:p-7">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#f2f5e9] leading-snug transition group-hover:text-[#dce8b3]">
                      {item.title}
                    </h2>
                    <p className="mt-3.5 text-sm leading-relaxed text-stone-300 whitespace-pre-wrap">{item.text}</p>
                  </div>
                </div>

                <div className="px-6 sm:px-7 pb-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
                  <span className="inline-flex items-center gap-1.5 text-[#b6c980]">
                    <ShieldCheck size={14} /> Outland DayZ · Офіційно
                  </span>
                  <span className="font-mono text-[11px] text-stone-500">{item.date}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
