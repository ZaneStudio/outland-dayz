import { NextRequest, NextResponse } from "next/server";
import { currentAdmin } from "@/lib/admin";
import { createRoulettePrize, getRoulettePrizes } from "@/lib/roulette-store";

export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(await getRoulettePrizes()); }
export async function POST(request: NextRequest) { if (!await currentAdmin()) return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 }); const body = await request.json(); if (!body.label || !body.icon) return NextResponse.json({ error: "Заповніть усі поля" }, { status: 400 }); return NextResponse.json(await createRoulettePrize({ label: String(body.label), icon: String(body.icon), image: body.image ? String(body.image) : undefined }), { status: 201 }); }
