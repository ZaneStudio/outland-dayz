"use client";

import type { Product } from "@/lib/data";
import { useCart } from "@/components/cart";
import { Package, ShoppingCart } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <div className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 p-5 flex flex-col justify-between transition duration-300 hover:-translate-y-1 hover:border-[#84955a] shadow-xl">
      <div>
        {/* Картинка товару з обробкою помилки завантаження */}
        <div className="h-44 rounded-xl bg-black/40 border border-white/5 overflow-hidden mb-4 relative grid place-items-center">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="h-full w-full object-cover"
              onError={(e) => {
                // Якщо картинка не знайшлась, ховаємо її і показуємо іконку
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : null}
          
          {/* Заглушка, якщо картинки нема або вона не завантажилась */}
          <div className="absolute inset-0 -z-10 grid place-items-center text-stone-600">
            <Package size={32} />
          </div>

          {product.category && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-[#b6c980]">
              {product.category}
            </span>
          )}
        </div>

        {/* Назва та опис */}
        <h3 className="font-bold text-lg text-[#f2f5e9]">
          {product.name}
        </h3>
        
        <p className="mt-2 text-sm text-stone-400 line-clamp-2">
          {product.description || "Якісний ігровий предмет для виживання."}
        </p>
      </div>

      {/* Нижня частина: ціна та кнопка придбати */}
      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
        <span className="text-xl font-bold text-[#dce5bd]">
          {product.price} ₴
        </span>

        <button 
          onClick={() => add(product)}
          className="btn !min-h-9 !px-4 text-xs rounded-xl flex items-center gap-1.5"
        >
          <ShoppingCart size={14} />
          Придбати
        </button>
      </div>
    </div>
  );
}