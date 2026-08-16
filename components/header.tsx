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
  ["Рулетка", "/roulette"],
  ["Предмети", "/items"],
  ["Форум", "/forum"],
  ["Правила", "/rules"],
  ["Команда", "/team"],
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
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0c09]/95 backdrop-blur">
        <div className="shell flex h-16 items-center justify-between gap-3">
          <Link onClick={go('/')} href="/" className="heading shrink-0 text-xl text-[#dce5bd] sm:text-2xl">
            {siteConfig.name}
          </Link>

          <nav className="hidden items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-stone-300 xl:flex">
            {links.map(([x, h]) => (
              <Link onClick={go(h)} className="nav-link hover:text-[#adbd75]" href={h} key={h}>
                {x}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
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
              <Link onClick={go('/login')} className="hidden text-sm text-stone-300 hover:text-white md:block" href="/login">
                Увійти
              </Link>
            )}

            <Link onClick={go(user ? '/profile' : '/login')} className="btn hidden !min-h-9 !px-3 sm:inline-flex" href={user ? '/profile' : '/login'}>
              {user ? 'Профіль' : 'Steam Вхід'}
            </Link>

            <Link onClick={go('/checkout')} aria-label="Кошик" className="relative p-2 text-[#d9e6b3]" href="/checkout">
              <ShoppingCart size={20} />
              {items.length > 0 && (
                <b className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-ember text-[9px] text-white">
                  {items.length}
                </b>
              )}
            </Link>

            <button aria-label="Меню" className="p-2 transition hover:rotate-6 xl:hidden" onClick={() => setOpen(!open)}>
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="menu-reveal shell grid border-t border-white/10 py-3 xl:hidden">
            {user ? (
              <Link href="/profile" onClick={go('/profile')} className="flex items-center gap-2 border-b border-white/5 py-3 font-bold text-[#b6c87b]">
                {user.avatar && <img src={user.avatar} alt="Avatar" className="h-6 w-6 rounded-full" />}
                <span>{user.name || 'Профіль'}</span>
              </Link>
            ) : (
              <Link href="/login" onClick={go('/login')} className="border-b border-white/5 py-3 font-bold text-[#b6c87b]">
                Увійти через Steam
              </Link>
            )}

            {links.map(([x, h]) => (
              <Link onClick={go(h)} className="border-b border-white/5 py-3 text-sm font-bold uppercase" href={h} key={h}>
                {x}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
