"use client";

import Link from "next/link";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { readCachedProducts, refreshProducts, warmProductsCache } from "@/lib/product-client-cache";
import {
  clearProfileCache,
  readCachedProfile,
  readCachedSessionUser,
  refreshProfile,
  saveCachedSessionUser,
  warmProfileCache,
  type SteamUser,
} from "@/lib/profile-client-cache";
import { useCart } from "./cart";

const links = [
  ["Головна", "/"],
  ["Магазин", "/shop"],
  ["VIP", "/vip"],
  ["Кейси", "/roulette"],
  ["Лаунчер", "/launcher-updates"],
];

const CURTAIN_ENTER_MS = 380;
const MIN_CURTAIN_HOLD_MS = 460;

function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise.catch(() => null),
    new Promise<null>((resolve) => window.setTimeout(() => resolve(null), ms)),
  ]);
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = useState<SteamUser | null>(null);
  const { items } = useCart();
  const router = useRouter();
  const path = usePathname();
  const destination = useRef<string | null>(null);
  const startTimer = useRef<number | null>(null);
  const safetyTimer = useRef<number | null>(null);
  const transitionStartedAt = useRef<number>(0);
  const transitionSeq = useRef<number>(0);

  const go = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href === path) return;
    e.preventDefault();
    setOpen(false);

    if (href === "/profile") {
      warmProfileCache();
    } else if (href === "/shop") {
      warmProductsCache();
    }

    const seq = ++transitionSeq.current;
    destination.current = href;
    transitionStartedAt.current = performance.now();
    setTransitioning(true);

    if (startTimer.current) window.clearTimeout(startTimer.current);
    if (safetyTimer.current) window.clearTimeout(safetyTimer.current);

    // Чекаємо, поки шторка плавно і повністю закриє екран, перш ніж рендерити нову сторінку
    startTimer.current = window.setTimeout(() => {
      if (transitionSeq.current !== seq) return;
      startTransition(() => router.push(href));
      startTimer.current = null;
    }, CURTAIN_ENTER_MS);

    // Страхувальний таймер, щоб шторка ніколи не зависла
    safetyTimer.current = window.setTimeout(() => {
      if (transitionSeq.current !== seq) return;
      setTransitioning(false);
      destination.current = null;
    }, 4500);
  };

  useEffect(() => {
    const cachedUser = readCachedSessionUser();
    if (cachedUser) {
      setUser(cachedUser);
      warmProfileCache();
    }

    [...links.map(([, href]) => href), "/profile", "/login", "/checkout", "/news"].forEach((href) =>
      router.prefetch(href)
    );
    // Починаємо завантаження каталогу ще до переходу в магазин.
    warmProductsCache();
  }, [router]);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const nextUser = (data?.user as SteamUser | undefined) || null;
        setUser(nextUser);
        if (nextUser) {
          saveCachedSessionUser(nextUser);
          warmProfileCache();
        } else {
          clearProfileCache();
        }
      })
      .catch(() => {
        // Не скидаємо закешованого користувача при тимчасовій помилці мережі
      });
  }, [path]);

  useEffect(() => {
    if (!transitioning || isPending || path !== destination.current) return;

    const seq = transitionSeq.current;
    let cancelled = false;

    const finishTransition = async () => {
      // 1. Чекаємо готовності даних цільової сторінки, якщо вони ще завантажуються
      if (path === "/profile" && !readCachedProfile()) {
        await withTimeout(refreshProfile(), 2200);
      } else if (path === "/shop" && !readCachedProducts()) {
        await withTimeout(refreshProducts(), 2200);
      }

      // 2. Переконуємося, що шторка повністю завершила анімацію підйому до верху екрана
      const elapsed = performance.now() - transitionStartedAt.current;
      if (elapsed < MIN_CURTAIN_HOLD_MS) {
        await new Promise((resolve) => window.setTimeout(resolve, MIN_CURTAIN_HOLD_MS - elapsed));
      }

      // 3. Чекаємо, поки браузер відмалює DOM нової сторінки під шторкою
      await waitForNextPaint();

      if (cancelled || transitionSeq.current !== seq) return;
      if (safetyTimer.current) {
        window.clearTimeout(safetyTimer.current);
        safetyTimer.current = null;
      }
      setTransitioning(false);
      destination.current = null;
    };

    void finishTransition();

    return () => {
      cancelled = true;
    };
  }, [path, transitioning, isPending]);

  useEffect(
    () => () => {
      if (startTimer.current) window.clearTimeout(startTimer.current);
      if (safetyTimer.current) window.clearTimeout(safetyTimer.current);
    },
    []
  );

  return (
    <>
      <div className={`route-curtain ${transitioning ? "is-active" : ""}`} />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur-md shadow-lg">
        <div className="shell relative flex h-16 items-center justify-between gap-4">
          <Link onClick={go("/")} href="/" className="site-wordmark hidden xl:flex" aria-label="Outland DayZ — головна">
            <span className="site-wordmark-mark" />
            <span>
              Outland <em>DayZ</em>
            </span>
          </Link>

          {/* Навігація чітко по центру */}
          <nav className="hidden absolute left-1/2 -translate-x-1/2 items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-300 xl:flex">
            {links.map(([x, h]) => {
              const active = path === h;
              return (
                <Link
                  onClick={go(h)}
                  className={`px-4 py-2 rounded-xl transition duration-300 border ${
                    active
                      ? "bg-white/10 border-white/20 text-[#dce5bd] shadow-md"
                      : "bg-transparent border-transparent text-stone-400 hover:bg-white/5 hover:border-white/10 hover:text-white"
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
            <button
              aria-label="Меню"
              className="p-2.5 rounded-xl border border-white/10 bg-black/30 text-stone-300 transition hover:bg-white/5 hover:text-white xl:hidden"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="flex items-center gap-2 sm:gap-3 ml-auto xl:ml-0">
              {user ? (
                <Link
                  onMouseEnter={warmProfileCache}
                  onClick={go("/profile")}
                  href="/profile"
                  className="hidden max-w-40 items-center gap-2 text-sm text-[#dce5bd] transition hover:text-[#b8ca7d] md:flex"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="Steam avatar" className="h-7 w-7 rounded-full border border-[#82945b]" />
                  ) : (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#82945b] text-xs font-bold text-black">
                      {user.name ? user.name[0] : "U"}
                    </span>
                  )}
                  <span className="truncate">{user.name || user.steamId}</span>
                </Link>
              ) : (
                <Link
                  onClick={go("/login")}
                  className="hidden text-sm text-stone-300 hover:text-white md:block px-3 py-2 rounded-xl transition hover:bg-white/5"
                  href="/login"
                >
                  Увійти
                </Link>
              )}

              <Link
                onMouseEnter={user ? warmProfileCache : undefined}
                onClick={go(user ? "/profile" : "/login")}
                className="btn rounded-xl hidden !min-h-10 !px-4 text-xs sm:inline-flex"
                href={user ? "/profile" : "/login"}
              >
                {user ? "Профіль" : "Steam Вхід"}
              </Link>

              <Link
                onClick={go("/checkout")}
                aria-label="Кошик"
                className="relative p-2.5 rounded-xl border border-white/10 bg-black/30 text-[#d9e6b3] transition hover:border-[#84955a] hover:bg-white/5 hover:text-white"
                href="/checkout"
              >
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
              <Link
                href="/profile"
                onClick={go("/profile")}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-[#b6c87b]"
              >
                {user.avatar && <img src={user.avatar} alt="Avatar" className="h-6 w-6 rounded-full" />}
                <span>{user.name || "Профіль"}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={go("/login")}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-[#b6c87b]"
              >
                Увійти через Steam
              </Link>
            )}

            {links.map(([x, h]) => (
              <Link
                onClick={go(h)}
                className="px-4 py-3 rounded-xl border border-white/5 bg-black/30 text-sm font-bold uppercase transition hover:border-white/10 hover:bg-white/5"
                href={h}
                key={h}
              >
                {x}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
