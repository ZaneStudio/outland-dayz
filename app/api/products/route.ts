import { NextRequest, NextResponse } from "next/server"; 
import { createManagedProduct, getManagedProducts } from "@/lib/product-store"; 
import { currentAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(){
  const products = await getManagedProducts();
  return NextResponse.json(products.map(p => ({
    ...p,
    image: p.image.startsWith('/uploads/') ? p.image.replace('/uploads/', '/api/uploads/') : p.image,
    imgScale: p.imgScale ?? 1,
    imgX: p.imgX ?? 0,
    imgY: p.imgY ?? 0
  })));
}

export async function POST(request: NextRequest){
  if (!await currentAdmin()) return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 });
  
  const body = await request.json();
  
  if (!body.name || !body.description || !body.category || !Number.isFinite(Number(body.price))) {
    return NextResponse.json({ error: "Заповніть усі поля" }, { status: 400 });
  }

  const newProduct = await createManagedProduct({
    name: String(body.name),
    description: String(body.description),
    category: String(body.category),
    price: Number(body.price),
    image: String(body.image || "/images/outland-hero.png"),
    classname: String(body.classname || ""),
    imgScale: Number(body.imgScale ?? 1),
    imgX: Number(body.imgX ?? 0),
    imgY: Number(body.imgY ?? 0)
  });

  return NextResponse.json(newProduct, { status: 201 });
}