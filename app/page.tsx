import Link from "next/link";
import { Shield, Users } from "lucide-react";

import { ConnectModal } from "@/components/connect-modal";
import { HeroSidebar } from "@/components/hero-sidebar";
import { siteConfig } from "@/lib/config";

export default function Home() {
  return (
    <main>
      <section className="relative isolate min-h-[700px] overflow-hidden border-b border-white/10 sm:min-h-[760px]">
        {/* Фон */}
        <div className="absolute inset-0 -z-20">
          <img
            src="/images/hero-bg.jpg"
            alt="Outland DayZ Background"
            className="h-full w-full scale-105 object-cover"
          />
        </div>

        {/* Легке загальне затемнення */}
        <div className="absolute inset-0 -z-10 bg-black/20" />

        {/* Vignette */}
        <div className="hero-vignette absolute inset-0 -z-10" />

        {/* Grid */}
        <div className="grid-lines absolute inset-0 -z-10 opacity-60" />

        {/* Основний контент */}
        <div className="shell relative z-10 flex min-h-[700px] flex-col justify-center py-12 sm:min-h-[760px] sm:py-24">
          
          {/* Ліва частина без плашки статусу сервера внизу */}
          <div className="max-w-2xl xl:max-w-[650px] rounded-2xl bg-black/50 p-6 sm:p-8 backdrop-blur-md border border-white/10 shadow-2xl -ml-16 sm:-ml-32 lg:-ml-44 xl:-ml-52">
            <p className="eyebrow animate-enter">
              Зона виживання · Україна
            </p>

            <h1 className="heading animate-enter delay-1 mt-4 text-6xl text-[#f2f5e9] drop-shadow-2xl sm:text-8xl lg:text-9xl">
              {siteConfig.name}
            </h1>

            <p className="animate-enter delay-2 mt-6 text-lg font-semibold text-[#dfe7cf] sm:text-2xl">
              Український сервер DayZ
            </p>

            <p className="animate-enter delay-2 mt-3 max-w-lg leading-relaxed text-stone-200">
              Виживай. Шукай. Борись. Твоя історія починається там,
              де закінчується цивілізація.
            </p>

            <div className="animate-enter delay-3 mt-8 flex flex-wrap items-center gap-4">
              <ConnectModal />
            </div>
          </div>
        </div>

        {/* НОВИНИ СПРАВА */}
        <HeroSidebar />
      </section>

      {/* =====================================================
          СПІЛЬНОТА
      ===================================================== */}
      <section className="relative overflow-hidden border-y border-white/10 bg-black/40 backdrop-blur-md">
        <div className="shell grid gap-10 py-16 sm:py-20 md:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow">
              Наша спільнота
            </p>

            <h2 className="heading mt-3 text-4xl">
              Не виживай наодинці
            </h2>

            <p className="mt-5 max-w-2xl leading-relaxed text-stone-300">
              Приєднуйся до української DayZ спільноти.
              Збирай загін, ділись історіями та будь в курсі подій.
            </p>
          </div>

          <a
            className="btn rounded-xl self-center"
            href={siteConfig.discord}
            target="_blank"
            rel="noopener noreferrer"
          >
            Приєднатися до Discord
            <Users size={16} />
          </a>
        </div>
      </section>

      {/* =====================================================
          ПЕРЕВАГИ
      ===================================================== */}
      <section className="shell grid gap-5 py-20 sm:py-24 md:grid-cols-2">
        <div className="rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 p-7 transition duration-300 hover:-translate-y-2 hover:border-[#84955a]">
          <Shield className="text-[#b6c980]" />

          <h3 className="mt-5 font-bold">
            Чесна гра
          </h3>

          <p className="mt-3 text-sm text-stone-400">
            Активна модерація та захист від нечесної гри.
          </p>
        </div>

        <div className="rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 p-7 transition duration-300 hover:-translate-y-2 hover:border-[#84955a]">
          <Users className="text-[#b6c980]" />

          <h3 className="mt-5 font-bold">
            Жива спільнота
          </h3>

          <p className="mt-3 text-sm text-stone-400">
            Події, рейди, торгівля й нові знайомства щодня.
          </p>
        </div>
      </section>
    </main>
  );
}