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
}

export async function createManagedProduct(input: Omit<ManagedProduct, "id" | "popular" | "createdAt">): Promise<ManagedProduct> {
  const created = await db.managedProduct.create({ 
    data: { 
      ...input, 
      id: randomUUID(),
      classname: input.classname || "",
      popular: 0
    } 
  });
  const p: any = created;
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    image: p.image,
    classname: p.classname || "",
    popular: p.popular || 0,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()
  };
}

export async function updateManagedProduct(id: string, input: Partial<Omit<ManagedProduct, "id" | "createdAt">>) {
  try {
    const updated = await db.managedProduct.update({ where: { id }, data: input });
    const p: any = updated;
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
      classname: p.classname || "",
      popular: p.popular || 0,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()
    };
  } catch {
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