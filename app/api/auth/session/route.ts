import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('steam_session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    const userData = JSON.parse(sessionCookie);

    return NextResponse.json({
      user: {
        steamId: userData.steamId,
        name: userData.name,
        avatar: userData.avatar,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}