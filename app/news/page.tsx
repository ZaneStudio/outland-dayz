import Link from "next/link";
import { ArrowLeft, Calendar, Newspaper, Sparkles } from "lucide-react";
import { getManagedNews } from "@/lib/news-store";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await getManagedNews();

  return (
    <main className="min-h-[calc(100vh-64px)] py-8 sm:py-10 relative isolate overflow-x-clip">
      {/* Атмосферний розмитий фон у єдиному стилі сайту */}
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

      <div className="shell max-w-5xl space-y-5">
        {/* Компактна верхня шапка без пустого місця */}
        <section className="hero-content-card rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 px-5 py-4 sm:px-6 sm:py-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/35 shadow-lg">
              <Newspaper size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#b6c980]" />
                <p className="eyebrow text-xs text-[#b6c980] tracking-widest">Архів подій · Outland DayZ</p>
              </div>
              <h1 className="heading text-2xl sm:text-4xl text-[#f2f5e9] mt-1">Усі новини сервера</h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="h-11 rounded-xl bg-black/45 border border-white/10 px-4 flex items-center gap-2">
              <Sparkles size={15} className="text-[#b6c980]" />
              <span className="text-[13px] text-stone-200">Публікацій:</span>
              <b className="font-mono text-sm font-bold text-[#dce8b3]">{news.length}</b>
            </div>
            <Link
              href="/"
              className="btn btn-outline !min-h-11 h-11 !px-4 rounded-xl text-[13px] uppercase tracking-wider inline-flex items-center gap-2"
            >
              <ArrowLeft size={15} /> На головну
            </Link>
          </div>
        </section>

        {/* Компактна сітка новин */}
        {news.length === 0 ? (
          <div className="hero-content-card rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 p-10 text-center text-stone-300 shadow-2xl flex flex-col items-center gap-2.5">
            <Newspaper size={30} className="text-stone-400" />
            <p className="text-base font-bold text-stone-200">Новин поки немає</p>
            <p className="text-sm text-stone-400">Слідкуйте за оновленнями — незабаром тут з’являться перші анонси.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {news.map((item, index) => (
              <article
                key={item.id}
                id={item.slug}
                className="hero-content-card group rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 overflow-hidden shadow-2xl flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-[#b6c980]/40"
              >
                {item.image && (
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden border-b border-white/10 bg-[#11150d]">
                    <img
                      src={item.image}
                      alt={item.title}
                      decoding="async"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg bg-[#1c2413] border border-[#b6c980]/35 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#c8dc8f]">
                      Новина #{String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs sm:text-[13px] font-semibold text-stone-200 inline-flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#b6c980]" />
                      {item.date}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl sm:text-2xl font-bold text-[#f4f7ed] leading-snug transition group-hover:text-[#dce8b3]">
                    {item.title}
                  </h2>

                  <p className="mt-2.5 text-sm sm:text-[15px] leading-relaxed text-stone-200 whitespace-pre-wrap">
                    {item.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
