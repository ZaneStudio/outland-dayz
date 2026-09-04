import { randomUUID } from "crypto"; 
import { db } from "@/lib/db";

export type ManagedProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  classname: string;
  popular: number;
  createdAt: string;
};

const map = (p: {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  classname: string | null;
  popular: number;
  createdAt: Date;
}): ManagedProduct => ({
  ...p,
  classname: p.classname || "",
  createdAt: p.createdAt.toISOString()
});

export async function getManagedProducts() {
  return (await db.managedProduct.findMany({ orderBy: { createdAt: "desc" } })).map(map);
}

export async function createManagedProduct(input: Omit<ManagedProduct, "id" | "popular" | "createdAt">) {
  return map(await db.managedProduct.create({ data: { ...input, id: randomUUID() } }));
}

export async function updateManagedProduct(id: string, input: Partial<Omit<ManagedProduct, "id" | "createdAt">>) {
  try {
    return map(await db.managedProduct.update({ where: { id }, data: input }));
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