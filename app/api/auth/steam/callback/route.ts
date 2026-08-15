import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://outland-dayz.onrender.com';
  const { searchParams } = new URL(req.url);

  // Валідація OpenID відповіді від Steam
  const params = new URLSearchParams(searchParams);
  params.set('openid.mode', 'check_authentication');

  try {
    const response = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const text = await response.text();
    const isValid = text.includes('is_valid:true');

    if (isValid) {
      const claimedId = searchParams.get('openid.claimed_id');
      const steamId = claimedId?.split('/').pop();

      // Успішний вхід — повертаємо користувача на головну сторінку з steamId
      const responseRedirect = NextResponse.redirect(`${baseUrl}/?steamId=${steamId}`);
      if (steamId) {
        responseRedirect.cookies.set('steamId', steamId, { path: '/' });
      }
      return responseRedirect;
    }
  } catch (error) {
    console.error('Steam Auth Error:', error);
  }

  return NextResponse.redirect(`${baseUrl}/?error=SteamAuthFailed`);
}