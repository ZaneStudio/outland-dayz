import { NextRequest, NextResponse } from "next/server";
import { updateManagedProduct, deleteManagedProduct } from "@/lib/product-store";
import { currentAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 });
  
  const body = await request.json();
  
  // Збираємо дані для оновлення, включаючи classname
  const updateData: any = {};
  if (body.name !== undefined) updateData.name = String(body.name);
  if (body.description !== undefined) updateData.description = String(body.description);
  if (body.category !== undefined) updateData.category = String(body.category);
  if (body.price !== undefined) updateData.price = Number(body.price);
  if (body.image !== undefined) updateData.image = String(body.image);
  if (body.classname !== undefined) updateData.classname = String(body.classname);

  const updatedProduct = await updateManagedProduct(params.id, updateData);
  
  return NextResponse.json(updatedProduct);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 });
  
  await deleteManagedProduct(params.id);
  return NextResponse.json({ success: true });
}