import { Check, Download, Gamepad2, MonitorDown, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";

const launcher = {
  version: "1.2.0-beta.15",
  download: "/launcher-updates/OutLand-Launcher-Beta-Setup-1.2.0-beta.15-x64.exe",
};

const features = [
  {
    icon: RefreshCw,
    title: "Автооновлення",
    description: "Лаунчер сам завантажує нові версії під час запуску — не потрібно перевстановлювати його вручну.",
  },
  {
    icon: Gamepad2,
    title: "Швидкий старт DayZ",
    description: "Відкривай сервер Outland DayZ у Steam та підключайся в кілька кліків.",
  },
  {
    icon: ShieldCheck,
    title: "Єдина екосистема",
    description: "Новини, стан сервера й запуск гри в одному зручному місці.",
  },
];

export default function LauncherUpdatesPage() {
  return (
    <main className="launcher-page relative isolate overflow-hidden py-12 sm:py-16 lg:py-20">
      <div className="absolute inset-0 -z-30">
        <img src="/images/hero-bg.jpg" alt="" className="h-full w-full object-cover opacity-35" />
      </div>
      <div className="absolute inset-0 -z-20 bg-black/20" />
      <div className="hero-vignette absolute inset-0 -z-20" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-60" />
      <div className="launcher-glow absolute -z-10" />

      <div className="shell">
        <section className="launcher-hero hero-content-card mx-auto max-w-5xl overflow-hidden rounded-2xl p-6 sm:p-9 lg:p-12">
          <div className="launcher-scan-line" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-[#d6ec92]" />
                <p className="eyebrow">Офіційний застосунок сервера</p>
              </div>
              <h1 className="heading mt-5 text-5xl text-[#f5f7ee] sm:text-7xl">Outland<br />Launcher</h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-200 sm:text-lg">
                Завантажуй, запускай DayZ і завжди грай з актуальною версією лаунчера.
                Оновлення встановлюються автоматично.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a className="btn !min-h-12 !px-6" href={launcher.download} download>
                  <Download size={18} />Завантажити для Windows
                </a>
                <span className="launcher-version"><Check size={16} />Версія {launcher.version}</span>
              </div>
              <p className="mt-4 text-[13px] sm:text-sm text-stone-300">Windows 10 / 11 · x64 · після встановлення подальші оновлення будуть автоматичними.</p>
            </div>

            <div className="launcher-device rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3"><span className="launcher-device-icon"><MonitorDown size={22} /></span><div><p className="text-base font-bold text-[#eef5dd]">Outland Launcher</p><p className="text-[13px] text-stone-300">Готовий до запуску</p></div></div>
                <span className="launcher-online"><i />ONLINE</span>
              </div>
              <div className="mt-5 space-y-3 text-sm sm:text-[15px]">
                <div className="launcher-device-row"><span>Оновлення</span><b><RefreshCw size={15} /> Автоматичні</b></div>
                <div className="launcher-device-row"><span>Сервер</span><b>149.50.101.26:2312</b></div>
                <div className="launcher-device-row"><span>Статус</span><b className="text-[#cce784]">Готово до гри</b></div>
              </div>
              <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-black/50"><div className="launcher-progress h-full rounded-full" /></div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, index) => (
            <article className="launcher-feature rounded-2xl border border-white/10 bg-black/45 p-6 backdrop-blur-md" key={title}>
              <div className="flex items-center justify-between"><span className="launcher-feature-icon"><Icon size={21} /></span><span className="eyebrow">0{index + 1}</span></div>
              <h2 className="mt-5 text-xl font-bold text-[#f0f3e8]">{title}</h2>
              <p className="mt-2.5 text-sm sm:text-[15px] leading-relaxed text-stone-200">{description}</p>
            </article>
          ))}
        </section>

        <section className="launcher-steps mx-auto mt-8 max-w-5xl p-6 sm:p-7">
          <p className="eyebrow">Початок гри</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              "Завантажте інсталятор для Windows.",
              "Встановіть та відкрийте Outland Launcher.",
              "Увійдіть у Steam і натисніть «Грати»."
            ].map((text, index) => <div className="flex items-start gap-3.5" key={text}><span className="launcher-step-number">{index + 1}</span><p className="text-sm sm:text-[15px] leading-relaxed text-stone-200">{text}</p></div>)}
          </div>
        </section>
      </div>
    </main>
  );
}
