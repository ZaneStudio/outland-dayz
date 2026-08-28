import { NextRequest, NextResponse } from "next/server";
import { currentAdmin } from "@/lib/admin";
import { deleteVipPlan, updateVipPlan } from "@/lib/vip-store";

function parse(body: Record<string, unknown>) {
  const price = Number(body.price);
  const duration = body.durationDays === null || body.durationDays === "" || body.durationDays === undefined ? null : Number(body.durationDays);
  const features = Array.isArray(body.features) ? body.features.map(String) : [];
  if (!String(body.name || "").trim() || !Number.isInteger(price) || price < 0 || (duration !== null && (!Number.isInteger(duration) || duration < 1))) return null;
  return { name: String(body.name).trim(), price, durationDays: duration, features, active: body.active !== false };
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 });
  const parsed = parse(await request.json());
  if (!parsed) return NextResponse.json({ error: "Перевірте дані VIP-пакета." }, { status: 400 });
  const { id } = await params;
  const plan = await updateVipPlan(id, parsed);
  return plan ? NextResponse.json(plan) : NextResponse.json({ error: "Пакет не знайдено" }, { status: 404 });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 });
  const { id } = await params;
  return await deleteVipPlan(id) ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Пакет не можна видалити: він уже призначений гравцеві." }, { status: 409 });
}
