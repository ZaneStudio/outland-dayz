import Link from "next/link";
import { Compass, Download, Flame, Radio, Shield, ShoppingBag, Swords, Users } from "lucide-react";

import { ConnectModal } from "@/components/connect-modal";
import { HeroSidebar } from "@/components/hero-sidebar";
import { siteConfig } from "@/lib/config";

export default function Home() {
  return (
    <main className="relative isolate min-h-[calc(100vh-64px)] overflow-x-clip pb-20">
      {/* Єдиний атмосферний фон на всю сторінку без чорних обривів */}
      <div className="fixed inset-0 h-screen w-screen overflow-hidden -z-20 pointer-events-none">
        <img
          src="/images/hero-bg.jpg"
          alt="Outland DayZ Background"
          className="h-full w-full scale-105 object-cover object-center brightness-90"
        />
      </div>
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/30 via-black/40 to-black/75 pointer-events-none" />
      <div className="hero-vignette fixed inset-0 -z-10 pointer-events-none" />
      <div className="grid-lines fixed inset-0 -z-10 opacity-55 pointer-events-none" />

      {/* =====================================================
          ГОЛОВНИЙ СИМЕТРИЧНИЙ ЕКРАН (HERO + НОВИНИ)
      ===================================================== */}
      <section className="shell pt-8 sm:pt-12">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-stretch">
          {/* Ліва головна картка сервера */}
          <div className="hero-content-card rounded-3xl bg-black/50 p-7 sm:p-9 lg:p-10 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col justify-between">
            <div>
              {/* Верхній статусний рядок */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#b6c980] shadow-[0_0_10px_#b6c980] animate-pulse" />
                  <p className="eyebrow text-xs text-[#c8dc8f]">Зона виживання · Україна</p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl bg-[#1c2413]/90 border border-[#b6c980]/30 px-3.5 py-1.5 text-xs font-mono text-[#dce8b3]">
                  <Radio size={13} className="text-[#b6c980]" />
                  <span>{siteConfig.ip}:{siteConfig.port}</span>
                </div>
              </div>

              {/* Назва та опис */}
              <h1 className="heading animate-enter delay-1 mt-6 text-6xl text-[#f2f5e9] drop-shadow-2xl sm:text-7xl xl:text-[86px] leading-[0.88]">
                {siteConfig.name}
              </h1>

              <p className="animate-enter delay-2 mt-4 text-xl font-bold text-[#dfe7cf] sm:text-2xl">
                Український сервер DayZ
              </p>

              <p className="animate-enter delay-2 mt-3 max-w-xl text-base sm:text-[17px] leading-relaxed text-stone-200">
                Виживай у суворому постапокаліптичному світі. Власна система будівництва, збалансована економіка,
                динамічні події та напружені зіткнення за кожен схрон.
              </p>

              {/* Симетрична плашка характеристик сервера */}
              <div className="mt-7 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-black/45 border border-white/10 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#b6c980]">
                    <Swords size={14} />
                    <span>Режим</span>
                  </div>
                  <p className="mt-1 text-sm sm:text-[15px] font-bold text-white truncate">Survival · PvP</p>
                </div>

                <div className="rounded-2xl bg-black/45 border border-white/10 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#b6c980]">
                    <Compass size={14} />
                    <span>Механіки</span>
                  </div>
                  <p className="mt-1 text-sm sm:text-[15px] font-bold text-white truncate">Власні моди</p>
                </div>

                <div className="rounded-2xl bg-black/45 border border-white/10 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#b6c980]">
                    <Shield size={14} />
                    <span>Захист</span>
                  </div>
                  <p className="mt-1 text-sm sm:text-[15px] font-bold text-white truncate">Модерація 24/7</p>
                </div>
              </div>
            </div>

            {/* Нижні кнопки дій — симетричні та вирівняні з карткою новин */}
            <div className="animate-enter delay-3 mt-7 pt-5 border-t border-white/10 grid gap-3.5 sm:grid-cols-2">
              <ConnectModal />
              <a
                href="/launcher-updates/OutLand-Launcher-Beta-Setup-1.2.0-beta.14-x64.exe"
                download
                className="btn btn-outline rounded-xl !min-h-14 h-14 !px-6 !text-sm w-full"
              >
                <Download size={18} />
                Скачати лаунчер
              </a>
            </div>
          </div>

          {/* Права картка новин — однакової висоти з лівою */}
          <HeroSidebar />
        </div>
      </section>

      {/* =====================================================
          СИМЕТРИЧНІ КАРТКИ ПЕРЕВАГ (3 КОЛОНКИ)
      ===================================================== */}
      <section className="shell mt-6 grid gap-6 md:grid-cols-3">
        <article className="hero-content-card rounded-3xl bg-black/50 backdrop-blur-md border border-white/10 p-6 sm:p-7 shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-[#b6c980]/40">
          <div className="flex items-center justify-between">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/35 shadow-md">
              <Flame size={22} />
            </div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#b6c980]">01 · Атмосфера</span>
          </div>
          <h3 className="mt-5 text-xl font-bold text-[#f2f5e9]">Власне будівництво та лут</h3>
          <p className="mt-2.5 text-sm sm:text-[15px] leading-relaxed text-stone-200">
            Унікальні механіки зведення баз, продуманий баланс спорядження та авторські модифікації спеціально для нашого сервера.
          </p>
        </article>

        <article className="hero-content-card rounded-3xl bg-black/50 backdrop-blur-md border border-white/10 p-6 sm:p-7 shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-[#b6c980]/40">
          <div className="flex items-center justify-between">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/35 shadow-md">
              <Shield size={22} />
            </div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#b6c980]">02 · Безпека</span>
          </div>
          <h3 className="mt-5 text-xl font-bold text-[#f2f5e9]">Чесна гра та стабільність</h3>
          <p className="mt-2.5 text-sm sm:text-[15px] leading-relaxed text-stone-200">
            Високий FPS, мінімальний пінг, надійний захист від нечесної гри та чуйна адміністрація, яка завжди на зв’язку.
          </p>
        </article>

        <article className="hero-content-card rounded-3xl bg-black/50 backdrop-blur-md border border-white/10 p-6 sm:p-7 shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-[#b6c980]/40">
          <div className="flex items-center justify-between">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/35 shadow-md">
              <Users size={22} />
            </div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#b6c980]">03 · Ком’юніті</span>
          </div>
          <h3 className="mt-5 text-xl font-bold text-[#f2f5e9]">Жива українська спільнота</h3>
          <p className="mt-2.5 text-sm sm:text-[15px] leading-relaxed text-stone-200">
            Щоденні рейди, торгівля між кланами, регулярні івенти у Зоні та активне спілкування в нашому Discord.
          </p>
        </article>
      </section>

      {/* =====================================================
          СИМЕТРИЧНИЙ БЛОК СПІЛЬНОТИ ТА МАГАЗИНУ
      ===================================================== */}
      <section className="shell mt-6">
        <div className="hero-content-card rounded-3xl bg-black/50 backdrop-blur-md border border-white/10 p-7 sm:p-9 shadow-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
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
      </section>
    </main>
  );
}
