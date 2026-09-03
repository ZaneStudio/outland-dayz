"use client";

import { useState } from "react";
import { ShoppingCart, X, Check, Coins, AlertCircle } from "lucide-react";

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
};

export function ProductCard({ product }: { product: Product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const openModal = () => {
    setIsOpen(true);
    requestAnimationFrame(() => setVisible(true));
  };

  const closeModal = () => {
    setVisible(false);
    setTimeout(() => {
      setIsOpen(false);
      setSuccess(false);
      setError("");
    }, 300); // Час має відповідати тривалості transition (300мс)
  };

  const handleBuy = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          closeModal();
        }, 2000);
      } else {
        setError(data.message || "Помилка при покупці");
      }
    } catch {
      setError("Помилка з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Картка товару у списку */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md transition hover:border-[#84955a] flex flex-col justify-between shadow-xl">
        <div>
          {product.category && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9fb372]">
              {product.category}
            </span>
          )}
          <div className="mt-3 h-32 w-full rounded-xl bg-black/50 border border-white/5 grid place-items-center overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <ShoppingCart className="text-stone-600" size={32} />
            )}
          </div>
          <h3 className="mt-4 font-bold text-lg text-white">{product.name}</h3>
          <p className="mt-1 text-xs text-stone-400 line-clamp-2">{product.description || "Якісний ігровий предмет для виживання."}</p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-white/10">
          <span className="font-mono text-lg font-bold text-[#d8ec9a]">{product.price} ₴</span>
          <button
            onClick={openModal}
            className="btn !min-h-10 rounded-xl px-4 text-xs uppercase tracking-wider inline-flex items-center gap-2"
          >
            <ShoppingCart size={14} /> Придбати
          </button>
        </div>
      </div>

      {/* Спливаюче вікно з плавними анімаціями появи та закриття */}
      {isOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          className={`fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-md transition-all duration-300 ease-out ${
            visible ? "opacity-100 backdrop-blur-md" : "opacity-0 backdrop-blur-none"
          }`}
          onMouseDown={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <section className={`relative w-full max-w-lg rounded-3xl border border-white/20 bg-black/60 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.9)] transition-all duration-300 ease-out ${
            visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
          }`}>
            
            {/* Анімована кнопка закриття */}
            <button
              onClick={closeModal}
              aria-label="Закрити"
              className="absolute right-6 top-6 grid h-10 w-10 place-items-center rounded-2xl bg-white/5 text-stone-300 transition-all duration-200 hover:bg-white/15 hover:text-white hover:rotate-90 hover:scale-105 border border-white/10 shadow-lg cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="pr-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400">
                Підтвердження замовлення
              </span>
              <h2 className="heading mt-2 text-3xl sm:text-4xl text-white font-extrabold tracking-wide">
                {product.name}
              </h2>
              <p className="mt-2 text-sm text-stone-300 leading-relaxed">
                {product.description || "Перевірте деталі замовлення перед підтвердженням покупки."}
              </p>
            </div>

            <div className="my-6 h-[1px] w-full bg-white/15" />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-center justify-between mb-8 backdrop-blur-md">
              <span className="text-xs uppercase tracking-wider text-stone-300 font-medium">Сума до сплати:</span>
              <span className="font-mono text-xl font-bold text-[#d8ec9a] flex items-center gap-2">
                <Coins size={18} /> {product.price} ₴
              </span>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 flex items-center gap-2.5 backdrop-blur-md">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {success ? (
              <div className="rounded-2xl border border-[#879d5b]/60 bg-[#162512]/80 p-5 text-center text-[#d7e69d] text-sm font-bold flex items-center justify-center gap-2.5 backdrop-blur-md animate-enter">
                <Check size={18} /> Успішно придбано! Предмет додано до інвентарю.
              </div>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={closeModal}
                  className="btn btn-outline flex-1 !min-h-12 rounded-2xl text-xs uppercase tracking-widest border-white/20 hover:bg-white/10 cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleBuy}
                  disabled={loading}
                  className="btn flex-1 !min-h-12 rounded-2xl text-xs uppercase tracking-widest disabled:opacity-50 shadow-lg cursor-pointer"
                >
                  {loading ? "Обробка..." : "Придбати"}
                </button>
              </div>
            )}

          </section>
        </div>
      )}
    </>
  );
}