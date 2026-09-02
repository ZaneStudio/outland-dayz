import { NextRequest, NextResponse } from "next/server";
import { currentAdmin } from "@/lib/admin";
import { createManagedNews, getManagedNews } from "@/lib/news-store";
import { writeFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getManagedNews());
}

export async function POST(request: NextRequest) {
  if (!await currentAdmin()) {
    return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get("title");
    const text = formData.get("text");
    const date = formData.get("date");
    const imageFile = formData.get("image") as File | null;

    if (!title || !text || !date) {
      return NextResponse.json({ error: "Заповніть усі поля" }, { status: 400 });
    }

    let imagePath = "";

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const filename = `${Date.now()}-${imageFile.name.replace(/\s/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      await writeFile(path.join(uploadDir, filename), buffer);
      imagePath = `/uploads/${filename}`;
    }

    // Передаємо об'єкт так, як очікує сховище (з прописом image, якщо воно там підтримується)
    const newsData: any = {
      title: String(title),
      text: String(text),
      date: String(date)
    };

    if (imagePath) {
      newsData.image = imagePath;
    }

    const newNews = await createManagedNews(newsData);

    return NextResponse.json(newNews, { status: 201 });
  } catch (error) {
    console.error("Error creating news:", error);
    return NextResponse.json({ error: "Не вдалося зберегти новину" }, { status: 500 });
  }
}