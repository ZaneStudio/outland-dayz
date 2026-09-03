"use client";

import Link from "next/link";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { useCart } from "./cart";

const links = [
  ["Головна", "/"],
  ["Магазин", "/shop"],
  ["VIP", "/vip"],
  ["Кейси", "/roulette"],
];

type SteamUser = { steamId: string; name: string; avatar: string };

export function Header() {
  const [open, setOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [user, setUser] = useState<SteamUser | null>(null);
  const { items } = useCart();
  const router = useRouter();
  const path = usePathname();

  const go = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href === path) return;
    e.preventDefault();
    setOpen(false);
    setTransitioning(true);
    window.setTimeout(() => router.push(href), 300);
  };

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null));
  }, [path]);

  useEffect(() => {
    if (!transitioning) return;
    const timer = window.setTimeout(() => setTransitioning(false), 620);
    return () => window.clearTimeout(timer);
  }, [path, transitioning]);

  return (
    <>
      <div className={`route-curtain ${transitioning ? 'is-active' : ''}`} />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur-md shadow-lg">
        <div className="shell relative flex h-16 items-center justify-between gap-4">
          
          {/* Пустий блок зліва для збереження симетрії сітки */}
          <div className="w-24 hidden xl:block" />

          {/* Навігація чітко по центру */}
          <nav className="hidden absolute left-1/2 -translate-x-1/2 items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-300 xl:flex">
            {links.map(([x, h]) => {
              const active = path === h;
              return (
                <Link 
                  onClick={go(h)} 
                  className={`px-4 py-2 rounded-xl transition duration-300 border ${
                    active 
                      ? 'bg-white/10 border-white/20 text-[#dce5bd] shadow-md' 
                      : 'bg-transparent border-transparent text-stone-400 hover:bg-white/5 hover:border-white/10 hover:text-white'
                  }`} 
                  href={h} 
                  key={h}
                >
                  {x}
                </Link>
              );
            })}
          </nav>

          {/* Кнопки справа */}
          <div className="flex w-full xl:w-auto justify-between xl:justify-end shrink-0 items-center gap-2 sm:gap-3">
            <button aria-label="Меню" className="p-2.5 rounded-xl border border-white/10 bg-black/30 text-stone-300 transition hover:bg-white/5 hover:text-white xl:hidden" onClick={() => setOpen(!open)}>
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="flex items-center gap-2 sm:gap-3 ml-auto xl:ml-0">
              {user ? (
                <Link
                  onClick={go('/profile')}
                  href="/profile"
                  className="hidden max-w-40 items-center gap-2 text-sm text-[#dce5bd] transition hover:text-[#b8ca7d] md:flex"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="Steam avatar" className="h-7 w-7 rounded-full border border-[#82945b]" />
                  ) : (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#82945b] text-xs font-bold text-black">
                      {user.name ? user.name[0] : 'U'}
                    </span>
                  )}
                  <span className="truncate">{user.name || user.steamId}</span>
                </Link>
              ) : (
                <Link onClick={go('/login')} className="hidden text-sm text-stone-300 hover:text-white md:block px-3 py-2 rounded-xl transition hover:bg-white/5" href="/login">
                  Увійти
                </Link>
              )}

              <Link onClick={go(user ? '/profile' : '/login')} className="btn rounded-xl hidden !min-h-10 !px-4 text-xs sm:inline-flex" href={user ? '/profile' : '/login'}>
                {user ? 'Профіль' : 'Steam Вхід'}
              </Link>

              <Link onClick={go('/checkout')} aria-label="Кошик" className="relative p-2.5 rounded-xl border border-white/10 bg-black/30 text-[#d9e6b3] transition hover:border-[#84955a] hover:bg-white/5 hover:text-white" href="/checkout">
                <ShoppingCart size={18} />
                {items.length > 0 && (
                  <b className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-ember text-[9px] text-white">
                    {items.length}
                  </b>
                )}
              </Link>
            </div>
          </div>
        </div>

        {open && (
          <nav className="menu-reveal shell grid border-t border-white/10 bg-black/90 backdrop-blur-md py-4 gap-2 xl:hidden">
            {user ? (
              <Link href="/profile" onClick={go('/profile')} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-[#b6c87b]">
                {user.avatar && <img src={user.avatar} alt="Avatar" className="h-6 w-6 rounded-full" />}
                <span>{user.name || 'Профіль'}</span>
              </Link>
            ) : (
              <Link href="/login" onClick={go('/login')} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-[#b6c87b]">
                Увійти через Steam
              </Link>
            )}

            {links.map(([x, h]) => (
              <Link onClick={go(h)} className="px-4 py-3 rounded-xl border border-white/5 bg-black/30 text-sm font-bold uppercase transition hover:border-white/10 hover:bg-white/5" href={h} key={h}>
                {x}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}