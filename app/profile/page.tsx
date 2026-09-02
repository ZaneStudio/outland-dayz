import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSteamSession } from "@/lib/steam-auth";
import { ProfileDashboard } from "@/components/profile-dashboard";
import { getBalance } from "@/lib/balance-store";
import { getSteamVip } from "@/lib/vip-store";

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
    <main className="shell max-w-5xl py-14">
      <p className="eyebrow animate-enter">Особовий файл · Steam</p>
      
      <div className="panel cut animate-enter delay-1 mt-4 p-7 sm:flex sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-5">
          {user.avatar ? (
            <Image 
              src={user.avatar} 
              width={80} 
              height={80} 
              alt="Steam avatar" 
              className="h-20 w-20 shrink-0 rounded-full border-2 border-[#8ba96d] shadow-glow" 
            />
          ) : (
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[#829258] text-3xl font-bold text-[#0a0c09]">
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="heading truncate text-4xl">{user.name}</h1>
            <p className="mt-2 truncate text-sm text-stone-400">Підключено через Steam</p>
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-3 sm:mt-0">
          <Link href="/profile/settings" className="btn btn-outline">
            Налаштування
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="btn border-ember bg-transparent text-[#f0b3aa] hover:bg-ember/20">
              Вийти
            </button>
          </form>
        </div>
      </div>
      
      <div className="animate-enter delay-2 mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Баланс", `${account?.balance ?? 0} ₴`], 
          ["VIP статус", vipLabel], 
          ["Повідомлень", "0"]
        ].map(([label, value]) => (
          <div key={label} className="panel p-5 transition hover:-translate-y-1 hover:border-[#84966a]">
            <p className="eyebrow">{label}</p>
            <p className="mt-3 text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      
      <div className="animate-enter delay-3">
        <ProfileDashboard steamId={user.steamId} />
      </div>
    </main>
  );
}