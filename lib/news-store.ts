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

const map = (item: { id: string; slug: string; title: string; text: string; date: string; image?: string | null; createdAt: Date }): ManagedNews => ({
  ...item,
  image: item.image ?? null,
  createdAt: item.createdAt.toISOString()
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || randomUUID();

export async function getManagedNews(): Promise<ManagedNews[]> {
  const items = await db.managedNews.findMany({ orderBy: { createdAt: "desc" } });
  return items.map(map);
}

export async function createManagedNews(input: { title: string; text: string; date: string; image?: string }) {
  const base = slugify(input.title);
  const created = await db.managedNews.create({
    data: {
      id: randomUUID(),
      slug: `${base}-${Date.now().toString().slice(-5)}`,
      title: input.title,
      text: input.text,
      date: input.date,
      image: input.image || null
    }
  });
  return map(created);
}

export async function updateManagedNews(id: string, input: Partial<{ title: string; text: string; date: string; image: string }>) {
  try {
    const updated = await db.managedNews.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.text && { text: input.text }),
        ...(input.date && { date: input.date }),
        ...(input.image !== undefined && { image: input.image })
      }
    });
    return map(updated);
  } catch {
    return null;
  }
}

export async function deleteManagedNews(id: string) {
  try {
    await db.managedNews.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}