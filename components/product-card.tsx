"use client";

import { useState } from "react";
import { ShoppingCart, X, Check, Coins, AlertCircle } from "lucide-react";
import { useCart } from "@/components/cart";

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
};

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart() as { addItem: (product: Product) => void };
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [success, setSuccess] = useState(false);

  const openModal = () => {
    setIsOpen(true);
    requestAnimationFrame(() => setVisible(true));
  };

  const closeModal = () => {
    setVisible(false);
    setTimeout(() => {
      setIsOpen(false);
      setSuccess(false);
    }, 300);
  };

  const handleAddToCart = () => {
    addItem(product);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      closeModal();
    }, 1500);
  };

  return (
    <>
      {/* Картка товару у магазині */}
      <div className="rounded-2xl bg-black/50 p-5 backdrop-blur-md border border-white/10 shadow-2xl transition hover:border-[#84955a] flex flex-col justify-between">
        <div>
          {product.category && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#b6c980]">
              {product.category}
            </span>
          )}
          <div className="mt-3 h-32 w-full rounded-xl bg-black/40 border border-white/10 grid place-items-center overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <ShoppingCart className="text-stone-500" size={32} />
            )}
          </div>
          <h3 className="mt-4 font-bold text-lg text-white">{product.name}</h3>
          <p className="mt-1 text-xs text-stone-400 line-clamp-2">{product.description || "Якісний ігровий предмет для виживання."}</p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-white/10">
          <span className="font-mono text-lg font-bold text-[#b6c980]">{product.price} ₴</span>
          <button
            onClick={openModal}
            className="btn !min-h-10 rounded-xl px-4 text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
          >
            <ShoppingCart size={14} /> Придбати
          </button>
        </div>
      </div>

      {/* Спливаюче вікно підтвердження в нашому стилі */}
      {isOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          className={`fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-md transition-all duration-300 ease-out ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          onMouseDown={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <section className={`relative w-full max-w-lg rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 p-8 sm:p-10 shadow-2xl transition-all duration-300 ease-out ${
            visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
          }`}>
            
            {/* Кнопка закриття */}
            <button
              onClick={closeModal}
              aria-label="Закрити"
              className="absolute right-6 top-6 grid h-10 w-10 place-items-center rounded-xl bg-black/60 text-stone-300 transition-all duration-200 hover:bg-white/15 hover:text-white hover:rotate-90 hover:scale-105 border border-white/10 shadow-lg cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="pr-10">
              <p className="eyebrow">Додавання до кошика</p>
              <h2 className="heading mt-2 text-3xl sm:text-4xl text-[#f2f5e9]">
                {product.name}
              </h2>
              <p className="mt-2 text-sm text-stone-300 leading-relaxed">
                {product.description || "Бажаєте додати цей предмет до свого кошика спорядження?"}
              </p>
            </div>

            <div className="my-6 h-[1px] w-full bg-white/10" />

            <div className="rounded-xl bg-black/40 border border-white/10 p-4 flex items-center justify-between mb-8">
              <span className="text-xs uppercase tracking-wider text-stone-300 font-medium">Вартість:</span>
              <span className="font-mono text-xl font-bold text-[#b6c980] flex items-center gap-2">
                <Coins size={18} /> {product.price} ₴
              </span>
            </div>

            {success ? (
              <div className="rounded-xl border border-[#879d5b]/60 bg-black/60 p-4 text-center text-[#b6c980] text-sm font-bold flex items-center justify-center gap-2.5 animate-enter">
                <Check size={18} /> Успішно додано до кошика!
              </div>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={closeModal}
                  className="btn btn-outline flex-1 !min-h-12 rounded-xl text-xs uppercase tracking-widest border-white/20 hover:bg-white/10 cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleAddToCart}
                  className="btn flex-1 !min-h-12 rounded-xl text-xs uppercase tracking-widest shadow-lg cursor-pointer"
                >
                  Додати в кошик
                </button>
              </div>
            )}

          </section>
        </div>
      )}
    </>
  );
}