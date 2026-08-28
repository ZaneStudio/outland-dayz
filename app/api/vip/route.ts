import { NextResponse } from "next/server";
import { getVipPlans } from "@/lib/vip-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getVipPlans());
}
