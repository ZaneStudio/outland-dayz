import { NextRequest, NextResponse } from "next/server";
import { updateManagedProduct, deleteManagedProduct } from "@/lib/product-store";
import { currentAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 });
  
  const { id } = await context.params;
  const body = await request.json();
  
  const updateData: any = {};
  if (body.name !== undefined) updateData.name = String(body.name);
  if (body.description !== undefined) updateData.description = String(body.description);
  if (body.category !== undefined) updateData.category = String(body.category);
  if (body.price !== undefined) updateData.price = Number(body.price);
  if (body.image !== undefined) updateData.image = String(body.image);
  if (body.classname !== undefined) updateData.classname = String(body.classname);
  
  // Додано збереження налаштувань позиціонування та масштабу фото
  if (body.imgScale !== undefined) updateData.imgScale = Number(body.imgScale);
  if (body.imgX !== undefined) updateData.imgX = Number(body.imgX);
  if (body.imgY !== undefined) updateData.imgY = Number(body.imgY);

  const updatedProduct = await updateManagedProduct(id, updateData);
  
  return NextResponse.json(updatedProduct);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 });
  
  const { id } = await context.params;
  await deleteManagedProduct(id);
  return NextResponse.json({ success: true });
}