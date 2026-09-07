import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Динамічно беремо поточний origin (твій реальний порт і домен на цю хвилину)
  const baseUrl = req.nextUrl.origin;

  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': `${baseUrl}/api/auth/steam/callback`,
    'openid.realm': `${baseUrl}/`,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  return NextResponse.redirect(`https://steamcommunity.com/openid/login?${params.toString()}`);
}