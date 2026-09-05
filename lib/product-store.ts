import { randomUUID } from "crypto"; 
import { db } from "@/lib/db";

export type ManagedProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  classname?: string;
  popular: number;
  createdAt: string;
};

export async function getManagedProducts(): Promise<ManagedProduct[]> {
  try {
    const products = await db.managedProduct.findMany({ orderBy: { createdAt: "desc" } });
    return products.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
      classname: p.classname || "",
      popular: p.popular || 0,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()
    }));
  } catch (e) {
    console.error("getManagedProducts error:", e);
    return [];
  }
}

export async function createManagedProduct(input: Omit<ManagedProduct, "id" | "popular" | "createdAt">): Promise<ManagedProduct> {
  let created: any;
  
  try {
    // Спроба 1: Зберігаємо всі дані включно з classname
    const dataWithClassname: any = { 
      id: randomUUID(),
      name: input.name,
      description: input.description,
      price: input.price,
      category: input.category,
      image: input.image,
      classname: input.classname || "",
      popular: 0
    };
    created = await db.managedProduct.create({ data: dataWithClassname });
  } catch (err) {
    // Спроба 2: Якщо Prisma видає помилку, зберігаємо БЕЗ classname
    console.warn("Prisma client block, using safe fallback:", err);
    const safeData: any = { 
      id: randomUUID(),
      name: input.name,
      description: input.description,
      price: input.price,
      category: input.category,
      image: input.image,
      popular: 0
    };
    created = await db.managedProduct.create({ data: safeData });
  }

  return {
    id: created.id,
    name: created.name,
    description: created.description,
    price: created.price,
    category: created.category,
    image: created.image,
    classname: created.classname || input.classname || "",
    popular: created.popular || 0,
    createdAt: created.createdAt ? new Date(created.createdAt).toISOString() : new Date().toISOString()
  };
}

export async function updateManagedProduct(id: string, input: Partial<Omit<ManagedProduct, "id" | "createdAt">>) {
  let updated: any;
  
  try {
    const updateData: any = { ...input };
    updated = await db.managedProduct.update({ where: { id }, data: updateData });
  } catch (err) {
    console.warn("Prisma client block on update, using safe fallback:", err);
    const safeUpdateData: any = { ...input };
    delete safeUpdateData.classname; // Видаляємо проблемне поле перед оновленням
    updated = await db.managedProduct.update({ where: { id }, data: safeUpdateData });
  }

  return {
    id: updated.id,
    name: updated.name,
    description: updated.description,
    price: updated.price,
    category: updated.category,
    image: updated.image,
    classname: updated.classname || input.classname || "",
    popular: updated.popular || 0,
    createdAt: updated.createdAt ? new Date(updated.createdAt).toISOString() : new Date().toISOString()
  };
}

export async function deleteManagedProduct(id: string) {
  try {
    await db.managedProduct.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}