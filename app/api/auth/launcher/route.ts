import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { getSteamSession } from '@/lib/steam-auth';
export const dynamic = 'force-dynamic';
function key() { const k = process.env.STEAM_SESSION_SECRET; if (!k) throw new Error('Session secret required'); return k; }
function sign(b: string) { return createHmac('sha256', key()).update('launcher:' + b).digest('base64url'); }
export async function POST(req: NextRequest) {
  if (req.headers.get('origin') !== new URL(req.url).origin) return new NextResponse(null,{status:403});
  const user = await getSteamSession();
  if (!user) return NextResponse.json({error:'Login required'},{status:401});
  const {state} = await req.json();
  if (!/^[a-f0-9]{64}$/.test(state)) return new NextResponse(null,{status:400});
  const body = Buffer.from(JSON.stringify({user,state,exp:Date.now()+30*86400000})).toString('base64url');
  return NextResponse.json({token:body+'.'+sign(body)},{headers:{'Cache-Control':'no-store'}});
}
export async function GET(req: NextRequest) {
  try {
    const [b,s] = (req.headers.get('authorization') || '').replace(/^Bearer /,'').split('.');
    const expected = sign(b);
    if (!s || s.length !== expected.length || !timingSafeEqual(Buffer.from(s),Buffer.from(expected))) throw Error();
    const data = JSON.parse(Buffer.from(b,'base64url').toString());
    if (data.exp < Date.now()) throw Error();
    return NextResponse.json(data,{headers:{'Cache-Control':'no-store'}});
  } catch { return NextResponse.json({error:'Expired session'},{status:401}); }
}
