import { NextRequest, NextResponse } from "next/server";
import { getSteamSession } from "@/lib/steam-auth";
import { db } from "@/lib/db";

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
      return NextResponse.json({ success: true, warning: "Хостинг не налаштовано" });
    }

    const rewards = [];

    for (const item of items) {
      const count = item.quantity || 1;
      
      // Шукаємо товар у базі даних, щоб взяти класнейм, вказаний в адмінці
      const dbProduct = await db.managedProduct.findUnique({ where: { id: item.id } });
      const gameClassname = dbProduct?.classname || item.id;

      for (let i = 0; i < count; i++) {
        rewards.push({
          isVehicle: 0,
          Classname: gameClassname,
          QuantityPercent: -1,
          HealthPercent: -1,
          Attachments: []
        });
      }
    }

    const fileContent = JSON.stringify({
      maxUsages: 1,
      currentUsages: 0,
      blacklistedSteamIDS: [],
      rewards: rewards
    }, null, 2);

    const cleanCode = code.replace(/-/g, "");
    const fileName = `${cleanCode}.json`;
    const directory = "/profiles/FT_Mods/Promocodes_Free/Codes";

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
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}