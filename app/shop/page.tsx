"use client";

import { Coins, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/data";
import { ProductCard } from "@/components/product-card";

type SteamUser = { steamId: string; name: string; avatar: string };

export default function Shop() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Усі");
  const [sort, setSort] = useState("popular");
  const [user, setUser] = useState<SteamUser | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    const syncBalance = () => {
      const savedBalance = localStorage.getItem("outland_user_balance");
      if (savedBalance !== null) {
        setBalance(Number(savedBalance));
      }
    };

    window.addEventListener("storage", syncBalance);
    const interval = setInterval(syncBalance, 1000);

    fetch('/api/auth/session')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        const current = d?.user || null;
        setUser(current);
        if (current) {
          fetch('/api/balance', { cache: 'no-store' })
            .then(r => (r.ok ? r.json() : { balance: 0 }))
            .then(x => {
              const realBalance = Number(x.balance) || 0;
              setBalance(realBalance);
              localStorage.setItem("outland_user_balance", realBalance.toString());
            })
            .catch(() => setBalance(0));
        }
      })
      .catch(() => setUser(null));

    fetch('/api/products')
      .then(r => (r.ok ? r.json() : []))
      .then(setProducts)
      .catch(() => setProducts([]));

    return () => {
      window.removeEventListener("storage", syncBalance);
      clearInterval(interval);
    };
  }, []);

  const cats = ["Усі", ...new Set((products || []).map(p => p.category))];
  
  const view = useMemo(
    () =>
      (products || [])
        .filter(
          p =>
            (cat === "Усі" || p.category === cat) &&
            p.name.toLowerCase().includes(q.toLowerCase())
        )
        .sort((a, b) =>
          sort === "price" ? a.price - b.price : b.popular - a.popular
        ),
    [products, q, cat, sort]
  );

  return (
    <main className="min-h-screen pb-24">
      <section className="relative isolate overflow-hidden border-b border-white/10 py-8 sm:py-10">
        <div className="absolute inset-0 -z-20">
          <img
            src="/images/hero-bg.jpg"
            alt="Outland DayZ Background"
            className="h-full w-full scale-105 object-cover"
          />
        </div>

        <div className="absolute inset-0 -z-10 bg-black/40" />
        <div className="hero-vignette absolute inset-0 -z-10" />
        <div className="grid-lines absolute inset-0 -z-10 opacity-60" />

        <div className="shell relative z-10 flex items-center justify-end">
          {user && (
            <div className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 flex min-w-52 items-center gap-3 px-5 py-3 shadow-xl">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#2a351b] text-[#d8ec9a] border border-white/5">
                <Coins size={18} />
              </span>
              <div>
                <p className="eyebrow">Ваш баланс</p>
                <p className="mt-0.5 text-lg font-bold text-[#d8ec9a]">
                  {balance === null ? '…' : `${balance} ₴`}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="shell mt-6 sm:mt-8">
        <div className="rounded-2xl bg-black/50 p-4 sm:p-6 backdrop-blur-md border border-white/10 shadow-xl grid gap-4 md:grid-cols-[1fr_auto_auto]">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-stone-500 outline-none focus:border-[#b6c980] transition"
              placeholder="Пошук предмету..."
            />
          </div>

          <select
            value={cat}
            onChange={e => setCat(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-stone-300 outline-none focus:border-[#b6c980] transition cursor-pointer"
          >
            {cats.map(x => (
              <option key={x} value={x} className="bg-neutral-900 text-white">
                {x}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-stone-300 outline-none focus:border-[#b6c980] transition cursor-pointer"
          >
            <option value="popular" className="bg-neutral-900 text-white">За популярністю</option>
            <option value="price" className="bg-neutral-900 text-white">Від дешевших</option>
          </select>
        </div>

        {products === null ? (
          <div className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 mt-6 animate-pulse p-12 text-center text-stone-500 shadow-xl">
            Завантаження товарів...
          </div>
        ) : (
          <>
            <p className="mt-8 text-sm text-stone-400">
              Знайдено товарів: <span className="text-white font-bold">{view.length}</span>
            </p>

            <div className="mt-6 grid gap-x-6 gap-y-16 pt-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {view.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {!view.length && (
              <div className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 mt-6 p-12 text-center shadow-xl">
                <p className="font-bold text-stone-300 text-lg">Магазин оновлюється</p>
                <p className="mt-2 text-sm text-stone-500">
                  Адміністрація додасть нові товари найближчим часом.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}