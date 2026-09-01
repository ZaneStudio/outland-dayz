"use client";

import Image from "next/image";
import { ShoppingBag, Check } from "lucide-react";
import type { Product } from "@/lib/data";
import { useCart } from "./cart";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [showToast, setShowToast] = useState(false);

  const handleAdd = () => {
    add(product);
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <>
      <article className="panel group overflow-hidden transition hover:-translate-y-1 hover:border-[#84955a]/60">
        <div className="relative h-40 overflow-hidden">
          <Image 
            fill 
            src={product.image} 
            alt={product.name} 
            className="object-cover opacity-75 transition duration-500 group-hover:scale-110 group-hover:opacity-100"
          />
          <span className="absolute left-3 top-3 bg-[#090b09]/80 px-2 py-1 text-[10px] font-bold uppercase text-[#c3d291]">
            {product.category}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-bold">{product.name}</h3>
          <p className="mt-2 h-9 text-xs leading-relaxed text-stone-400">{product.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <b className="text-lg text-[#d9e6a1]">{product.price} ₴</b>
            <button 
              onClick={handleAdd} 
              className="btn !min-h-9 !px-3"
            >
              <ShoppingBag size={14} /> Придбати
            </button>
          </div>
        </div>
      </article>

      {/* Гарне спливаюче вікно сповіщення */}
      <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-[#84955a]/40 bg-[#0d100d]/95 px-4 py-3 text-white shadow-2xl backdrop-blur transition-all duration-300 ${
        showToast ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      }`}>
        <div className="grid h-7 w-7 place-items-center rounded-full bg-[#84955a]/20 text-[#c3d291]">
          <Check size={16} />
        </div>
        <div>
          <p className="text-xs font-bold text-stone-200">Товар додано до кошика</p>
          <p className="text-[11px] text-stone-400">{product.name}</p>
        </div>
      </div>
    </>
  );
}