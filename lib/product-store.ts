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
  // Використовуємо 'any', щоб обійти сувору перевірку типів Prisma перед міграцією
  const createData: any = { 
    id: randomUUID(),
    name: input.name,
    description: input.description,
    price: input.price,
    category: input.category,
    image: input.image,
    classname: input.classname || "",
    popular: 0
  };

  const created: any = await db.managedProduct.create({ data: createData });

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
  try {
    const updateData: any = { ...input };
    const updated: any = await db.managedProduct.update({ where: { id }, data: updateData });
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
  } catch (e) {
    console.error("updateManagedProduct error:", e);
    return null;
  }
}

export async function deleteManagedProduct(id: string) {
  try {
    await db.managedProduct.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}