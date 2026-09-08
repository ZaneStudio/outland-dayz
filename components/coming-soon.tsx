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
  return <main className="coming-soon-page relative isolate grid min-h-[calc(100vh-64px)] place-items-center overflow-hidden py-14">
    <div className="absolute inset-0 -z-30"><img src="/images/hero-bg.jpg" alt="" className="h-full w-full object-cover opacity-35" /></div>
    <div className="absolute inset-0 -z-20 bg-[#070907]/80" />
    <div className="grid-lines absolute inset-0 -z-10 opacity-60" />
    <div className="coming-soon-glow absolute -z-10" />
    <div className="shell w-full max-w-5xl">
      <section className="coming-soon-card cut mx-auto max-w-3xl p-6 text-center sm:p-10 lg:p-14">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#c1db80]/45 bg-[#1b2611] text-[#d7ed99] shadow-[0_0_45px_rgba(166,200,93,.24)]"><Icon size={30} /></div>
        <div className="mt-7 flex items-center justify-center gap-2"><Sparkles size={14} className="text-[#b8d479]" /><p className="eyebrow">{eyebrow}</p><Sparkles size={14} className="text-[#b8d479]" /></div>
        <h1 className="heading mt-4 text-5xl text-[#f4f7ed] sm:text-7xl">{title}</h1>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-stone-300">{description}</p>
        <div className="mx-auto mt-8 flex max-w-md items-center gap-4 rounded-xl border border-white/10 bg-black/30 p-4 text-left"><Construction className="shrink-0 text-[#c8df84]" size={24} /><div><p className="font-bold text-[#ebf3d9]">Розділ у розробці</p><p className="mt-1 text-sm text-stone-400">Ми готуємо його до запуску. Слідкуйте за новинами сервера.</p></div></div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">{features.map((feature, index) => <div key={feature} className="coming-soon-feature"><span>0{index + 1}</span>{feature}</div>)}</div>
        <div className="mt-9 flex flex-wrap justify-center gap-3"><Link href="/" className="btn"><ArrowRight size={16} />На головну</Link><a href={siteConfig.discord} target="_blank" rel="noopener noreferrer" className="btn btn-outline"><BellRing size={16} />Стежити в Discord</a></div>
      </section>
    </div>
  </main>;
}
