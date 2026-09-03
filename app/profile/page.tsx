import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSteamSession } from "@/lib/steam-auth";
import { ProfileDashboard } from "@/components/profile-dashboard";
import { getBalance } from "@/lib/balance-store";
import { getSteamVip } from "@/lib/vip-store";
import { Coins, Crown, Bell, LogOut, Settings } from "lucide-react";

export default async function Profile() {
  const user = await getSteamSession();
  
  if (!user) redirect("/login");

  let account = { balance: 0 };
  let vip = null;

  try {
    const results = await Promise.all([
      getBalance(user.steamId).catch(() => ({ balance: 0 })),
      getSteamVip(user.steamId).catch(() => null)
    ]);
    account = results[0] || { balance: 0 };
    vip = results[1];
  } catch (error) {
    console.error("Error loading profile data:", error);
  }
  
  const initial = user.name ? user.name.slice(0, 1).toUpperCase() : "U";
  
  const activeVip = vip && (!vip.expiresAt || new Date(vip.expiresAt) > new Date()) ? vip : null;
  const vipLabel = activeVip 
    ? `${activeVip.plan?.name || 'VIP'} ${activeVip.expiresAt ? `до ${new Date(activeVip.expiresAt).toLocaleDateString("uk-UA")}` : 'назавжди'}` 
    : "Неактивний";

  return (
    <main className="min-h-screen pb-24 relative isolate overflow-hidden">
      {/* Атмосферний фон у фірмовому стилі */}
      <div className="absolute inset-0 -z-20 pointer-events-none">
        <img
          src="/images/hero-bg.jpg"
          alt="Outland DayZ Background"
          className="h-full w-full scale-105 object-cover"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-black/40 pointer-events-none" />
      <div className="hero-vignette absolute inset-0 -z-10 pointer-events-none" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-50 pointer-events-none" />

      <div className="shell mt-10 sm:mt-14">
        
        {/* Шапка профілю */}
        <div className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 p-6 sm:p-8 shadow-2xl animate-enter flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {user.avatar ? (
              <Image 
                src={user.avatar} 
                width={80} 
                height={80} 
                alt="Steam avatar" 
                className="h-20 w-20 shrink-0 rounded-2xl border border-white/15 object-cover shadow-lg" 
              />
            ) : (
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-[#2a351b] text-3xl font-bold text-[#d8ec9a] border border-white/5">
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <p className="eyebrow">Особистий файл · Steam</p>
              <h1 className="heading truncate text-3xl sm:text-4xl text-[#f2f5e9] mt-1">{user.name}</h1>
              <p className="mt-1 truncate text-xs text-stone-400">Підключено через Steam ID: {user.steamId}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/profile/settings" className="btn btn-outline !min-h-11 rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-2">
              <Settings size={16} /> Налаштування
            </Link>
            <form action="/api/auth/logout" method="post">
              <button className="btn border-red-500/30 bg-transparent text-[#f0b3aa] hover:bg-red-500/20 !min-h-11 rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-2">
                <LogOut size={16} /> Вийти
              </button>
            </form>
          </div>
        </div>
        
        {/* Картки статистики */}
        <div className="animate-enter delay-1 mt-6 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 p-6 shadow-xl flex items-center gap-4 transition hover:-translate-y-1 hover:border-[#84955a]">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#2a351b] text-[#d8ec9a] border border-white/5">
              <Coins size={22} />
            </div>
            <div>
              <p className="eyebrow">Баланс</p>
              <p className="mt-0.5 text-xl font-bold text-[#d8ec9a]">{account?.balance ?? 0} ₴</p>
            </div>
          </div>

          <div className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 p-6 shadow-xl flex items-center gap-4 transition hover:-translate-y-1 hover:border-[#84955a]">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#2a351b] text-[#d9ca72] border border-white/5">
              <Crown size={22} />
            </div>
            <div>
              <p className="eyebrow">VIP статус</p>
              <p className="mt-0.5 text-lg font-bold text-stone-200">{vipLabel}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 p-6 shadow-xl flex items-center gap-4 transition hover:-translate-y-1 hover:border-[#84955a]">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#2a351b] text-[#d8ec9a] border border-white/5">
              <Bell size={22} />
            </div>
            <div>
              <p className="eyebrow">Повідомлень</p>
              <p className="mt-0.5 text-xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
        
        {/* Дашборд поповнень / промокодів / активності */}
        <div className="animate-enter delay-2 mt-6">
          <ProfileDashboard steamId={user.steamId} vipLabel={vipLabel} />
        </div>

      </div>
    </main>
  );
}