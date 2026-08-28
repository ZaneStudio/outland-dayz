import { NextRequest, NextResponse } from "next/server";
import { currentAdmin } from "@/lib/admin";
import { createVipPlan, getVipPlans } from "@/lib/vip-store";

export const dynamic = "force-dynamic";

function parse(body: Record<string, unknown>) {
  const price = Number(body.price);
  const duration = body.durationDays === null || body.durationDays === "" || body.durationDays === undefined ? null : Number(body.durationDays);
  const features = Array.isArray(body.features) ? body.features.map(String) : [];
  if (!String(body.name || "").trim() || !Number.isInteger(price) || price < 0 || (duration !== null && (!Number.isInteger(duration) || duration < 1))) return null;
  return { name: String(body.name).trim(), price, durationDays: duration, features, active: body.active !== false };
}

export async function GET() {
  if (!await currentAdmin()) return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 });
  return NextResponse.json(await getVipPlans(true));
}

export async function POST(request: NextRequest) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 });
  const parsed = parse(await request.json());
  if (!parsed) return NextResponse.json({ error: "Перевірте назву, ціну та строк VIP." }, { status: 400 });
  return NextResponse.json(await createVipPlan(parsed), { status: 201 });
}
