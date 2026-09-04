import { NextRequest, NextResponse } from "next/server";
import { getSteamSession } from "@/lib/steam-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getSteamSession();
  if (!user) return NextResponse.json({ error: "Увійдіть через Steam" }, { status: 401 });

  try {
    const { orderId, code, items } = await req.json();
    if (!code || !items) {
      return NextResponse.json({ error: "Невірні дані замовлення" }, { status: 400 });
    }

    const apiKey = process.env.PTERODACTYL_API_KEY;
    const serverId = process.env.PTERODACTYL_SERVER_ID;

    if (!apiKey || !serverId) {
      console.error("Pterodactyl credentials are missing");
      return NextResponse.json({ success: true, warning: "Замовлення оформлено, але хостинг не налаштовано" });
    }

    // Формуємо нагороди у форматі, який вимагає твій мод (як на твоєму прикладі)
    const rewards = items.flatMap((item: any) => {
      // Кількість предметів у замовленні (якщо є quantity або за замовчуванням 1)
      const count = item.quantity || 1;
      const rewardList = [];

      for (let i = 0; i < count; i++) {
        rewardList.push({
          isVehicle: 0,
          Classname: item.id, // Тут іде унікальний клас предмета в DayZ (наприклад, "WoodenLog", "Бочка" тощо — важливо щоб item.id відповідав класнейму)
          QuantityPercent: -1,
          HealthPercent: -1,
          Attachments: []
        });
      }
      return rewardList;
    });

    const fileContent = JSON.stringify({
      maxUsages: 1,
      currentUsages: 0,
      blacklistedSteamIDS: [],
      rewards: rewards
    }, null, 2);

    const fileName = `${code}.json`;
    const directory = "/profiles/FT_Mods/Promocodes_Free/Codes";

    // Отримуємо URL для завантаження через Pterodactyl API
    const uploadUrlRes = await fetch(`https://console.uahost.eu/api/client/servers/${serverId}/files/upload`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      }
    });

    if (uploadUrlRes.ok) {
      const uploadData = await uploadUrlRes.json();
      const signedUrl = uploadData.attributes.url;

      const formData = new FormData();
      const blob = new Blob([fileContent], { type: "application/json" });
      formData.append("files", blob, fileName);

      await fetch(`${signedUrl}&directory=${encodeURIComponent(directory)}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`
        },
        body: formData
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order creation API error:", error);
    return NextResponse.json({ error: "Помилка створення замовлення" }, { status: 500 });
  }
}