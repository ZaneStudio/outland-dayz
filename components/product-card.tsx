"use client";

import Image from "next/image";
import { ShoppingBag, Check } from "lucide-react";
import type { Product } from "@/lib/data";
import { useCart } from "./cart";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
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
            className={`btn !min-h-9 !px-3 transition-all duration-300 ${
              added ? "!bg-[#84955a] !text-black font-bold" : ""
            }`}
          >
            {added ? <Check size={14} /> : <ShoppingBag size={14} />} 
            {added ? "Додано ✓" : "Придбати"}
          </button>
        </div>
      </div>
    </article>
  );
}