"use client";

import { useState } from "react";
import { Package, Sparkles, CheckCircle2, ArrowRight, X, Clock, Lock } from "lucide-react";

const CRATES = [
  {
    id: "playtime-crate",
    name: "Outland Supplies",
    description: "Безкоштовний тактичний схрон за 5 годин гри на сервері.",
    price: 0,
    oldPrice: null,
    isPlaytime: true,
    image: "/images/outland-crate.png",
    color: "border-[#b6c980]/50",
    accent: "text-[#b6c980]",
    rewards: [
      { name: "Пачка патронів", rarity: "common" },
      { name: "Медикаменти", rarity: "common" },
      { name: "50 Монет", rarity: "rare" },
      { name: "Бочка", rarity: "rare" },
      { name: "VIP 1 день", rarity: "epic" },
    ],
  },
  {
    id: "survivalist",
    name: "Схрон виживця",
    description: "Тактичний контейнер для рейдів та інструментів.",
    price: 35,
    oldPrice: 50,
    isPlaytime: false,
    image: "/images/outland-crate.png",
    color: "border-white/15",
    accent: "text-white",
    rewards: [
      { name: "Бочка", rarity: "rare" },
      { name: "Кодлок", rarity: "rare" },
      { name: "М4А1 Спецназ", rarity: "epic" },
      { name: "VIP 3 дні", rarity: "epic" },
    ],
  },
  {
    id: "legendary",
    name: "Легендарний кейс",
    description: "Рідкісний схрон вищого командування з елітним спорядженням.",
    price: 99,
    oldPrice: 140,
    isPlaytime: false,
    image: "/images/outland-crate.png",
    color: "border-[#d9ca72]/50",
    accent: "text-[#d9ca72]",
    rewards: [
      { name: "VIP 7 днів", rarity: "legendary" },
      { name: "200 000 ₴", rarity: "legendary" },
      { name: "Елітний комплект", rarity: "legendary" },
    ],
  },
];

export default function LootBoxesPage() {
  const [openingCrate, setOpeningCrate] = useState<typeof CRATES[0] | null>(null);
  const [stripItems, setStripItems] = useState<Array<{ name: string; rarity: string }>>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonItem, setWonItem] = useState<{ name: string; rarity: string } | null>(null);
  const [offset, setOffset] = useState(0);

  const playtimeHours = 3.5;
  const requiredHours = 5;
  const progressPercent = Math.min((playtimeHours / requiredHours) * 100, 100);

  const startOpening = (crate: typeof CRATES[0]) => {
    if (isSpinning) return;
    
    if (crate.isPlaytime && playtimeHours < requiredHours) {
      alert(`Потрібно награти ще ${requiredHours - playtimeHours} год. на сервері для відкриття цього ящика!`);
      return;
    }

    setOpeningCrate(crate);
    setWonItem(null);
    setIsSpinning(true);

    const itemsPool: Array<{ name: string; rarity: string }> = [];
    const winningIndex = 40;

    for (let i = 0; i < 50; i++) {
      const randomReward = crate.rewards[Math.floor(Math.random() * crate.rewards.length)];
      itemsPool.push(randomReward);
    }

    const finalWinner = crate.rewards[Math.floor(Math.random() * crate.rewards.length)];
    itemsPool[winningIndex] = finalWinner;

    setStripItems(itemsPool);
    setOffset(0);

    setTimeout(() => {
      const cardWidth = 212;
      const targetOffset = (winningIndex * cardWidth) - (600 / 2) + (cardWidth / 2);
      setOffset(targetOffset);
    }, 50);

    setTimeout(() => {
      setIsSpinning(false);
      setWonItem(finalWinner);
    }, 5000);
  };

  const closeModal = () => {
    setOpeningCrate(null);
    setWonItem(null);
    setIsSpinning(false);
  };

  return (
    <main className="min-h-screen pb-24 relative isolate overflow-hidden">
      {/* Преміальний розмитий фон */}
      <div className="absolute inset-0 -z-20 pointer-events-none">
        <img src="/images/hero-bg.jpg" alt="Outland DayZ Background" className="h-full w-full scale-105 object-cover blur-[4px] brightness-90" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/40 to-black/80 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#b6c980]/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      
      <div className="hero-vignette absolute inset-0 -z-10 pointer-events-none" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-40 pointer-events-none" />

      <div className="shell mt-8 sm:mt-12 max-w-5xl space-y-6">
        
        {/* Заголовок */}
        <div className="text-center space-y-1.5 animate-enter">
          <p className="eyebrow text-[#b6c980] tracking-widest">Тактичні схрони</p>
          <h1 className="heading text-3xl sm:text-4xl text-[#f2f5e9]">Ящики з лутом</h1>
          <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto">
            Відкривай військові контейнери, здобувай унікальне спорядження та поповнюй свій інвентар.
          </p>
        </div>

        {/* Компактна сітка кейсів */}
        <div className="grid gap-6 md:grid-cols-3 animate-enter delay-1">
          {CRATES.map((crate) => (
            <div 
              key={crate.id} 
              className={`rounded-3xl bg-black/60 backdrop-blur-xl border ${crate.color} p-5 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden`}
            >
              {crate.oldPrice && (
                <div className="absolute top-3 right-3 bg-red-500 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow">
                  SALE
                </div>
              )}
              {crate.isPlaytime && (
                <div className="absolute top-3 right-3 bg-[#b6c980] text-black font-mono text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow">
                  5 ГОДИН
                </div>
              )}

              <div>
                {/* Компактне зображення кейса */}
                <div className="h-32 w-full flex items-center justify-center relative my-1">
                  <div className="absolute inset-0 bg-[#b6c980]/5 blur-xl rounded-full group-hover:bg-[#b6c980]/15 transition duration-500" />
                  <img 
                    src={crate.image} 
                    alt={crate.name} 
                    className="max-h-full max-w-full object-contain drop-shadow-xl group-hover:scale-105 transition duration-500 relative z-10" 
                  />
                </div>

                {/* Назва та опис */}
                <h3 className={`font-bold text-lg text-center text-white tracking-wide mt-2 ${crate.accent}`}>
                  {crate.name}
                </h3>
                <p className="mt-1 text-[11px] text-stone-400 text-center line-clamp-2 px-1 leading-snug">
                  {crate.description}
                </p>

                {/* Шкала або ціна */}
                {crate.isPlaytime ? (
                  <div className="mt-3 space-y-1 bg-black/50 p-2.5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-stone-400 flex items-center gap-1"><Clock size={11} className="text-[#b6c980]" /> Прогрес:</span>
                      <span className="text-[#b6c980] font-bold">{playtimeHours} / {requiredHours} год</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
                      <div className="h-full bg-[#b6c980] transition-all duration-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-center gap-2.5">
                    <div className="px-3 py-1 rounded-xl bg-[#1c2413] border border-[#b6c980]/40 font-mono text-sm font-bold text-[#b6c980] shadow">
                      {crate.price} ₴
                    </div>
                    {crate.oldPrice && (
                      <span className="font-mono text-xs font-bold text-red-400 line-through">
                        {crate.oldPrice} ₴
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Кнопка відкриття */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <button
                  onClick={() => startOpening(crate)}
                  className="btn w-full !min-h-10 rounded-xl text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {crate.isPlaytime && playtimeHours < requiredHours ? (
                    <>Необхідно 5 годин <Lock size={13} /></>
                  ) : (
                    <>Відкрити кейс <ArrowRight size={13} /></>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* МОДАЛЬНЕ ВІКНО РУЛЕТКИ CS2 */}
        {openingCrate && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 backdrop-blur-md p-4 animate-enter">
            <div className="relative w-full max-w-2xl rounded-3xl bg-black/95 border border-white/20 p-8 text-center shadow-2xl overflow-hidden">
              
              <button 
                onClick={closeModal}
                disabled={isSpinning}
                className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-stone-300 hover:text-white transition disabled:opacity-30 cursor-pointer"
              >
                <X size={18} />
              </button>

              <h3 className="eyebrow text-[#b6c980] mb-1">Розпакування схрону</h3>
              <h2 className="heading text-2xl text-white mb-6">{openingCrate.name}</h2>

              {/* ЛЕНТА РУЛЕТКИ */}
              <div className="relative w-full h-44 bg-black/60 rounded-2xl border border-white/15 overflow-hidden my-6 flex items-center shadow-inner">
                
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-[#b6c980] z-20 shadow-[0_0_15px_#b6c980]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-0 h-0 border-x-[8px] border-x-transparent border-t-[12px] border-t-[#b6c980]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 w-0 h-0 border-x-[8px] border-x-transparent border-b-[12px] border-b-[#b6c980]" />

                <div 
                  className="flex items-center gap-3 absolute left-0 px-4 transition-all duration-[5000ms] cubic-bezier(0.08, 0.82, 0.12, 1)"
                  style={{ transform: `translateX(-${offset}px)` }}
                >
                  {stripItems.map((item, idx) => {
                    const isLegendary = item.rarity === "legendary";
                    const isEpic = item.rarity === "epic";
                    const isRare = item.rarity === "rare";

                    return (
                      <div 
                        key={idx} 
                        className={`w-[200px] h-32 shrink-0 rounded-xl border flex flex-col items-center justify-between p-4 shadow-lg backdrop-blur-md ${
                          isLegendary ? "bg-[#282512]/90 border-[#d9ca72] text-[#d9ca72]" :
                          isEpic ? "bg-[#1c1224]/90 border-purple-500/60 text-purple-300" :
                          isRare ? "bg-[#121c24]/90 border-blue-500/50 text-blue-300" :
                          "bg-black/40 border-white/10 text-stone-300"
                        }`}
                      >
                        <Package size={32} className="opacity-80" />
                        <span className="text-xs font-bold text-center tracking-wider truncate w-full">
                          {item.name}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest font-mono opacity-60">
                          {item.rarity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {isSpinning ? (
                <p className="text-xs uppercase tracking-widest text-[#b6c980] font-mono animate-pulse mt-4">
                  Відкриття ящика...
                </p>
              ) : wonItem ? (
                <div className="space-y-4 animate-enter mt-4">
                  <div className="flex items-center justify-center gap-2 text-[#b6c980] font-bold text-lg">
                    <CheckCircle2 size={22} /> Вітаємо! Ви виграли: <span className="text-white underline">{wonItem.name}</span>
                  </div>
                  <button
                    onClick={closeModal}
                    className="btn w-full max-w-xs !min-h-12 rounded-xl text-xs uppercase tracking-widest shadow-lg cursor-pointer mx-auto block"
                  >
                    Забрати в інвентар
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startOpening(openingCrate)}
                  className="btn w-full max-w-xs !min-h-12 rounded-xl text-xs uppercase tracking-widest shadow-lg cursor-pointer mx-auto block"
                >
                  Крутити знову
                </button>
              )}

            </div>
          </div>
        )}

      </div>
    </main>
  );
}