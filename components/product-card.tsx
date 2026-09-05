"use client";

import { ImageIcon } from "lucide-react";
import type { Product } from "@/lib/data";

export function ProductCard({ product }: { product: Product }) {
  const handleBuy = () => {
    // Логіка покупки або додавання в кошик
  };

  return (
    <div className="group relative w-full flex flex-col items-center justify-between rounded-3xl bg-[#12160e] border border-white/10 pt-36 pb-8 px-6 min-h-[380px] transition-all duration-500 hover:-translate-y-2 hover:border-[#b6c980]/40 hover:shadow-2xl hover:shadow-[#b6c980]/10">
      
      {/* Верхній кольоровий блок (двоколірний Pantone стиль) */}
      <div className="absolute top-0 left-0 right-0 h-40 rounded-t-3xl bg-[#1c2413] border-b border-white/5 transition-colors duration-500 group-hover:bg-[#253018]" />

      {/* Фотографія, що вистрибує (Popping Image) */}
      <div className="absolute -top-12 z-10 flex w-full justify-center px-4 pointer-events-none">
        {product.image ? (
          <img
            src={product.image}
            alt=""
            title=""
            className="h-36 w-36 object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] transition-all duration-500 group-hover:-translate-y-3 group-hover:scale-110 group-hover:rotate-[-3deg]"
          />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-black/40 border border-white/10 text-stone-600">
            <ImageIcon size={36} />
          </div>
        )}
      </div>

      {/* Текстовий блок всередині картки */}
      <div className="relative z-10 mt-4 flex w-full flex-col items-center text-center flex-1 justify-between">
        <div className="w-full">
          {/* Категорія товару */}
          <span className="mt-2 mb-3 inline-block text-[11px] font-mono uppercase tracking-widest text-[#b6c980]/80">
            {product.category}
          </span>
          
          {/* Назва товару всередині картки */}
          <h3 className="mb-3 text-lg font-bold text-white leading-tight truncate">
            {product.name}
          </h3>
          
          {/* Опис товару */}
          <p className="mb-8 text-xs text-stone-400 leading-relaxed px-1">
            {product.description || "Опис товару тимчасово відсутній."}
          </p>
        </div>

        {/* Кнопка-пігулка (Pill Button) */}
        <button
          onClick={handleBuy}
          className="flex w-full items-center justify-center gap-3 rounded-full bg-[#b6c980] hover:bg-[#c6d990] py-4 text-xs font-bold uppercase tracking-widest text-black shadow-lg shadow-[#b6c980]/10 transition-all hover:shadow-[#b6c980]/30 active:scale-95 cursor-pointer mt-auto"
        >
          <span className="font-mono text-sm">{product.price} ₴</span>
          <span className="w-1.5 h-1.5 rounded-full bg-black/40" />
          <span>Купити</span>
        </button>
      </div>
    </div>
  );
}