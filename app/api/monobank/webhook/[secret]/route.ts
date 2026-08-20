import { NextRequest, NextResponse } from "next/server";
import { creditBalance } from "@/lib/balance-store";

export const dynamic="force-dynamic";
export async function GET(){return new NextResponse("ok");}
export async function POST(request:NextRequest,{params}:{params:Promise<{secret:string}>}){const {secret}=await params;if(!process.env.MONOBANK_WEBHOOK_SECRET||secret!==process.env.MONOBANK_WEBHOOK_SECRET)return new NextResponse("not found",{status:404});try{const event=await request.json();const item=event?.data?.statementItem;if(!item||Number(item.amount)<=0)return NextResponse.json({ok:true});const comment=String(item.comment||"");const steamId=comment.match(/\b7656119\d{10}\b/)?.[0];if(!steamId)return NextResponse.json({ok:true,ignored:"steam-id-not-found"});const amount=Math.floor(Number(item.amount)/100);if(amount<=0)return NextResponse.json({ok:true});await creditBalance(steamId,amount,"Поповнення Mono",String(item.id||`${item.time}-${item.amount}-${comment}`));return NextResponse.json({ok:true});}catch{return NextResponse.json({error:"invalid payload"},{status:400});}}
