import { NextResponse } from "next/server"; import { steamSessionCookie } from "@/lib/steam-auth";
export async function POST(request: Request) { const response = NextResponse.redirect(new URL("/", request.url)); response.cookies.set(steamSessionCookie, "", { path: "/", maxAge: 0 }); return response; }
