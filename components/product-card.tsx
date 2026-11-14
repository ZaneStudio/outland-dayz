"use client";

import { useState } from "react";
import { Check, ImageIcon, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/data";
import { useCart } from "@/components/cart";

type ExtendedProduct = Product & {
  imgScale?: number;
  imgX?: number;
  imgY?: number;
};

export function ProductCard({ product }: { product: ExtendedProduct }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    add(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  const scale = product.imgScale ?? 1;
  const x = product.imgX ?? 0;
  const y = product.imgY ?? 0;

  return (
    <div className="group relative w-full flex flex-col justify-between rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 pt-36 pb-6 px-5 min-h-[390px] shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[#b6c980]/40 hover:shadow-[#b6c980]/10">
      {/* Верхній підсвічений блок під предметом */}
      <div className="absolute top-0 left-0 right-0 h-36 rounded-t-2xl bg-gradient-to-b from-[#1e2714]/90 to-[#12170d]/90 border-b border-white/10 transition-colors duration-300 group-hover:from-[#263219] group-hover:to-[#151c0f]" />

      {/* Картинка, що виходить за рамки */}
      <div className="absolute -top-12 left-0 right-0 z-10 flex w-full justify-center px-4 pointer-events-none">
        {product.image ? (
          <div className="h-36 w-36 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              title={product.name}
              decoding="async"
              style={
                {
                  "--tx": `${x}px`,
                  "--ty": `${y}px`,
                  "--sc": scale,
                  transform: "translate(var(--tx), var(--ty)) scale(var(--sc))",
                } as React.CSSProperties
              }
              className="max-h-36 max-w-full object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,0.85)] transition-all duration-500 group-hover:scale-[calc(var(--sc)*1.08)] group-hover:translate-x-[var(--tx)] group-hover:translate-y-[calc(var(--ty)-8px)] group-hover:rotate-[-2deg]"
            />
          </div>
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-black/40 border border-white/10 text-stone-600">
            <ImageIcon size={36} />
          </div>
        )}
      </div>

      {/* Текстовий блок — чіткий та читабельний */}
      <div className="relative z-10 mt-3 flex w-full flex-col flex-1 justify-between">
        <div className="text-center">
          <span className="inline-block rounded-lg bg-[#1c2413] border border-[#b6c980]/35 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#c8dc8f]">
            {product.category}
          </span>

          <h3 className="mt-3 text-lg sm:text-[19px] font-bold text-[#f4f7ed] leading-snug group-hover:text-white transition">
            {product.name}
          </h3>

          <p className="mt-2.5 text-[13px] sm:text-sm text-stone-200 leading-relaxed">
            {product.description || "Опис товару тимчасово відсутній."}
          </p>
        </div>

        {/* Нижня панель ціни та покупки в стилі сайту */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="text-left">
            <span className="block text-[11px] uppercase tracking-wider text-stone-300 font-bold">Ціна</span>
            <span className="font-mono text-xl sm:text-2xl font-extrabold text-[#dce8b3] leading-none">
              {product.price} <small className="text-sm font-bold text-[#b6c980]">₴</small>
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="btn !min-h-11 h-11 !px-4 rounded-xl text-[13px] uppercase tracking-wider shrink-0 cursor-pointer"
          >
            {added ? (
              <>
                <Check size={16} /> Додано
              </>
            ) : (
              <>
                <ShoppingCart size={16} /> У кошик
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
