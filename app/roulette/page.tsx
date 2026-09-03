"use client";

import { useState } from "react";
import { Dices, Sparkles, History, ShieldAlert, Award } from "lucide-react";

export default function RoulettePage() {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    const randomDegree = rotation + 1800 + Math.floor(Math.random() * 360);
    setRotation(randomDegree);
    setTimeout(() => {
      setSpinning(false);
    }, 4000);
  };

  return (
    <main className="relative isolate min-h-[700px] overflow-hidden border-b border-white/10 sm:min-h-[760px] pb-24">
      {/* Атмосферний фон */}
      <div className="absolute inset-0 -z-20">
        <img src="/images/hero-bg.jpg" alt="Outland DayZ Background" className="h-full w-full scale-105 object-cover" />
      </div>
      <div className="absolute inset-0 -z-10 bg-black/20" />
      <div className="hero-vignette absolute inset-0 -z-10" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-60" />

      <div className="shell relative z-10 pt-12 sm:pt-16 max-w-6xl">
        
        {/* Верхній заголовок */}
        <div className="animate-enter mb-8">
          <p className="eyebrow">Нагороди за виживання</p>
          <h1 className="heading mt-3 text-4xl sm:text-6xl text-[#f2f5e9]">Рулетка</h1>
        </div>

        {/* Основний блок рулетки (дві преміальні плашки) */}
        <div className="grid gap-6 lg:grid-cols-2 animate-enter delay-1">
          
          {/* Ліва картка: Інформація та статус */}
          <div className="rounded-2xl bg-black/50 p-6 sm:p-8 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#b6c980]">
                Ігрові бонуси
              </span>
              <h2 className="heading mt-2 text-3xl text-white">Грай на сервері та отримуй нагороди!</h2>
              <p className="mt-3 text-sm text-stone-300 leading-relaxed">
                Проведи 5 годин на сервері, щоб отримати безкоштовний оберт рулетки з цінними призами та спорядженням.
              </p>
            </div>

            <div className="mt-8 rounded-2xl bg-black/40 p-5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black/60 text-[#b6c980] border border-white/10">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Увійдіть через Steam</h4>
                  <p className="text-xs text-stone-400 mt-0.5">Щоб враховувати ваш час у грі та збирати нагороди.</p>
                </div>
              </div>
              <div className="mt-5">
                <button 
                  onClick={() => alert("Авторизація через Steam...")}
                  className="btn w-full rounded-xl text-xs uppercase tracking-widest py-3 cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  Увійти через Steam
                </button>
              </div>
            </div>
          </div>

          {/* Права картка: Саме Колесо Фортуни */}
          <div className="rounded-2xl bg-black/50 p-6 sm:p-8 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Верхній індикатор (стрілочка) */}
            <div className="absolute top-4 z-20 flex flex-col items-center">
              <div className="w-0 h-0 border-x-8 border-x-transparent border-t-[14px] border-t-[#b6c980] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
            </div>

            {/* Контейнер колеса */}
            <div className="relative my-6 flex items-center justify-center">
              <div 
                style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 4s cubic-bezier(0.15, 0.85, 0.15, 1)" : "none" }}
                className="h-72 w-72 sm:h-80 sm:w-80 rounded-full border-4 border-white/15 bg-gradient-to-br from-stone-900 to-black shadow-[0_0_40px_rgba(0,0,0,0.8)] relative grid place-items-center overflow-hidden cursor-pointer"
                onClick={spinWheel}
              >
                {/* Сектори колеса (візуальне оформлення) */}
                <div className="absolute inset-0 rounded-full border border-white/10 flex items-center justify-center">
                  <div className="absolute inset-2 rounded-full border border-dashed border-white/20" />
                  
                  {/* Центральний логотип */}
                  <div className="z-10 grid h-20 w-20 place-items-center rounded-full bg-black/80 border border-white/20 text-center shadow-xl p-2">
                    <span className="font-extrabold text-[10px] uppercase tracking-tighter text-[#f2f5e9] leading-none">
                      Outland<br/>DayZ
                    </span>
                  </div>
                </div>

                {/* Елементи секторів (текст/іконки навколо) */}
                <div className="absolute inset-4 text-[11px] font-bold text-stone-300 flex justify-between items-center rotate-0">
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[#b6c980]">VIP 7 ДНІВ</span>
                  <span className="absolute right-3 top-1/4">50 МОНЕТ</span>
                  <span className="absolute right-3 bottom-1/4">МОД ЯЩИК</span>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2">100 000</span>
                  <span className="absolute left-3 bottom-1/4">СКІН</span>
                  <span className="absolute left-3 top-1/4">ОБЕРТ+</span>
                </div>
              </div>
            </div>

            {/* Кнопка запуску оберту */}
            <button
              onClick={spinWheel}
              disabled={spinning}
              className="btn rounded-xl px-8 text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={16} /> {spinning ? "Обертається...": "Крутити рулетку"}
            </button>
          </div>

        </div>

        {/* Нижня секція: Як це працює + Історія виграшів */}
        <div className="grid gap-6 lg:grid-cols-3 mt-8 animate-enter delay-2">
          
          <div className="rounded-2xl bg-black/50 p-6 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="text-[#b6c980] mb-3"><Dices size={22} /></div>
            <h4 className="font-bold text-white text-sm">1. Грай на сервері</h4>
            <p className="mt-2 text-xs text-stone-400 leading-relaxed">Проводь час на сервері — він автоматично зараховується до твого прогресу.</p>
          </div>

          <div className="rounded-2xl bg-black/50 p-6 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="text-[#b6c980] mb-3"><Award size={22} /></div>
            <h4 className="font-bold text-white text-sm">2. Отримуй оберти</h4>
            <p className="mt-2 text-xs text-stone-400 leading-relaxed">Кожні 5 годин відкривай один безкоштовний оберт рулетки.</p>
          </div>

          <div className="rounded-2xl bg-black/50 p-6 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="text-[#b6c980] mb-3"><History size={22} /></div>
            <h4 className="font-bold text-white text-sm">3. Вигравай призи</h4>
            <p className="mt-2 text-xs text-stone-400 leading-relaxed">Випробуй удачу та забери цінну нагороду прямо у свій інвентар.</p>
          </div>

        </div>

      </div>
    </main>
  );
}