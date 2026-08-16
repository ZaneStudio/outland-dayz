import { NextRequest, NextResponse } from "next/server";
import { currentAdmin } from "@/lib/admin";
import { deleteRoulettePrize, updateRoulettePrize } from "@/lib/roulette-store";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { if (!await currentAdmin()) return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 }); const { id } = await params; const body = await request.json(); const item = await updateRoulettePrize(id, { label: body.label ? String(body.label) : undefined, icon: body.icon ? String(body.icon) : undefined, image: typeof body.image === "string" ? body.image : undefined }); return item ? NextResponse.json(item) : NextResponse.json({ error: "Не знайдено" }, { status: 404 }); }
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) { if (!await currentAdmin()) return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 }); const { id } = await params; return await deleteRoulettePrize(id) ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Не знайдено" }, { status: 404 }); }
