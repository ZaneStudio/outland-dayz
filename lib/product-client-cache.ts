import type { Product } from "@/lib/data";

const cacheKey = "outland_products_cache_v1";
const cacheLifetime = 10 * 60 * 1000;

type CachedProducts = { savedAt: number; products: Product[] };

let activeRequest: Promise<Product[]> | null = null;

export function readCachedProducts(): Product[] | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || "null") as CachedProducts | null;
    if (!cached || !Array.isArray(cached.products) || Date.now() - cached.savedAt > cacheLifetime) return null;
    return cached.products;
  } catch {
    return null;
  }
}

function saveProducts(products: Product[]) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), products } satisfies CachedProducts));
  } catch {
    // Кеш необов'язковий: магазин працює і коли сховище браузера недоступне.
  }
}

export function refreshProducts(): Promise<Product[]> {
  if (!activeRequest) {
    activeRequest = fetch("/api/products")
      .then(async (response) => {
        if (!response.ok) throw new Error("Не вдалося завантажити товари");
        const products = await response.json() as Product[];
        saveProducts(products);
        return products;
      })
      .finally(() => {
        activeRequest = null;
      });
  }

  return activeRequest;
}

export function warmProductsCache() {
  void refreshProducts().catch(() => undefined);
}
