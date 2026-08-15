import { NextResponse } from "next/server"; import { getSteamSession } from "@/lib/steam-auth";
export async function GET() { return NextResponse.json({ user: await getSteamSession() }); }
