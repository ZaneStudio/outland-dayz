import { NextResponse } from "next/server";
import { getSteamSession } from "@/lib/steam-auth";
import { getBalance } from "@/lib/balance-store";
export const dynamic="force-dynamic";
export async function GET(){const user=await getSteamSession();if(!user)return NextResponse.json({error:"Увійдіть через Steam"},{status:401});return NextResponse.json(await getBalance(user.steamId));}
