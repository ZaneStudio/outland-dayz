"use client";

import { Coins, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { readCachedProducts, refreshProducts } from "@/lib/product-client-cache";
import { readCachedProfile, readCachedSessionUser, type SteamUser } from "@/lib/profile-client-cache";

export default function Shop() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Усі");
  const [sort, setSort] = useState("popular");
  const [user, setUser] = useState<SteamUser | null>(() => readCachedProfile()?.user || readCachedSessionUser());
  const [balance, setBalance] = useState<number | null>(() => {
    const cachedProfile = readCachedProfile();
    if (cachedProfile) return cachedProfile.balance;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("outland_user_balance");
      if (saved !== null && !Number.isNaN(Number(saved))) return Number(saved);
    }
    return null;
  });
  const [products, setProducts] = useState<Product[] | null>(() => readCachedProducts());

  useEffect(() => {
    const syncBalance = () => {
      const savedBalance = localStorage.getItem("outland_user_balance");
      if (savedBalance !== null) {
        setBalance(Number(savedBalance));
      }
    };

    const fetchServerBalance = () => {
      fetch("/api/balance", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((x) => {
          if (x && typeof x.balance === "number") {
            setBalance(x.balance);
            localStorage.setItem("outland_user_balance", x.balance.toString());
          }
        })
        .catch(() => {});
    };

    syncBalance();
    window.addEventListener("storage", syncBalance);
    window.addEventListener("focus", fetchServerBalance);

    const cachedUser = readCachedProfile()?.user || readCachedSessionUser();
    if (cachedUser) {
      setUser(cachedUser);
      fetchServerBalance();
    } else {
      fetch("/api/auth/session")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          const current = d?.user || null;
          setUser(current);
          if (current) {
            fetchServerBalance();
          }
        })
        .catch(() => {});
    }

    const cachedProducts = readCachedProducts();
    if (cachedProducts) {
      setProducts(cachedProducts);
    }

    // Кеш показується миттєво, а свіжий список синхронізується у фоні.
    refreshProducts()
      .then(setProducts)
      .catch(() => {
        if (!cachedProducts) setProducts([]);
      });

    return () => {
      window.removeEventListener("storage", syncBalance);
      window.removeEventListener("focus", fetchServerBalance);
    };
  }, []);

  const cats = ["Усі", ...new Set((products || []).map((p) => p.category))];

  const view = useMemo(
    () =>
      (products || [])
        .filter((p) => (cat === "Усі" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => (sort === "price" ? a.price - b.price : b.popular - a.popular)),
    [products, q, cat, sort]
  );

  return (
    <main className="min-h-screen pb-24 relative isolate overflow-x-clip">
      {/* Розмитий атмосферний фон, зафіксований рівно по розміру вікна без розтягування */}
      <div className="fixed inset-0 h-screen w-screen overflow-hidden -z-20 pointer-events-none">
        <img
          src="/images/hero-bg.jpg"
          alt="Outland DayZ Background"
          style={{ filter: "blur(6px) brightness(0.8)" }}
          className="h-full w-full scale-105 object-cover object-center"
        />
      </div>
      <div className="fixed inset-0 -z-10 bg-black/40 pointer-events-none" />
      <div className="hero-vignette fixed inset-0 -z-10 pointer-events-none" />
      <div className="grid-lines fixed inset-0 -z-10 opacity-50 pointer-events-none" />

      <div className="shell pt-8 sm:pt-10">
        {/* Панель пошуку, фільтрів та балансу */}
        <div className="hero-content-card rounded-2xl bg-black/50 p-4 sm:p-5 backdrop-blur-md border border-white/10 shadow-2xl flex flex-wrap items-center gap-3.5">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full h-11 bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white placeholder-stone-400 outline-none focus:border-[#b6c980] transition"
              placeholder="Пошук предмету за назвою..."
            />
          </div>

          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-xs font-bold uppercase tracking-wider text-stone-200 outline-none focus:border-[#b6c980] transition cursor-pointer"
          >
            {cats.map((x) => (
              <option key={x} value={x} className="bg-neutral-900 text-white">
                {x}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-xs font-bold uppercase tracking-wider text-stone-200 outline-none focus:border-[#b6c980] transition cursor-pointer"
          >
            <option value="popular" className="bg-neutral-900 text-white">
              За популярністю
            </option>
            <option value="price" className="bg-neutral-900 text-white">
              Від дешевших
            </option>
          </select>

          {user && (
            <div className="h-11 rounded-xl bg-[#1c2413]/90 border border-[#b6c980]/30 flex items-center gap-2.5 px-4 shadow-lg">
              <Coins size={17} className="text-[#b6c980] shrink-0" />
              <span className="text-xs text-stone-300">Баланс:</span>
              <b className="font-mono text-sm font-extrabold text-[#dce8b3]">
                {balance === null ? "…" : `${balance} ₴`}
              </b>
            </div>
          )}
        </div>

        {products === null ? (
          <div className="hero-content-card rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 mt-6 animate-pulse p-12 text-center text-stone-400 shadow-xl">
            Завантаження товарів...
          </div>
        ) : (
          <>
            <div className="mt-5 flex items-center justify-between text-xs text-stone-300 px-1">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal size={13} className="text-[#b6c980]" />
                Знайдено товарів: <b className="text-white font-mono text-sm">{view.length}</b>
              </span>
              {cat !== "Усі" && (
                <button
                  onClick={() => setCat("Усі")}
                  className="text-[#b6c980] hover:text-white underline cursor-pointer"
                >
                  Скинути фільтр ({cat})
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-x-6 gap-y-16 pt-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {view.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {!view.length && (
              <div className="hero-content-card rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 mt-6 p-12 text-center shadow-xl">
                <p className="font-bold text-stone-200 text-lg">Товарів не знайдено</p>
                <p className="mt-2 text-sm text-stone-400">
                  Спробуйте змінити пошуковий запит або обрати іншу категорію.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
