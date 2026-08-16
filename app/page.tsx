import Link from "next/link";
import { Shield, Users } from "lucide-react";
import { ConnectModal } from "@/components/connect-modal";
import { NewsPreview } from "@/components/news-preview";
import { ServerStatus } from "@/components/server-status";
import { siteConfig } from "@/lib/config";

export default function Home() {
  return <main>
    <section className="relative isolate min-h-[700px] overflow-hidden border-b border-white/10 sm:min-h-[760px]">
      <div className="hero-image absolute inset-0 scale-105 animate-[enter_1.2s_ease-out_both]" /><div className="hero-vignette absolute inset-0" /><div className="grid-lines absolute inset-0 opacity-60" />
      <div className="shell relative z-10 flex min-h-[700px] flex-col justify-end py-12 sm:min-h-[760px] sm:justify-center sm:py-24"><div className="max-w-2xl"><p className="eyebrow animate-enter">Зона виживання · Україна</p><h1 className="heading animate-enter delay-1 mt-4 text-6xl text-[#f2f5e9] drop-shadow-2xl sm:text-8xl lg:text-9xl">{siteConfig.name}</h1><p className="animate-enter delay-2 mt-6 text-lg font-semibold text-[#dfe7cf] sm:text-2xl">Український сервер DayZ</p><p className="animate-enter delay-2 mt-3 max-w-lg leading-relaxed text-stone-200">Виживай. Шукай. Борись. Твоя історія починається там, де закінчується цивілізація.</p><div className="animate-enter delay-3 mt-8"><ConnectModal /></div></div><div className="animate-enter delay-3 mt-10 w-full max-w-3xl sm:mt-14"><ServerStatus /></div></div>
    </section>
    <section className="shell py-20 sm:py-24"><div className="flex items-end justify-between gap-6"><div><p className="eyebrow">Останнє з зони</p><h2 className="heading mt-2 text-4xl">Новини сервера</h2></div><Link href="/news" className="text-sm text-[#b7c77d]">Усі новини →</Link></div><NewsPreview /></section>
    <section className="border-y border-white/10 bg-[#11150e]"><div className="shell grid gap-10 py-20 sm:py-24 md:grid-cols-[1fr_auto]"><div><p className="eyebrow">Наша спільнота</p><h2 className="heading mt-3 text-4xl">Не виживай наодинці</h2><p className="mt-5 max-w-2xl leading-relaxed text-stone-400">Приєднуйся до української DayZ спільноти. Збирай загін, ділись історіями та будь в курсі подій.</p></div><a className="btn self-center" href={siteConfig.discord}>Приєднатися до Discord <Users size={16} /></a></div></section>
    <section className="shell grid gap-5 py-20 sm:py-24 md:grid-cols-2"><div className="panel p-7 transition duration-300 hover:-translate-y-2 hover:border-[#84955a]"><Shield className="text-[#b6c980]" /><h3 className="mt-5 font-bold">Чесна гра</h3><p className="mt-3 text-sm text-stone-400">Активна модерація та захист від нечесної гри.</p></div><div className="panel p-7 transition duration-300 hover:-translate-y-2 hover:border-[#84955a]"><Users className="text-[#b6c980]" /><h3 className="mt-5 font-bold">Жива спільнота</h3><p className="mt-3 text-sm text-stone-400">Події, рейди, торгівля й нові знайомства щодня.</p></div></section>
  </main>;
}
