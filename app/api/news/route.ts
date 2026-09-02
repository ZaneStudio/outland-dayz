import { NextRequest, NextResponse } from "next/server";
import { currentAdmin } from "@/lib/admin";
import { createManagedNews, getManagedNews } from "@/lib/news-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getManagedNews());
}

export async function POST(request: NextRequest) {
  if (!await currentAdmin()) {
    return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.title || !body.text || !body.date) {
      return NextResponse.json({ error: "Заповніть усі поля" }, { status: 400 });
    }

    const newsData: any = {
      title: String(body.title),
      text: String(body.text),
      date: String(body.date)
    };

    if (body.image) {
      newsData.image = String(body.image);
    }

    const newNews = await createManagedNews(newsData);

    return NextResponse.json(newNews, { status: 201 });
  } catch (error) {
    console.error("Error creating news:", error);
    return NextResponse.json({ error: "Не вдалося зберегти новину" }, { status: 500 });
  }
}