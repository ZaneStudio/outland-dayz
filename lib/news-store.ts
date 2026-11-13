import { randomUUID } from "crypto";
import { db } from "@/lib/db";

export type ManagedNews = {
  id: string;
  slug: string;
  title: string;
  text: string;
  date: string;
  image?: string | null;
  createdAt: string;
};

const NEWS_CACHE_TTL_MS = 60 * 1000;

let cachedNews: ManagedNews[] | null = null;
let cachedAt = 0;
let activeFetch: Promise<ManagedNews[]> | null = null;

const map = (item: {
  id: string;
  slug: string;
  title: string;
  text: string;
  date: string;
  image?: string | null;
  createdAt: Date;
}): ManagedNews => ({
  ...item,
  image: item.image ?? null,
  createdAt: item.createdAt.toISOString(),
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || randomUUID();

async function fetchNewsFromDb(): Promise<ManagedNews[]> {
  if (!activeFetch) {
    activeFetch = (async () => {
      try {
        const items = await db.managedNews.findMany({ orderBy: { createdAt: "desc" } });
        const mapped = items.map(map);
        cachedNews = mapped;
        cachedAt = Date.now();
        return mapped;
      } catch (e) {
        console.error("getManagedNews error:", e);
        return cachedNews ?? [];
      } finally {
        activeFetch = null;
      }
    })();
  }
  return activeFetch;
}

export async function getManagedNews(forceRefresh = false): Promise<ManagedNews[]> {
  if (!forceRefresh && cachedNews) {
    if (Date.now() - cachedAt > NEWS_CACHE_TTL_MS) {
      void fetchNewsFromDb();
    }
    return cachedNews;
  }
  return fetchNewsFromDb();
}

void fetchNewsFromDb();

export async function createManagedNews(input: { title: string; text: string; date: string; image?: string }) {
  const base = slugify(input.title);
  const created = await db.managedNews.create({
    data: {
      id: randomUUID(),
      slug: `${base}-${Date.now().toString().slice(-5)}`,
      title: input.title,
      text: input.text,
      date: input.date,
      image: input.image || null,
    },
  });
  const mapped = map(created);
  if (cachedNews) {
    cachedNews = [mapped, ...cachedNews];
    cachedAt = Date.now();
  } else {
    void fetchNewsFromDb();
  }
  return mapped;
}

export async function updateManagedNews(
  id: string,
  input: Partial<{ title: string; text: string; date: string; image: string }>
) {
  try {
    const updated = await db.managedNews.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.text && { text: input.text }),
        ...(input.date && { date: input.date }),
        ...(input.image !== undefined && { image: input.image }),
      },
    });
    const mapped = map(updated);
    if (cachedNews) {
      cachedNews = cachedNews.map((item) => (item.id === id ? mapped : item));
      cachedAt = Date.now();
    }
    return mapped;
  } catch {
    return null;
  }
}

export async function deleteManagedNews(id: string) {
  try {
    await db.managedNews.delete({ where: { id } });
    if (cachedNews) {
      cachedNews = cachedNews.filter((item) => item.id !== id);
      cachedAt = Date.now();
    }
    return true;
  } catch {
    return false;
  }
}
