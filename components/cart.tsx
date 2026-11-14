"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ShoppingBag, ShoppingCart, X } from "lucide-react";
import type { Product } from "@/lib/data";

type CartContextType = {
  items: Product[];
  add: (p: Product) => void;
  remove: (id: string) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

type ToastNotification = {
  key: number;
  product: Product;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const timerRef = useRef<number | null>(null);

  const dismissToast = useCallback(() => {
    setToast(null);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const add = useCallback((product: Product) => {
    setItems((prev) => [...prev, product]);
    setToast({ key: Date.now(), product });

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, 3200);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((item, i) => item.id === id || `${item.id}-${i}` === id);
      if (idx === -1) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        add,
        remove,
        removeItem: remove,
        clear,
      }}
    >
      {children}

      {/* Фірмове спливаюче сповіщення про додавання в кошик */}
      {toast && (
        <div
          key={toast.key}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[120] w-[calc(100vw-32px)] max-w-[440px] pointer-events-none"
        >
          <div className="hero-content-card pointer-events-auto relative overflow-hidden rounded-2xl bg-[#0b0e09]/90 backdrop-blur-xl border border-[#b6c980]/35 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_25px_rgba(182,201,128,0.12)] animate-enter">
            <div className="flex items-center gap-3.5">
              {/* Іконка / Мініатюра товару */}
              <div className="relative h-14 w-14 shrink-0 rounded-xl bg-gradient-to-b from-[#1e2714] to-[#12170d] border border-[#b6c980]/30 p-1.5 flex items-center justify-center shadow-inner">
                {toast.product.image ? (
                  <img
                    src={toast.product.image}
                    alt={toast.product.name}
                    className="max-h-full max-w-full object-contain drop-shadow-[0_6px_8px_rgba(0,0,0,0.8)]"
                  />
                ) : (
                  <ShoppingBag size={22} className="text-[#b6c980]" />
                )}
                <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-[#b6c980] text-[#0b0e09] shadow-md">
                  <Check size={12} strokeWidth={3} />
                </span>
              </div>

              {/* Інформація про доданий товар */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#b6c980]" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#b6c980]">
                    Товар додано до кошика
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm sm:text-[15px] font-bold text-white">{toast.product.name}</p>
                <div className="mt-1 flex items-center gap-2.5 text-[13px]">
                  <span className="font-mono font-extrabold text-[#dce8b3]">{toast.product.price} ₴</span>
                  <span className="text-white/25">•</span>
                  <span className="text-stone-300">
                    У кошику: <b className="text-white font-mono">{items.length}</b>
                  </span>
                </div>
              </div>

              {/* Кнопки дії */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href="/checkout"
                  onClick={dismissToast}
                  className="btn !min-h-10 h-10 !px-3.5 rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-1.5"
                >
                  <ShoppingCart size={14} />
                  <span>Кошик</span>
                  <ArrowRight size={13} />
                </Link>
                <button
                  onClick={dismissToast}
                  aria-label="Закрити сповіщення"
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-black/40 text-stone-400 hover:text-white hover:border-white/25 transition cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext)!;
