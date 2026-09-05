import { NextRequest, NextResponse } from "next/server";
import { getSteamSession } from "@/lib/steam-auth";
import { getManagedProducts } from "@/lib/product-store";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getSteamSession();
  if (!user) return NextResponse.json({ error: "Увійдіть через Steam" }, { status: 401 });

  try {
    const body = await req.json();
    const items = body.items;
    
    if (!items) {
      return NextResponse.json({ error: "Невірні дані замовлення" }, { status: 400 });
    }

    // Генеруємо код у точно такому ж форматі, як на хостингу: OUT-XXXX-XXXX
    const part1 = randomBytes(2).toString("hex").toUpperCase();
    const part2 = randomBytes(2).toString("hex").toUpperCase();
    const code = body.code && body.code.startsWith("OUT-") ? body.code : `OUT-${part1}-${part2}`;

    const apiKey = process.env.PTERODACTYL_API_KEY;
    const serverId = process.env.PTERODACTYL_SERVER_ID;

    if (!apiKey || !serverId) {
      console.error("Pterodactyl credentials are missing");
      return NextResponse.json({ success: true, warning: "Хостинг не налаштовано", code });
    }

    const allProducts = await getManagedProducts();
    const rewards = [];

    for (const item of items) {
      const count = item.quantity || 1;
      const dbProduct = allProducts.find(p => p.id === item.id);
      
      const gameClassname = (dbProduct && dbProduct.classname && dbProduct.classname.trim() !== "") 
        ? dbProduct.classname 
        : item.name;

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

    const fileName = `${code}.json`;
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

    return NextResponse.json({ success: true, code });
  } catch (error) {
    console.error("Order creation API error:", error);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}