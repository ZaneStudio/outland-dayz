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
  const id = randomUUID();
  const classname = input.classname || "";
  
  try {
    // Використовуємо прямий SQL, щоб класнейм гарантовано записався
    await db.$executeRaw`
      INSERT INTO "ManagedProduct" (id, name, description, price, category, image, classname, popular, "createdAt")
      VALUES (${id}, ${input.name}, ${input.description}, ${input.price}, ${input.category}, ${input.image}, ${classname}, 0, NOW())
    `;
  } catch (err) {
    console.warn("Raw SQL create fallback:", err);
    // Запасний варіант через звичайний Prisma create без classname якщо таблиця ще стара
    await db.managedProduct.create({
      data: {
        id,
        name: input.name,
        description: input.description,
        price: Number(input.price),
        category: input.category,
        image: input.image,
        popular: 0
      }
    });
  }

  return {
    id,
    name: input.name,
    description: input.description,
    price: input.price,
    category: input.category,
    image: input.image,
    classname: classname,
    popular: 0,
    createdAt: new Date().toISOString()
  };
}

export async function updateManagedProduct(id: string, input: Partial<Omit<ManagedProduct, "id" | "createdAt">>) {
  try {
    // Збираємо дані для прямого оновлення через SQL
    const name = input.name;
    const description = input.description;
    const price = input.price !== undefined ? Number(input.price) : undefined;
    const category = input.category;
    const image = input.image;
    const classname = input.classname;

    // Оновлюємо кожне передане поле через SQL, щоб гарантовано оновити classname
    if (classname !== undefined) {
      await db.$executeRaw`UPDATE "ManagedProduct" SET classname = ${classname} WHERE id = ${id}`;
    }
    if (name !== undefined) {
      await db.$executeRaw`UPDATE "ManagedProduct" SET name = ${name} WHERE id = ${id}`;
    }
    if (description !== undefined) {
      await db.$executeRaw`UPDATE "ManagedProduct" SET description = ${description} WHERE id = ${id}`;
    }
    if (price !== undefined) {
      await db.$executeRaw`UPDATE "ManagedProduct" SET price = ${price} WHERE id = ${id}`;
    }
    if (category !== undefined) {
      await db.$executeRaw`UPDATE "ManagedProduct" SET category = ${category} WHERE id = ${id}`;
    }
    if (image !== undefined) {
      await db.$executeRaw`UPDATE "ManagedProduct" SET image = ${image} WHERE id = ${id}`;
    }

  } catch (err) {
    console.warn("Raw SQL update error, falling back to standard prisma:", err);
    try {
      const updateData: any = { ...input };
      delete updateData.classname;
      await db.managedProduct.update({ where: { id }, data: updateData });
    } catch (innerErr) {
      console.error("Fallback update failed:", innerErr);
    }
  }

  // Повертаємо оновлений товар із бази
  const updatedList = await getManagedProducts();
  const current = updatedList.find(p => p.id === id);
  
  return current || {
    id,
    name: input.name || "",
    description: input.description || "",
    price: input.price || 0,
    category: input.category || "",
    image: input.image || "",
    classname: input.classname || "",
    popular: 0,
    createdAt: new Date().toISOString()
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