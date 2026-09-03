"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart";
import { ShoppingBag, Trash2, ArrowRight, Coins, ShoppingCart, Check } from "lucide-react";

export default function Checkout() {
  const { items, clear, removeItem } = useCart() as { 
    items: Array<{ id: string; name: string; price: number; image?: string }>; 
    clear: () => void; 
    removeItem?: (id: string) => void;
  };
  
  const [order, setOrder] = useState<string>();
  const total = items.reduce((s, p) => s + p.price, 0);

  // Функція генерації унікального коду для мода DayZ
  const generateDayZCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let part1 = "";
    let part2 = "";
    for (let i = 0; i < 4; i++) {
      part1 += chars.charAt(Math.floor(Math.random() * chars.length));
      part2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `OUT-${part1}-${part2}`;
  };

  const handleCheckout = () => {
    const orderId = `UDZ-${Date.now().toString().slice(-6)}`;
    const redeemCode = generateDayZCode(); // Генеруємо унікальний код для видачі в грі
    
    // Зберігаємо історію замовлень у localStorage для сторінки профілю
    const newOrder = {
      id: orderId,
      code: redeemCode, // <--- Додано унікальний код видачі
      date: new Date().toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" }),
      items: items,
      total: total,
    };

    const existingOrders = JSON.parse(localStorage.getItem("outland_orders") || "[]");
    localStorage.setItem("outland_orders", JSON.stringify([newOrder, ...existingOrders]));

    clear();
    setOrder(orderId);
  };

  if (order) {
    return (
      <main className="relative isolate min-h-[700px] overflow-hidden border-b border-white/10 sm:min-h-[760px]">
        <div className="absolute inset-0 -z-20">
          <img src="/images/hero-bg.jpg" alt="Outland DayZ Background" className="h-full w-full scale-105 object-cover" />
        </div>
        <div className="absolute inset-0 -z-10 bg-black/20" />
        <div className="hero-vignette absolute inset-0 -z-10" />
        <div className="grid-lines absolute inset-0 -z-10 opacity-60" />

        <div className="shell relative z-10 flex min-h-[700px] flex-col items-center justify-center py-12 sm:min-h-[760px] sm:py-24">
          <div className="w-full max-w-xl rounded-2xl bg-black/50 p-8 sm:p-10 backdrop-blur-md border border-white/10 shadow-2xl text-center animate-enter">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-black/60 text-[#b6c980] border border-white/10 mb-5">
              <Check size={28} />
            </div>
            <p className="eyebrow">Оплату підтверджено</p>
            <h1 className="heading mt-3 text-4xl text-[#f2f5e9]">Замовлення прийнято</h1>
            <p className="mt-4 text-sm text-stone-300">Номер вашого замовлення: <b className="text-white font-mono">{order}</b></p>
            <p className="mt-2 text-xs text-[#b6c980]">Унікальний код видачі з'явився у вашому профілі в історії покупок!</p>
            <div className="mt-8">
              <a href="/profile" className="btn inline-flex items-center gap-2 rounded-xl px-6">
                До профілю <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative isolate min-h-[700px] overflow-hidden border-b border-white/10 sm:min-h-[760px]">
      {/* Фонове зображення */}
      <div className="absolute inset-0 -z-20">
        <img src="/images/hero-bg.jpg" alt="Outland DayZ Background" className="h-full w-full scale-105 object-cover" />
      </div>
      <div className="absolute inset-0 -z-10 bg-black/20" />
      <div className="hero-vignette absolute inset-0 -z-10" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-60" />

      <div className="shell relative z-10 flex min-h-[700px] flex-col justify-center py-12 sm:min-h-[760px] sm:py-24 max-w-5xl">
        
        <div className="animate-enter w-full">
          {items.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              
              {/* Список товарів */}
              <div className="space-y-4">
                {items.map((p, i) => (
                  <div key={`${p.id}-${i}`} className="rounded-2xl bg-black/50 p-5 backdrop-blur-md border border-white/10 shadow-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-14 w-14 shrink-0 rounded-xl bg-black/40 border border-white/10 grid place-items-center overflow-hidden">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <ShoppingBag className="text-stone-400" size={22} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white truncate text-base">{p.name}</h4>
                        <p className="text-xs text-stone-400 mt-0.5">Предмет для виживання</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 shrink-0">
                      <span className="font-mono text-base font-bold text-[#b6c980]">{p.price} ₴</span>
                      {removeItem && (
                        <button
                          onClick={() => removeItem(p.id)}
                          className="grid h-9 w-9 place-items-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition cursor-pointer"
                          title="Видалити"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Блок підсумку */}
              <div className="rounded-2xl bg-black/50 p-6 sm:p-7 backdrop-blur-md border border-white/10 shadow-2xl h-fit">
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">Підсумок замовлення</h3>
                <div className="my-4 h-[1px] w-full bg-white/10" />

                <div className="flex items-center justify-between text-sm mb-6">
                  <span className="text-stone-300">Разом до сплати:</span>
                  <span className="font-mono text-xl font-bold text-[#b6c980] flex items-center gap-1.5">
                    <Coins size={18} /> {total} ₴
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn w-full rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  Оплатити <ArrowRight size={16} />
                </button>
              </div>

            </div>
          ) : (
            <div className="rounded-2xl bg-black/50 p-10 sm:p-14 backdrop-blur-md border border-white/10 shadow-2xl text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-black/60 text-[#b6c980] border border-white/10 mb-5">
                <ShoppingBag size={28} />
              </div>
              <h3 className="font-bold text-xl text-white">Кошик порожній</h3>
              <p className="mt-2 text-sm text-stone-400 max-w-sm mx-auto leading-relaxed">
                Оберіть необхідне спорядження в магазині, щоб продовжити виживання.
              </p>
              <div className="mt-8">
                <Link
                  href="/shop"
                  className="btn inline-flex items-center gap-2 rounded-xl px-6"
                >
                  <ShoppingCart size={16} /> Перейти в магазин <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}