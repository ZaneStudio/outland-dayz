import type { Product } from "@/lib/data";

const cacheKey = "outland_products_cache_v2";
const legacyCacheKey = "outland_products_cache_v1";
const cacheLifetime = 30 * 60 * 1000; // 30 хвилин

type CachedProducts = { savedAt: number; products: Product[] };

let memoryProducts: Product[] | null = null;
let memorySavedAt = 0;
let activeRequest: Promise<Product[]> | null = null;
const preloadedImages = new Set<string>();

function preloadProductImages(products: Product[]) {
  if (typeof window === "undefined") return;
  for (const product of products) {
    if (!product.image || preloadedImages.has(product.image)) continue;
    preloadedImages.add(product.image);
    const img = new window.Image();
    img.decoding = "async";
    img.src = product.image;
  }
}

export function readCachedProducts(): Product[] | null {
  if (memoryProducts && Date.now() - memorySavedAt <= cacheLifetime) {
    return memoryProducts;
  }
  if (typeof window === "undefined") return null;

  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || "null") as CachedProducts | null;
    if (!cached || !Array.isArray(cached.products) || Date.now() - cached.savedAt > cacheLifetime) {
      return memoryProducts;
    }
    memoryProducts = cached.products;
    memorySavedAt = cached.savedAt;
    preloadProductImages(cached.products);
    return cached.products;
  } catch {
    return memoryProducts;
  }
}

export function saveProductsCache(products: Product[]) {
  memoryProducts = products;
  memorySavedAt = Date.now();
  preloadProductImages(products);

  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(legacyCacheKey);
    localStorage.setItem(cacheKey, JSON.stringify({ savedAt: memorySavedAt, products } satisfies CachedProducts));
  } catch {
    // Якщо сховище браузера переповнене або недоступне, працює кеш у пам'яті.
  }
}

export function refreshProducts(force = false): Promise<Product[]> {
  if (!activeRequest) {
    activeRequest = fetch(force ? `/api/products?t=${Date.now()}` : "/api/products")
      .then(async (response) => {
        if (!response.ok) throw new Error("Не вдалося завантажити товари");
        const products = (await response.json()) as Product[];
        saveProductsCache(products);
        return products;
      })
      .finally(() => {
        activeRequest = null;
      });
  }

  return activeRequest;
}

export function warmProductsCache() {
  const cached = readCachedProducts();
  if (cached) {
    preloadProductImages(cached);
  }
  void refreshProducts().catch(() => undefined);
}
