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
  imgScale?: number;
  imgX?: number;
  imgY?: number;
  popular: number;
  createdAt: string;
};

async function ensureColumnExists() {
  try {
    await db.$executeRawUnsafe(`ALTER TABLE "ManagedProduct" ADD COLUMN IF NOT EXISTS classname TEXT;`);
    await db.$executeRawUnsafe(`ALTER TABLE "ManagedProduct" ADD COLUMN IF NOT EXISTS "imgScale" DOUBLE PRECISION DEFAULT 1;`);
    await db.$executeRawUnsafe(`ALTER TABLE "ManagedProduct" ADD COLUMN IF NOT EXISTS "imgX" DOUBLE PRECISION DEFAULT 0;`);
    await db.$executeRawUnsafe(`ALTER TABLE "ManagedProduct" ADD COLUMN IF NOT EXISTS "imgY" DOUBLE PRECISION DEFAULT 0;`);
  } catch (e) {
    console.error("ensureColumnExists warning:", e);
  }
}

export async function getManagedProducts(): Promise<ManagedProduct[]> {
  try {
    await ensureColumnExists();
    const products: any[] = await db.$queryRaw`SELECT * FROM "ManagedProduct" ORDER BY "createdAt" DESC`;
    
    return products.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
      classname: p.classname || "",
      imgScale: p.imgScale ?? 1,
      imgX: p.imgX ?? 0,
      imgY: p.imgY ?? 0,
      popular: p.popular || 0,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()
    }));
  } catch (e) {
    console.error("getManagedProducts error:", e);
    return [];
  }
}

export async function createManagedProduct(input: Omit<ManagedProduct, "id" | "popular" | "createdAt">): Promise<ManagedProduct> {
  await ensureColumnExists();
  const id = randomUUID();
  const classname = input.classname || "";
  const imgScale = input.imgScale ?? 1;
  const imgX = input.imgX ?? 0;
  const imgY = input.imgY ?? 0;
  
  try {
    await db.$executeRaw`
      INSERT INTO "ManagedProduct" (id, name, description, price, category, image, classname, "imgScale", "imgX", "imgY", popular, "createdAt")
      VALUES (${id}, ${input.name}, ${input.description}, ${input.price}, ${input.category}, ${input.image}, ${classname}, ${imgScale}, ${imgX}, ${imgY}, 0, NOW())
    `;
  } catch (e) {
    console.error("Create error:", e);
  }

  return {
    id,
    name: input.name,
    description: input.description,
    price: input.price,
    category: input.category,
    image: input.image,
    classname,
    imgScale,
    imgX,
    imgY,
    popular: 0,
    createdAt: new Date().toISOString()
  };
}

export async function updateManagedProduct(id: string, input: Partial<Omit<ManagedProduct, "id" | "createdAt">>) {
  await ensureColumnExists();
  try {
    if (input.classname !== undefined) {
      await db.$executeRaw`UPDATE "ManagedProduct" SET classname = ${input.classname} WHERE id = ${id}`;
    }
    if (input.name !== undefined) await db.$executeRaw`UPDATE "ManagedProduct" SET name = ${input.name} WHERE id = ${id}`;
    if (input.description !== undefined) await db.$executeRaw`UPDATE "ManagedProduct" SET description = ${input.description} WHERE id = ${id}`;
    if (input.price !== undefined) await db.$executeRaw`UPDATE "ManagedProduct" SET price = ${input.price} WHERE id = ${id}`;
    if (input.category !== undefined) await db.$executeRaw`UPDATE "ManagedProduct" SET category = ${input.category} WHERE id = ${id}`;
    if (input.image !== undefined) await db.$executeRaw`UPDATE "ManagedProduct" SET image = ${input.image} WHERE id = ${id}`;
    if (input.imgScale !== undefined) await db.$executeRaw`UPDATE "ManagedProduct" SET "imgScale" = ${input.imgScale} WHERE id = ${id}`;
    if (input.imgX !== undefined) await db.$executeRaw`UPDATE "ManagedProduct" SET "imgX" = ${input.imgX} WHERE id = ${id}`;
    if (input.imgY !== undefined) await db.$executeRaw`UPDATE "ManagedProduct" SET "imgY" = ${input.imgY} WHERE id = ${id}`;
  } catch (e) {
    console.error("Update error:", e);
  }

  const updatedList = await getManagedProducts();
  const current = updatedList.find(p => p.id === id);
  
  return current || { id, ...input } as any;
}

export async function deleteManagedProduct(id: string) {
  try {
    await db.$executeRaw`DELETE FROM "ManagedProduct" WHERE id = ${id}`;
    return true;
  } catch {
    return false;
  }
}