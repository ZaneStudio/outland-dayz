"use client";

import { useState } from "react";
import { ArrowRight, ShoppingCart, X, Check, Coins } from "lucide-react";
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
  const cart = useCart() as any;
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
    if (typeof cart.addItem === "function") {
      cart.addItem(product);
    } else if (typeof cart.add === "function") {
      cart.add(product);
    } else if (Array.isArray(cart.items)) {
      const updated = [...cart.items, product];
      localStorage.setItem("outland_cart", JSON.stringify(updated));
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      closeModal();
    }, 1500);
  };

  return (
    <>
      {/* Компактна картка товару */}
      <div 
        onClick={openModal}
        className="group rounded-2xl bg-[#12160f]/95 p-3.5 border border-white/15 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#b6c980] cursor-pointer flex flex-col justify-between"
      >
        <div>
          {/* Зображення товару (зменшена висота) */}
          <div className="relative h-36 w-full rounded-xl bg-black/40 border border-white/5 overflow-hidden grid place-items-center">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            ) : (
              <ShoppingCart className="text-stone-600" size={28} />
            )}
            {product.category && (
              <span className="absolute top-2.5 left-2.5 rounded-lg bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#b6c980] backdrop-blur-md border border-white/10">
                {product.category}
              </span>
            )}
          </div>

          {/* Назва товару */}
          <h3 className="mt-3 font-bold text-base text-white tracking-wide truncate">
            {product.name}
          </h3>
        </div>

        {/* Ціна та компактна кругла кнопка зі стрілкою */}
        <div className="mt-4 flex items-center justify-between pt-2.5 border-t border-white/10">
          <span className="font-mono text-sm font-bold text-[#b6c980]">
            {product.price} ₴
          </span>
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#2a351b] text-[#b6c980] border border-white/10 transition-all duration-200 group-hover:bg-[#b6c980] group-hover:text-black group-hover:scale-105 shadow-md">
            <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* Модальне вікно */}
      {isOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          className={`fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-md transition-all duration-300 ease-out ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          onMouseDown={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <section className={`relative w-full max-w-lg rounded-2xl bg-[#12160f]/95 backdrop-blur-2xl border border-white/15 p-8 sm:p-10 shadow-2xl transition-all duration-300 ease-out ${
            visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
          }`}>
            
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