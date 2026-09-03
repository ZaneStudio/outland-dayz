"use client";

import { Check, Clipboard, Gamepad2, Info, MessageCircle, Monitor, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { siteConfig } from "@/lib/config";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  return <button onClick={copy} className="group flex w-full items-center justify-between rounded border border-white/10 bg-black/20 px-4 py-3 text-left transition hover:border-[#9aaf63] hover:bg-[#1a2114]"><span><span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">{label}</span><span className="mt-1 block font-mono text-sm text-stone-100">{value}</span></span>{copied ? <Check className="text-[#bfe47c]" size={17} /> : <Clipboard className="text-stone-400 group-hover:text-[#c2da82]" size={17} />}</button>;
}

export function ConnectModal() {
  const [open, setOpen] = useState(false), [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, []);
  const modal = open && mounted ? createPortal(<div role="dialog" aria-modal="true" aria-labelledby="connect-title" className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}><section className="cut animate-enter relative w-full max-w-3xl border border-[#74854c]/50 bg-[#10140e] p-5 shadow-2xl sm:p-7"><button onClick={() => setOpen(false)} aria-label="Закрити" className="absolute right-4 top-4 rounded p-2 text-stone-400 transition hover:rotate-90 hover:bg-white/5 hover:text-white"><X size={23} /></button><p className="eyebrow">OutLand DayZ · підключення</p><h2 id="connect-title" className="heading mt-2 pr-10 text-3xl sm:text-4xl">Як підключитися до сервера</h2><p className="mt-2 text-sm text-stone-400">Виконайте прості кроки та розпочинайте виживання.</p><div className="mt-6 grid gap-5"><article className="rounded border border-[#687d42]/50 bg-black/15 p-5"><div className="flex items-center gap-3"><Monitor className="text-[#bdd47d]" size={22} /><h3 className="font-bold uppercase">Через DayZ Launcher</h3></div><ol className="mt-5 grid gap-3 text-sm text-stone-300 sm:grid-cols-2"><li className="flex gap-3"><b className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#30411f] text-xs text-[#cbe58a]">1</b>Відкрийте офіційний лаунчер DayZ.</li><li className="flex gap-3"><b className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#30411f] text-xs text-[#cbe58a]">2</b>Перейдіть у вкладку «Сервери».</li><li className="flex gap-3"><b className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#30411f] text-xs text-[#cbe58a]">3</b>Натисніть «Пряме підключення».</li><li className="flex gap-3"><b className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#30411f] text-xs text-[#cbe58a]">4</b>Введіть адресу та порт нижче.</li></ol><div className="mt-5 grid gap-3 sm:grid-cols-2"><CopyButton label="IP адреса" value={siteConfig.ip} /><CopyButton label="Порт" value={siteConfig.port} /></div></article><div className="rounded border border-[#8b6e22]/60 bg-[#382b0b]/20 p-4"><p className="flex items-center gap-2 text-sm font-bold text-[#e6c767]"><Info size={17} /> Важливо</p><p className="mt-2 text-sm text-[#d4bf76]">Перевірте, що встановлені всі необхідні моди. Список модів є в Discord.</p></div><div className="flex flex-wrap items-center justify-between gap-4 rounded border border-white/10 bg-black/15 p-4"><div><p className="font-bold uppercase">Виникли проблеми?</p><p className="mt-1 text-sm text-stone-400">Зверніться до нас у Discord — допоможемо підключитися.</p></div><a href={siteConfig.discord} target="_blank" rel="noreferrer" className="btn"><MessageCircle size={16} /> Перейти в Discord</a></div></div></section></div>, document.body) : null;
  
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn rounded-xl !min-h-14 !px-7 !text-sm sm:!px-9">
        Грати зараз <Gamepad2 size={18} />
      </button>
      {modal}
    </>
  );
}