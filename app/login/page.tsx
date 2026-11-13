import { ArrowLeft, Gamepad2, ShieldCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="relative isolate min-h-[calc(100vh-64px)] overflow-hidden border-b border-white/10 flex items-center justify-center py-14 sm:py-20">
      {/* Фон як на головній та в кошику */}
      <div className="absolute inset-0 -z-20 pointer-events-none">
        <img
          src="/images/hero-bg.jpg"
          alt="Outland DayZ Background"
          className="h-full w-full scale-105 object-cover"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-black/25 pointer-events-none" />
      <div className="hero-vignette absolute inset-0 -z-10 pointer-events-none" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-60 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[320px] bg-[#b6c980]/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="shell relative z-10 w-full flex justify-center">
        <section className="hero-content-card w-full max-w-md rounded-3xl bg-black/50 p-8 sm:p-10 backdrop-blur-md border border-white/15 shadow-2xl text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/40 shadow-xl shadow-[#b6c980]/10 mb-5 animate-enter">
            <Gamepad2 size={30} />
          </div>

          <div className="flex items-center justify-center gap-2 animate-enter">
            <span className="inline-block h-2 w-2 rounded-full bg-[#b6c980] animate-pulse" />
            <p className="eyebrow text-[#b6c980] tracking-widest">Ідентифікація · Steam OpenID</p>
          </div>

          <h1 className="heading mt-3 text-4xl sm:text-5xl text-[#f2f5e9] animate-enter delay-1">
            Вхід через Steam
          </h1>

          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-stone-300 animate-enter delay-2">
            Використовуйте свій Steam-акаунт для доступу до особистого профілю, балансу та історії покупок. Пароль не
            передається й не зберігається на сайті Outland DayZ.
          </p>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/35 bg-red-500/10 p-3.5 text-xs text-red-200 flex items-center justify-center gap-2.5 animate-enter">
              <AlertTriangle size={16} className="shrink-0 text-red-300" />
              <span>Не вдалося підтвердити Steam-акаунт. Спробуйте ще раз.</span>
            </div>
          )}

          <div className="mt-7 space-y-3 animate-enter delay-3">
            <a
              href="/api/auth/steam"
              className="btn w-full !min-h-12 rounded-xl text-xs uppercase tracking-widest shadow-lg"
            >
              <Gamepad2 size={18} /> Увійти через Steam
            </a>

            <Link
              href="/"
              className="btn btn-outline w-full !min-h-11 rounded-xl text-xs uppercase tracking-wider border-white/15 hover:border-[#b6c980]"
            >
              <ArrowLeft size={15} /> Повернутися на головну
            </Link>
          </div>

          <div className="mt-6 rounded-2xl bg-black/40 border border-white/10 p-3.5 flex items-center gap-3 text-left text-[11px] leading-relaxed text-stone-400 animate-enter delay-3">
            <ShieldCheck className="shrink-0 text-[#b6c980]" size={18} />
            <p>Офіційна авторизація через протокол Steam OpenID 2.0 без доступу до вашого пароля.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
