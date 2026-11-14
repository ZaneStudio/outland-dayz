"use client";

import Link from "next/link";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
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
  const pathRef = useRef(path);
  pathRef.current = path;

  const destination = useRef<string | null>(null);
  const startTimer = useRef<number | null>(null);
  const safetyTimer = useRef<number | null>(null);
  const transitionStartedAt = useRef<number>(0);
  const transitionSeq = useRef<number>(0);

  const triggerCurtainNavigation = useCallback(
    (targetHref: string, targetPathname?: string, fullReload?: boolean) => {
      const resolvedPathname = targetPathname ?? targetHref.split("?")[0].split("#")[0];
      if (!fullReload && resolvedPathname === pathRef.current) return;

      setOpen(false);

      if (resolvedPathname === "/profile") {
        warmProfileCache();
      } else if (resolvedPathname === "/shop") {
        warmProductsCache();
      }

      const seq = ++transitionSeq.current;
      destination.current = resolvedPathname;
      transitionStartedAt.current = performance.now();
      setTransitioning(true);

      if (startTimer.current) window.clearTimeout(startTimer.current);
      if (safetyTimer.current) window.clearTimeout(safetyTimer.current);

      // Чекаємо, поки шторка плавно і повністю закриє екран, перш ніж рендерити нову сторінку
      startTimer.current = window.setTimeout(() => {
        if (transitionSeq.current !== seq) return;
        startTimer.current = null;
        if (fullReload) {
          window.location.href = targetHref;
          return;
        }
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        startTransition(() => router.push(targetHref));
      }, CURTAIN_ENTER_MS);

      // Страхувальний таймер, щоб шторка ніколи не зависла
      safetyTimer.current = window.setTimeout(() => {
        if (transitionSeq.current !== seq) return;
        setTransitioning(false);
        destination.current = null;
      }, 4500);
    },
    [router]
  );

  const go = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href === path) return;
    e.preventDefault();
    triggerCurtainNavigation(href, href);
  };

  // Глобальний перехоплювач переходів для всіх внутрішніх посилань та кнопок на сайті
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a");
      if (!anchor) return;

      if (anchor.hasAttribute("download") || anchor.dataset.noCurtain === "true") return;
      const targetAttr = anchor.getAttribute("target");
      if (targetAttr && targetAttr !== "_self") return;

      const rawHref = anchor.getAttribute("href");
      if (
        !rawHref ||
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:") ||
        rawHref.startsWith("javascript:")
      ) {
        return;
      }

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.origin);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      // Прямі посилання на завантаження файлів пропускаємо без шторки
      if (/\.(exe|zip|rar|7z|msi|dmg|pdf)$/i.test(url.pathname)) return;

      // Серверні редіректи авторизації (наприклад, /api/auth/steam) — піднімаємо шторку і переходимо
      if (url.pathname.startsWith("/api/")) {
        e.preventDefault();
        triggerCurtainNavigation(url.href, url.pathname, true);
        return;
      }

      if (url.pathname === pathRef.current && url.search === window.location.search) {
        return;
      }

      e.preventDefault();
      const nextHref = `${url.pathname}${url.search}${url.hash}`;
      triggerCurtainNavigation(nextHref, url.pathname, false);
    };

    const handleCustomNavigate = (e: Event) => {
      const custom = e as CustomEvent<{ href?: string; fullReload?: boolean }>;
      const href = custom.detail?.href;
      if (!href) return;
      triggerCurtainNavigation(href, href.split("?")[0].split("#")[0], Boolean(custom.detail?.fullReload));
    };

    document.addEventListener("click", handleGlobalClick, true);
    window.addEventListener("outland:navigate", handleCustomNavigate);

    return () => {
      document.removeEventListener("click", handleGlobalClick, true);
      window.removeEventListener("outland:navigate", handleCustomNavigate);
    };
  }, [triggerCurtainNavigation]);

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
          <Link onClick={go("/")} href="/" className="site-wordmark hidden shrink-0 xl:flex" aria-label="Outland DayZ — головна">
            <span className="site-wordmark-mark" />
            <span>
              Outland <em>DayZ</em>
            </span>
          </Link>

          {/* Симетрична навігація з однаковою шириною та висотою кнопок */}
          <nav className="hidden xl:grid xl:grid-cols-5 items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-stone-200">
            {links.map(([x, h]) => {
              const active = path === h;
              return (
                <Link
                  onClick={go(h)}
                  className={`h-10 w-[116px] inline-flex items-center justify-center rounded-xl transition duration-300 border text-center ${
                    active
                      ? "bg-white/10 border-white/20 text-[#dce5bd] shadow-md"
                      : "bg-white/[0.03] border-white/10 text-stone-200 hover:bg-white/10 hover:border-white/20 hover:text-white"
                  }`}
                  href={h}
                  key={h}
                >
                  {x}
                </Link>
              );
            })}
          </nav>

          {/* Кнопки справа — вирівняні за висотою h-10 та радіусом rounded-xl */}
          <div className="flex w-full xl:w-auto justify-between xl:justify-end shrink-0 items-center gap-2.5">
            <button
              aria-label="Меню"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-black/30 text-stone-200 transition hover:bg-white/5 hover:text-white xl:hidden"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="flex items-center gap-2.5 ml-auto xl:ml-0">
              {user ? (
                <Link
                  onMouseEnter={warmProfileCache}
                  onClick={go("/profile")}
                  href="/profile"
                  className="hidden h-10 max-w-48 items-center gap-2.5 px-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-[13px] font-semibold text-[#dce5bd] transition hover:border-[#84955a]/60 hover:bg-white/[0.08] hover:text-white md:inline-flex"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="Steam avatar" className="h-6 w-6 shrink-0 rounded-full border border-[#82945b]" />
                  ) : (
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#82945b] text-xs font-bold text-black">
                      {user.name ? user.name[0] : "U"}
                    </span>
                  )}
                  <span className="truncate">{user.name || user.steamId}</span>
                </Link>
              ) : (
                <Link
                  onClick={go("/login")}
                  className="hidden h-10 min-w-28 px-4 whitespace-nowrap items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[13px] font-bold uppercase tracking-wider text-stone-200 transition hover:border-white/20 hover:bg-white/10 hover:text-white md:inline-flex"
                  href="/login"
                >
                  Увійти
                </Link>
              )}

              <Link
                onMouseEnter={user ? warmProfileCache : undefined}
                onClick={go(user ? "/profile" : "/login")}
                className="btn rounded-xl hidden !h-10 !min-h-10 min-w-28 !px-4 whitespace-nowrap text-[13px] sm:inline-flex items-center justify-center"
                href={user ? "/profile" : "/login"}
              >
                {user ? "Профіль" : "Steam Вхід"}
              </Link>

              <Link
                onClick={go("/checkout")}
                aria-label="Кошик"
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-[#d9e6b3] transition hover:border-[#84955a] hover:bg-white/10 hover:text-white"
                href="/checkout"
              >
                <ShoppingCart size={18} />
                {items.length > 0 && (
                  <b className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ember text-[11px] font-bold text-white shadow">
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
