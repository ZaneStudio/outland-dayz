import { NextRequest, NextResponse } from "next/server";
import { getSteamSession } from "@/lib/steam-auth";
const jarUrl="https://send.monobank.ua/jar/3UQUKK7EN8";
export async function POST(request:NextRequest){const user=await getSteamSession();if(!user)return NextResponse.json({error:"Увійдіть через Steam"},{status:401});const {amount}=await request.json();const value=Number(amount);if(!Number.isInteger(value)||value<1||value>100000)return NextResponse.json({error:"Вкажіть суму від 1 до 100 000 ₴"},{status:400});return NextResponse.json({url:jarUrl,comment:`${user.steamId}`,amount:value,steamId:user.steamId});}
