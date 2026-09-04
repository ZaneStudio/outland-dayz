import { NextRequest, NextResponse } from "next/server";
import { getSteamSession } from "@/lib/steam-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getSteamSession();
  if (!user) return NextResponse.json({ error: "Увійдіть через Steam" }, { status: 401 });

  try {
    const { orderId, code, items } = await req.json();
    console.log("--> Створення замовлення:", orderId, code);

    const apiKey = process.env.PTERODACTYL_API_KEY;
    const serverId = process.env.PTERODACTYL_SERVER_ID;

    if (!apiKey || !serverId) {
      console.error("--> ПОМИЛКА: Не задано PTERODACTYL_API_KEY або PTERODACTYL_SERVER_ID у змінних середовища Render!");
      return NextResponse.json({ success: true, warning: "Хостинг не налаштовано" });
    }

    const rewards = items.flatMap((item: any) => {
      const count = item.quantity || 1;
      const rewardList = [];
      for (let i = 0; i < count; i++) {
        rewardList.push({
          isVehicle: 0,
          Classname: item.id,
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

    console.log("--> Запит на отримання upload URL від Pterodactyl...");
    const uploadUrlRes = await fetch(`https://console.uahost.eu/api/client/servers/${serverId}/files/upload`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      }
    });

    console.log("--> Статус відповіді upload URL:", uploadUrlRes.status);

    if (!uploadUrlRes.ok) {
      const errText = await uploadUrlRes.text();
      console.error("--> ПОМИЛКА Pterodactyl Upload URL:", errText);
      return NextResponse.json({ error: "Помилка зв'язку з хостингом" }, { status: 500 });
    }

    const uploadData = await uploadUrlRes.json();
    const signedUrl = uploadData.attributes.url;

    const formData = new FormData();
    const blob = new Blob([fileContent], { type: "application/json" });
    formData.append("files", blob, fileName);

    console.log("--> Відправка файлу на хостинг...");
    const uploadRes = await fetch(`${signedUrl}&directory=${encodeURIComponent(directory)}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      },
      body: formData
    });

    console.log("--> Статус завантаження файлу:", uploadRes.status);

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("--> ПОМИЛКА завантаження файлу на хостинг:", errText);
      return NextResponse.json({ error: "Помилка збереження файлу" }, { status: 500 });
    }

    console.log("--> Файл успішно створено на ігровому сервері!");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("--> КРИТИЧНА ПОМИЛКА в API створення замовлення:", error);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}