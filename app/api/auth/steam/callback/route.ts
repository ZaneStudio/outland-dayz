import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Використовуємо суворо публічний домен для уникнення редіректів на localhost:10000
  const baseUrl = process.env.NEXTAUTH_URL || 'https://outland-dayz.onrender.com';
  const { searchParams } = new URL(request.url);

  // Отримуємо OpenID claimed_id від Steam
  const claimedId = searchParams.get('openid.claimed_id');

  if (!claimedId) {
    return NextResponse.redirect(`${baseUrl}/login?error=MissingClaimedId`);
  }

  // Витягуємо 64-бітний Steam ID з посилання (наприклад: https://steamcommunity.com/openid/id/76561198XXXXXXXXX)
  const steamIdMatches = claimedId.match(/\/id\/(\d+)/);
  const steamId = steamIdMatches ? steamIdMatches[1] : null;

  if (!steamId) {
    return NextResponse.redirect(`${baseUrl}/login?error=InvalidSteamId`);
  }

  // Отримуємо дані профілю з Steam Web API
  const apiKey = process.env.STEAM_API_KEY;
  let userData = {
    steamId,
    name: `User ${steamId.slice(-4)}`,
    avatar: '',
  };

  if (apiKey) {
    try {
      const res = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`,
        { cache: 'no-store' }
      );

      if (res.ok) {
        const data = await res.json();
        const player = data?.response?.players?.[0];
        if (player) {
          userData = {
            steamId: player.steamid,
            name: player.personaname,
            avatar: player.avatarfull || player.avatarmedium || player.avatar,
          };
        }
      }
    } catch (error) {
      console.error('Steam API Fetch Error:', error);
    }
  }

  // Формуємо редірект на сторінку /profile
  const response = NextResponse.redirect(`${baseUrl}/profile`);

  // Встановлюємо Cookie сесії
  response.cookies.set('steam_session', JSON.stringify(userData), {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 днів
  });

  response.cookies.set('steamId', steamId, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}