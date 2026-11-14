export type SteamUser = {
  steamId: string;
  name: string;
  avatar: string;
};

export type ProfileOrder = {
  id: string;
  code?: string;
  date: string;
  items: Array<{ id: string; name: string; price: number; image?: string }>;
  total: number;
};

export type CachedProfileData = {
  savedAt: number;
  user: SteamUser;
  balance: number;
  vipLabel: string;
  orders: ProfileOrder[];
};

const profileCacheKey = "outland_profile_cache_v1";
const userCacheKey = "outland_user";
const balanceCacheKey = "outland_user_balance";
const cacheLifetime = 10 * 60 * 1000; // 10 хвилин

let memoryProfile: CachedProfileData | null = null;
let memoryUser: SteamUser | null = null;
let activeProfileRequest: Promise<CachedProfileData | null> | null = null;

export function readCachedSessionUser(): SteamUser | null {
  if (memoryUser) return memoryUser;
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(userCacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SteamUser | null;
    if (parsed && typeof parsed.steamId === "string" && parsed.steamId) {
      memoryUser = parsed;
      return parsed;
    }
  } catch {
    // Ігноруємо помилки читання localStorage
  }
  return null;
}

export function saveCachedSessionUser(user: SteamUser | null) {
  memoryUser = user;
  if (typeof window === "undefined") return;

  try {
    if (user) {
      localStorage.setItem(userCacheKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(userCacheKey);
      localStorage.removeItem(profileCacheKey);
      memoryProfile = null;
    }
  } catch {
    // Ігноруємо помилки запису localStorage
  }
}

export function readCachedProfile(expectedSteamId?: string): CachedProfileData | null {
  if (memoryProfile) {
    if (!expectedSteamId || memoryProfile.user.steamId === expectedSteamId) {
      return memoryProfile;
    }
  }
  if (typeof window === "undefined") return null;

  try {
    const cached = JSON.parse(localStorage.getItem(profileCacheKey) || "null") as CachedProfileData | null;
    if (!cached || !cached.user?.steamId) return null;
    if (expectedSteamId && cached.user.steamId !== expectedSteamId) return null;
    if (Date.now() - cached.savedAt > cacheLifetime) return null;

    const savedBalance = localStorage.getItem(balanceCacheKey);
    if (savedBalance !== null && !Number.isNaN(Number(savedBalance))) {
      cached.balance = Number(savedBalance);
    }
    cached.vipLabel = "Відсутній";

    memoryProfile = cached;
    memoryUser = cached.user;
    return cached;
  } catch {
    return null;
  }
}

export function saveCachedProfile(profile: CachedProfileData) {
  memoryProfile = profile;
  memoryUser = profile.user;
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(profileCacheKey, JSON.stringify(profile));
    localStorage.setItem(userCacheKey, JSON.stringify(profile.user));
    localStorage.setItem(balanceCacheKey, String(profile.balance));
    localStorage.setItem("balance", String(profile.balance));
  } catch {
    // Кеш необов'язковий
  }
}

export function clearProfileCache() {
  memoryProfile = null;
  memoryUser = null;
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(profileCacheKey);
    localStorage.removeItem(userCacheKey);
  } catch {
    // Ігноруємо
  }
}

export function groupPurchasesToOrders(
  purchases: Array<{
    id: string;
    orderId?: string;
    productName: string;
    price: number;
    code?: string | null;
    createdAt?: string | Date;
  }>
): ProfileOrder[] {
  const grouped = new Map<string, ProfileOrder>();
  for (const item of purchases) {
    const id = item.orderId || item.id;
    const existing = grouped.get(id);
    const price = Number(item.price) || 0;
    const dateStr = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("uk-UA", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";
    if (existing) {
      existing.items.push({ id: item.id, name: item.productName, price });
      existing.total += price;
    } else {
      grouped.set(id, {
        id,
        code: item.code || undefined,
        date: dateStr,
        items: [{ id: item.id, name: item.productName, price }],
        total: price,
      });
    }
  }
  return Array.from(grouped.values());
}

export function refreshProfile(): Promise<CachedProfileData | null> {
  if (!activeProfileRequest) {
    activeProfileRequest = fetch("/api/launcher/profile?lite=1", { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401) {
          clearProfileCache();
          return null;
        }
        if (!res.ok) {
          throw new Error("Не вдалося завантажити профіль");
        }
        const data = await res.json();
        if (!data?.user?.steamId) return null;

        const existing = readCachedProfile(data.user.steamId);
        if (data.degraded && existing) {
          saveCachedSessionUser(data.user);
          return existing;
        }

        const fallbackBalance =
          typeof window !== "undefined" && localStorage.getItem(balanceCacheKey) !== null
            ? Number(localStorage.getItem(balanceCacheKey)) || 0
            : 0;

        const profile: CachedProfileData = {
          savedAt: Date.now(),
          user: data.user,
          balance: data.degraded
            ? fallbackBalance
            : typeof data?.account?.balance === "number"
              ? data.account.balance
              : 0,
          vipLabel: "Відсутній",
          orders: data.degraded
            ? existing?.orders || []
            : Array.isArray(data?.purchases)
              ? groupPurchasesToOrders(data.purchases)
              : [],
        };

        if (!data.degraded) {
          saveCachedProfile(profile);
        } else {
          saveCachedSessionUser(data.user);
        }
        return profile;
      })
      .finally(() => {
        activeProfileRequest = null;
      });
  }

  return activeProfileRequest;
}

export function warmProfileCache() {
  void refreshProfile().catch(() => undefined);
}
