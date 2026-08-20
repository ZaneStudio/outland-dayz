import { NextRequest, NextResponse } from "next/server";
import { currentAdmin } from "@/lib/admin";
import { createPromoCode, getPromoCodes } from "@/lib/promo-store";
export const dynamic="force-dynamic";
export async function GET(){if(!await currentAdmin())return NextResponse.json({error:"Недостатньо прав"},{status:403});return NextResponse.json(await getPromoCodes());}
export async function POST(request:NextRequest){if(!await currentAdmin())return NextResponse.json({error:"Недостатньо прав"},{status:403});const body=await request.json();const amount=Number(body.amount),maxActivations=Number(body.maxActivations);if(!Number.isFinite(amount)||amount<=0||!Number.isInteger(maxActivations)||maxActivations<1||!body.expiresAt)return NextResponse.json({error:"Перевірте дані"},{status:400});return NextResponse.json(await createPromoCode({amount,maxActivations,expiresAt:String(body.expiresAt)}),{status:201});}
