import Link from "next/link";
import { Compass, Download, Flame, Radio, Shield, ShoppingBag, Swords, Users } from "lucide-react";

import { ConnectModal } from "@/components/connect-modal";
import { HeroSidebar } from "@/components/hero-sidebar";
import { siteConfig } from "@/lib/config";

export default function Home() {
  return (
    <main className="relative isolate overflow-x-clip">
      {/* Зафіксований атмосферний фон на весь екран */}
      <div className="fixed inset-0 h-screen w-screen overflow-hidden -z-20 pointer-events-none">
        <img
          src="/images/hero-bg.jpg"
          alt="Outland DayZ Background"
          className="h-full w-full scale-105 object-cover object-center"
        />
      </div>
      <div className="fixed inset-0 -z-10 bg-black/25 pointer-events-none" />
      <div className="hero-vignette fixed inset-0 -z-10 pointer-events-none" />
      <div className="grid-lines fixed inset-0 -z-10 opacity-55 pointer-events-none" />

      {/* =====================================================
          ПЕРШИЙ ЕКРАН: ПОВНОЕКРАННИЙ СИМЕТРИЧНИЙ HERO
      ===================================================== */}
      <section className="shell min-h-[calc(100vh-64px)] flex items-center py-10 sm:py-14">
        <div className="w-full grid gap-6 lg:grid-cols-12 items-stretch">
          {/* Ліва головна картка (7 колонок) */}
          <div className="lg:col-span-7 hero-content-card rounded-3xl bg-black/50 p-7 sm:p-8 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col justify-between">
            {/* Верхня шапка — ідентична за висотою (h-14) до шапки правої картки */}
            <div className="flex h-14 items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/35 shadow-md">
                  <Radio size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#b6c980] animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#b6c980]">
                      Зона виживання · Україна
                    </span>
                  </div>
                  <p className="text-base font-extrabold uppercase tracking-wider text-[#f2f5e9] mt-0.5 truncate">
                    Офіційний сервер
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-xl bg-black/45 border border-white/10 px-3.5 py-1.5 text-xs font-mono font-bold text-[#dce8b3]">
                {siteConfig.ip}:{siteConfig.port}
              </span>
            </div>

            {/* Центральний контент */}
            <div className="my-6 flex-1 flex flex-col justify-center">
              <h1 className="heading animate-enter delay-1 text-6xl text-[#f2f5e9] drop-shadow-2xl sm:text-7xl xl:text-[80px] leading-[0.9]">
                {siteConfig.name}
              </h1>

              <p className="animate-enter delay-2 mt-4 text-xl font-bold text-[#dfe7cf] sm:text-2xl">
                Український сервер DayZ
              </p>

              <p className="animate-enter delay-2 mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-stone-200">
                Виживай. Шукай. Борись. Твоя історія починається там, де закінчується цивілізація — суворий світ,
                власна система будівництва та жива спільнота.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-xl bg-black/45 border border-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-stone-200">
                  <Swords size={14} className="text-[#b6c980]" /> Survival · PvP
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-black/45 border border-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-stone-200">
                  <Compass size={14} className="text-[#b6c980]" /> Власне будівництво
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-black/45 border border-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-stone-200">
                  <Shield size={14} className="text-[#b6c980]" /> Активна модерація
                </span>
              </div>
            </div>

            {/* Нижні кнопки — на одній горизонтальній лінії з кнопкою «Усі новини» справа */}
            <div className="animate-enter delay-3 pt-5 border-t border-white/10 grid gap-3.5 sm:grid-cols-2">
              <ConnectModal />
              <a
                href="/launcher-updates/OutLand-Launcher-Beta-Setup-1.2.0-beta.14-x64.exe"
                download
                className="btn btn-outline rounded-xl !min-h-[52px] h-[52px] !px-6 !text-[13px] w-full"
              >
                <Download size={18} />
                Скачати лаунчер
              </a>
            </div>
          </div>

          {/* Права картка новин (5 колонок) */}
          <div className="lg:col-span-5">
            <HeroSidebar />
          </div>
        </div>
      </section>

      {/* =====================================================
          ДРУГИЙ ЕКРАН (ПРИ ПРОКРУТЦІ): ПЕРЕВАГИ ТА СПІЛЬНОТА
      ===================================================== */}
      <div className="border-t border-white/10 bg-black/45 backdrop-blur-md py-16 sm:py-20">
        <div className="shell space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <article className="hero-content-card rounded-3xl bg-black/50 border border-white/10 p-6 sm:p-7 shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-[#b6c980]/40">
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/35 shadow-md">
                  <Flame size={22} />
                </div>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#b6c980]">
                  01 · Атмосфера
                </span>
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#f2f5e9]">Власне будівництво та лут</h3>
              <p className="mt-2.5 text-sm sm:text-[15px] leading-relaxed text-stone-200">
                Унікальні механіки зведення баз, продуманий баланс спорядження та авторські модифікації спеціально для нашого сервера.
              </p>
            </article>

            <article className="hero-content-card rounded-3xl bg-black/50 border border-white/10 p-6 sm:p-7 shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-[#b6c980]/40">
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/35 shadow-md">
                  <Shield size={22} />
                </div>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#b6c980]">
                  02 · Безпека
                </span>
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#f2f5e9]">Чесна гра та стабільність</h3>
              <p className="mt-2.5 text-sm sm:text-[15px] leading-relaxed text-stone-200">
                Високий FPS, мінімальний пінг, надійний захист від нечесної гри та чуйна адміністрація, яка завжди на зв’язку.
              </p>
            </article>

            <article className="hero-content-card rounded-3xl bg-black/50 border border-white/10 p-6 sm:p-7 shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-[#b6c980]/40">
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/35 shadow-md">
                  <Users size={22} />
                </div>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#b6c980]">
                  03 · Ком’юніті
                </span>
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#f2f5e9]">Жива українська спільнота</h3>
              <p className="mt-2.5 text-sm sm:text-[15px] leading-relaxed text-stone-200">
                Щоденні рейди, торгівля між кланами, регулярні івенти у Зоні та активне спілкування в нашому Discord.
              </p>
            </article>
          </div>

          <div className="hero-content-card rounded-3xl bg-black/50 border border-white/10 p-7 sm:p-9 shadow-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#b6c980]" />
                <p className="eyebrow text-xs text-[#b6c980]">Наша спільнота · Outland DayZ</p>
              </div>
              <h2 className="heading mt-2.5 text-3xl sm:text-5xl text-[#f2f5e9]">Не виживай наодинці</h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-stone-200">
                Приєднуйся до української DayZ спільноти у Discord — знаходь напарників для загону, слідкуй за анонсами
                вайпів або обирай необхідне спорядження в магазині сервера.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 shrink-0">
              <Link
                href="/shop"
                className="btn btn-outline rounded-xl !min-h-12 h-12 !px-6 !text-[13px] w-full sm:w-auto"
              >
                <ShoppingBag size={17} />
                Магазин спорядження
              </Link>
              <a
                className="btn rounded-xl !min-h-12 h-12 !px-6 !text-[13px] w-full sm:w-auto"
                href={siteConfig.discord}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Users size={17} />
                Приєднатися до Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
