import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "Не вказано товар" }, { status: 400 });
    }

    // Знаходимо товар у базі ManagedProduct
    const products: any[] = await db.$queryRaw`SELECT * FROM "ManagedProduct" WHERE id = ${productId}`;
    const product = products[0];

    if (!product) {
      return NextResponse.json({ error: "Товар не знайдено" }, { status: 404 });
    }

    // Генеруємо унікальний ігровий код для видачі модом
    const randomCode = `OUT-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Повертаємо успішну відповідь із ціною, назвою та кодом
    return NextResponse.json({ 
      success: true, 
      code: randomCode,
      item: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      }
    });
  } catch (err) {
    console.error("Shop buy error:", err);
    return NextResponse.json({ error: "Помилка сервера при покупці" }, { status: 500 });
  }
}