import Link from "next/link";
import { ArrowRight, BellRing, Construction, Crown, PackageOpen, Sparkles } from "lucide-react";
import { siteConfig } from "@/lib/config";

type ComingSoonProps = {
  eyebrow: string;
  title: string;
  description: string;
  kind: "vip" | "cases";
};

export function ComingSoon({ eyebrow, title, description, kind }: ComingSoonProps) {
  const Icon = kind === "vip" ? Crown : PackageOpen;
  const features = kind === "vip" ? ["Пакети привілеїв", "Оплата з балансу", "Автоматична активація"] : ["Рідкісні нагороди", "Анімоване відкриття", "Історія випадінь"];
  return <main className="coming-soon-page relative isolate flex min-h-[calc(100vh-64px)] items-center overflow-hidden py-14 sm:py-20">
    <div className="absolute inset-0 -z-30"><img src="/images/hero-bg.jpg" alt="" className="h-full w-full object-cover opacity-35" /></div>
    <div className="absolute inset-0 -z-20 bg-[#070907]/80" />
    <div className="grid-lines absolute inset-0 -z-10 opacity-60" />
    <div className="coming-soon-glow absolute -z-10" />
    <div className="shell w-full">
      <section className="coming-soon-card max-w-2xl p-6 sm:p-9 lg:p-11">
        <div className="flex items-center gap-3"><span className="coming-soon-icon"><Icon size={23} /></span><div><div className="flex items-center gap-2"><Sparkles size={13} className="text-[#b8d479]" /><p className="eyebrow">{eyebrow}</p></div><p className="mt-1 text-xs text-stone-400">Outland DayZ · оновлення системи</p></div></div>
        <h1 className="heading mt-7 text-5xl text-[#f4f7ed] sm:text-7xl">{title}</h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-200 sm:text-lg">{description}</p>
        <div className="coming-soon-status mt-8 flex items-start gap-3"><Construction className="mt-0.5 shrink-0 text-[#c8df84]" size={20} /><div><p className="font-bold text-[#ebf3d9]">Розділ у розробці</p><p className="mt-1 text-sm leading-relaxed text-stone-400">Ми готуємо його до запуску. Слідкуйте за новинами сервера.</p></div></div>
        <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3">{features.map((feature, index) => <div key={feature} className="coming-soon-feature"><span>0{index + 1}</span>{feature}</div>)}</div>
        <div className="mt-9 flex flex-wrap gap-3"><Link href="/" className="btn"><ArrowRight size={16} />На головну</Link><a href={siteConfig.discord} target="_blank" rel="noopener noreferrer" className="btn btn-outline"><BellRing size={16} />Стежити в Discord</a></div>
      </section>
    </div>
  </main>;
}
