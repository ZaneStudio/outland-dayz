"use client";

import { Check, Clipboard, Gamepad2, Info, MessageCircle, Monitor, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { siteConfig } from "@/lib/config";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  
  return (
    <button onClick={copy} className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/50 px-4 py-3.5 text-left transition hover:border-[#84955a] hover:bg-black/70 shadow-inner">
      <span>
        <span className="block text-[10px] font-bold uppercase tracking-widest text-[#9fb372]">{label}</span>
        <span className="mt-1 block font-mono text-sm text-stone-100 font-bold">{value}</span>
      </span>
      {copied ? <Check className="text-[#bfe47c]" size={17} /> : <Clipboard className="text-stone-400 group-hover:text-[#c2da82]" size={17} />}
    </button>
  );
}

export function ConnectModal() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    }; 
    window.addEventListener("keydown", onKey); 
    return () => window.removeEventListener("keydown", onKey); 
  }, []);

  const openModal = () => {
    setOpen(true);
    requestAnimationFrame(() => setVisible(true));
  };

  const closeModal = () => {
    setVisible(false);
    setTimeout(() => {
      setOpen(false);
    }, 300); // Час збігається з transition (300мс)
  };

  const modal = open && mounted ? createPortal(
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="connect-title" 
      className={`fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-md transition-all duration-300 ease-out ${
        visible ? "opacity-100 backdrop-blur-md" : "opacity-0 backdrop-blur-none"
      }`}
      onMouseDown={e => { if (e.target === e.currentTarget) closeModal(); }}
    >
      <section className={`relative w-full max-w-xl rounded-[28px] border border-white/15 bg-[#0a0f08]/95 backdrop-blur-2xl p-7 sm:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.9)] transition-all duration-300 ease-out ${
        visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
      }`}>
        
        {/* Анімована кнопка закриття */}
        <button 
          onClick={closeModal} 
          aria-label="Закрити" 
          className="absolute right-6 top-6 grid h-9 w-9 place-items-center rounded-2xl bg-black/40 text-stone-400 transition-all duration-200 hover:bg-white/15 hover:text-white hover:rotate-90 hover:scale-105 border border-white/5 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="inline-flex items-center rounded-full bg-[#152011] px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#a8bc76] border border-[#26381e]/60 shadow-sm">
          OutLand DayZ
        </div>

        <h2 id="connect-title" className="heading mt-3 text-3xl sm:text-4xl text-[#f2f5e9] tracking-wide">
          Як підключитися до сервера
        </h2>

        <div className="my-5 h-[1px] w-full bg-white/10" />

        <div className="grid gap-5">
          
          <article className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-[#b2c87e]">
              <Monitor size={18} />
              <h3 className="font-bold uppercase text-xs tracking-wider">Через DayZ Launcher</h3>
            </div>
            
            <ol className="mt-4 grid gap-3 text-xs sm:text-sm text-stone-300">
              <li className="flex items-start gap-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#152011] text-[#b2c87e] font-bold text-xs border border-white/10">1</span>
                <span>Відкрийте офіційний лаунчер DayZ.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#152011] text-[#b2c87e] font-bold text-xs border border-white/10">2</span>
                <span>Перейдіть у вкладку <strong className="text-white">«Сервери»</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#152011] text-[#b2c87e] font-bold text-xs border border-white/10">3</span>
                <span>Натисніть <strong className="text-white">«Пряме підключення»</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#152011] text-[#b2c87e] font-bold text-xs border border-white/10">4</span>
                <span>Введіть адресу та порт нижче.</span>
              </li>
            </ol>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <CopyButton label="IP адреса" value={siteConfig.ip} />
              <CopyButton label="Порт" value={siteConfig.port} />
            </div>
          </article>

          <div className="rounded-2xl border border-[#879d5b]/40 bg-black/40 p-4 backdrop-blur-md">
            <p className="flex items-center gap-2 text-xs font-bold text-[#b2c87e] uppercase tracking-wider">
              <Info size={16} /> Важливо
            </p>
            <p className="mt-1.5 text-xs text-stone-300 leading-relaxed">
              Перевірте, що встановлені всі необхідні моди. Список модів є в Discord.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
            <div>
              <p className="font-bold text-xs uppercase tracking-wider text-white">Виникли проблеми?</p>
              <p className="mt-0.5 text-xs text-stone-400">Зверніться до нас у Discord — допоможемо підключитися.</p>
            </div>
            <a 
              href={siteConfig.discord} 
              target="_blank" 
              rel="noreferrer" 
              className="btn !min-h-10 rounded-xl text-xs uppercase tracking-wider px-4 inline-flex items-center gap-2"
            >
              <MessageCircle size={15} /> Перейти в Discord
            </a>
          </div>

        </div>
      </section>
    </div>, 
    document.body
  ) : null;
  
  return (
    <>
      <button onClick={openModal} className="btn rounded-xl !min-h-14 !px-7 !text-sm sm:!px-9 shadow-lg cursor-pointer">
        Грати зараз <Gamepad2 size={18} />
      </button>
      {modal}
    </>
  );
}