import { NextRequest, NextResponse } from "next/server"; 
import { currentAdmin } from "@/lib/admin";

export async function POST(request: NextRequest) {
  if (!await currentAdmin()) {
    return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 });
  }

  const form = await request.formData();
  const image = form.get("image");

  if (!(image instanceof File) || !image.type.startsWith("image/") || image.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Оберіть зображення до 5 МБ" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await image.arrayBuffer());
    const base64Image = `data:${image.type};base64,${buffer.toString("base64")}`;

    return NextResponse.json({ url: base64Image }, { status: 201 });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Помилка обробки зображення" }, { status: 500 });
  }
}