"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Coins, Crown, Bell, LogOut, Settings, ShoppingBag, Calendar, CheckCircle2, Ticket, CreditCard, Copy, ShieldCheck, Terminal } from "lucide-react";

type Order = {
  id: string;
  code?: string;
  date: string;
  items: Array<{ id: string; name: string; price: number; image?: string }>;
  total: number;
};

type SteamUser = {
  steamId: string;
  name: string;
  avatar: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<SteamUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [balance, setBalance] = useState<number>(50);
  const [promo, setPromo] = useState("");
  const [amount, setAmount] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const updateBalanceFromStorage = () => {
      const savedBalance = localStorage.getItem("outland_user_balance");
      if (savedBalance !== null) {
        setBalance(Number(savedBalance));
      } else {
        localStorage.setItem("outland_user_balance", "50");
        setBalance(50);
      }
    };

    updateBalanceFromStorage();

    window.addEventListener("storage", updateBalanceFromStorage);
    const interval = setInterval(updateBalanceFromStorage, 1000);

    fetch('/api/auth/session', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          const savedOrders = JSON.parse(localStorage.getItem(`outland_orders_${data.user.steamId}`) || localStorage.getItem("outland_orders") || "[]");
          setOrders(savedOrders);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));

    return () => {
      window.removeEventListener("storage", updateBalanceFromStorage);
      clearInterval(interval);
    };
  }, []);

  const vipLabel = "Неактивний";

  const handleCopySteamId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.steamId);
    setCopiedCode("steam");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(`!code ${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    window.location.href = "/";
  };

  const handleTopUp = () => {
    const addAmount = Number(amount);
    if (!addAmount || addAmount <= 0) {
      alert("Будь ласка, введіть суму для поповнення!");
      return;
    }

    if (!user?.steamId) {
      alert("Помилка: не знайдено Steam ID. Перезайдіть в аккаунт.");
      return;
    }

    const monobankJarUrl = `https://send.monobank.ua/jar/3UQUKK7EN8?a=${addAmount}&t=${user.steamId}`;
    window.open(monobankJarUrl, "_blank");
  };

  if (!user) {
    return (
      <main className="min-h-screen pb-28 relative isolate overflow-hidden grid place-items-center">
        <div className="absolute inset-0 -z-20 pointer-events-none">
          <img src="/images/hero-bg.jpg" alt="Background" className="h-full w-full scale-105 object-cover blur-[4px] brightness-90" />
        </div>
        <div className="absolute inset-0 -z-10 bg-black/70 pointer-events-none" />
        
        <div className="rounded-3xl bg-black/80 backdrop-blur-xl border border-white/15 p-10 text-center space-y-4 max-w-md mx-auto shadow-2xl">
          <h2 className="heading text-2xl text-white">Потрібна авторизація</h2>
          <p className="text-xs text-stone-400">Увійдіть через Steam, щоб переглянути свій особистий профіль та історію покупок.</p>
          <Link href="/login" className="btn inline-flex items-center justify-center w-full !min-h-12 rounded-xl text-xs uppercase tracking-widest shadow-lg">
            Увійти через Steam
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-28 relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-20 pointer-events-none">
        <img src="/images/hero-bg.jpg" alt="Outland DayZ Background" className="h-full w-full scale-105 object-cover blur-[4px] brightness-90" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/40 to-black/80 pointer-events-none" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#b6c980]/10 blur-[140px] rounded-full pointer-events-none -z-10" />
      
      <div className="hero-vignette absolute inset-0 -z-10 pointer-events-none" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-40 pointer-events-none" />

      <div className="shell mt-10 sm:mt-14 max-w-5xl space-y-6">
        
        <div className="relative rounded-3xl bg-black/60 backdrop-blur-xl border border-white/15 p-6 sm:p-8 shadow-2xl shadow-[#b6c980]/5 animate-enter flex flex-wrap items-center justify-between gap-6 overflow-hidden group">
          <div className="absolute -right-24 -top-24 w-64 h-64 bg-[#b6c980]/5 blur-3xl rounded-full pointer-events-none group-hover:bg-[#b6c980]/10 transition duration-700" />
          
          <div className="flex items-center gap-5 min-w-0 relative z-10">
            {user.avatar ? (
              <Image 
                src={user.avatar} 
                width={76} 
                height={76} 
                alt="Steam avatar" 
                unoptimized
                className="h-19 w-19 shrink-0 rounded-2xl border border-[#b6c980]/40 object-cover shadow-xl shadow-[#b6c980]/10" 
              />
            ) : (
              <div className="grid h-19 w-19 shrink-0 place-items-center rounded-2xl bg-[#1c2413] text-2xl font-bold text-[#b6c980] border border-[#b6c980]/40 shadow-xl shadow-[#b6c980]/10">
                {user.name ? user.name.slice(0, 1) : "U"}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#b6c980] animate-pulse" />
                <p className="eyebrow text-[#b6c980] tracking-widest">Особистий файл · Steam Secure</p>
              </div>
              <h1 className="heading truncate text-2xl sm:text-3xl text-[#f2f5e9] mt-1">{user.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck size={13} className="text-[#b6c980]" />
                <p className="truncate text-xs text-stone-400 font-mono">ID: {user.steamId}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <Link href="/profile/settings" className="btn btn-outline !min-h-11 px-5 rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-2 border-white/20 hover:bg-white/10 hover:border-[#b6c980] transition shadow-lg">
              <Settings size={15} /> Налаштування
            </Link>
            <button 
              onClick={handleLogout}
              className="btn border-red-500/30 bg-transparent text-[#f0b3aa] hover:bg-red-500/20 !min-h-11 px-5 rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer transition shadow-lg"
            >
              <LogOut size={15} /> Вийти
            </button>
          </div>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-3 animate-enter delay-1">
          <div className="rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 p-5 shadow-2xl flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#b6c980] hover:shadow-[#b6c980]/15 group">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/30 shadow-lg group-hover:scale-110 transition duration-300">
              <Coins size={22} />
            </div>
            <div>
              <p className="eyebrow text-[#b6c980]">Баланс</p>
              <p className="mt-0.5 text-xl font-bold font-mono text-[#b6c980]">{balance} ₴</p>
            </div>
          </div>

          <div className="rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 p-5 shadow-2xl flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#d9ca72] hover:shadow-[#d9ca72]/15 group">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#282512] text-[#d9ca72] border border-[#d9ca72]/30 shadow-lg group-hover:scale-110 transition duration-300">
              <Crown size={22} />
            </div>
            <div>
              <p className="eyebrow text-[#d9ca72]">VIP статус</p>
              <p className="mt-0.5 text-base font-bold text-stone-200">{vipLabel}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 p-5 shadow-2xl flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#b6c980] hover:shadow-[#b6c980]/15 group">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/30 shadow-lg group-hover:scale-110 transition duration-300">
              <Bell size={22} />
            </div>
            <div>
              <p className="eyebrow text-[#b6c980]">Повідомлень</p>
              <p className="mt-0.5 text-xl font-bold text-white font-mono">0</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 animate-enter delay-2">
          
          <div className="rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 p-6 sm:p-7 shadow-2xl flex flex-col justify-between transition duration-300 hover:border-white/30">
            <div>
              <div className="flex items-center gap-2.5 text-[#b6c980] mb-3">
                <Ticket size={22} />
                <h3 className="font-bold text-white text-base tracking-wide">Промокод</h3>
              </div>
              <p className="text-xs text-stone-400 mb-5 leading-relaxed">Введіть акційний код для миттєвого зарахування бонусів на ігровий рахунок.</p>
              
              <div className="flex gap-2.5">
                <input
                  type="text"
                  placeholder="ВВЕДІТЬ КОД"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  className="w-full rounded-xl bg-black/50 border border-white/15 px-4 py-3.5 text-xs uppercase tracking-wider text-white placeholder-stone-500 focus:border-[#b6c980] focus:outline-none transition shadow-inner"
                />
                <button 
                  onClick={async () => {
                    if (!promo.trim()) {
                      alert("Введіть промокод!");
                      return;
                    }
                    try {
                      const res = await fetch("/api/promocodes/activate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code: promo })
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        alert(data.error || "Помилка активації промокоду");
                        return;
                      }
                      alert(`Успішно! На ваш баланс зараховано ${data.amount} ₴`);
                      setPromo("");
                      window.location.reload();
                    } catch (err) {
                      alert("Помилка мережі");
                    }
                  }}
                  className="btn rounded-xl px-6 text-xs uppercase tracking-widest shrink-0 cursor-pointer shadow-lg shadow-[#b6c980]/10 hover:scale-[1.02] transition"
                >
                  Активувати
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
              <span>Steam ID: <b className="text-white font-mono">{user.steamId}</b></span>
              <button 
                onClick={handleCopySteamId}
                className="inline-flex items-center gap-1.5 text-[#b6c980] hover:text-white transition cursor-pointer font-medium"
              >
                <Copy size={13} /> {copiedCode === "steam" ? "Скопійовано!" : "Копіювати"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 p-6 sm:p-7 shadow-2xl flex flex-col justify-between transition duration-300 hover:border-white/30">
            <div>
              <div className="flex items-center gap-2.5 text-[#b6c980] mb-3">
                <CreditCard size={22} />
                <h3 className="font-bold text-white text-base tracking-wide">Поповнити баланс (Monobank)</h3>
              </div>
              <p className="text-xs text-stone-400 mb-5 leading-relaxed">Перехід на захищену сторінку оплати Monobank для поповнення рахунку.</p>
              
              <div className="flex gap-2.5">
                <input
                  type="number"
                  placeholder="Сума, ₴"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl bg-black/50 border border-white/15 px-4 py-3.5 text-xs text-white placeholder-stone-500 focus:border-[#b6c980] focus:outline-none transition font-mono shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button 
                  onClick={handleTopUp}
                  className="btn rounded-xl px-6 text-xs uppercase tracking-widest shrink-0 cursor-pointer shadow-lg shadow-[#b6c980]/10 hover:scale-[1.02] transition"
                >
                  Поповнити
                </button>
              </div>
            </div>

            <p className="mt-5 text-[11px] text-stone-500 leading-relaxed pt-3 border-t border-white/10">
              <b className="text-stone-300">Важливо:</b> у коментарі до платежу автоматично підтягнеться ваш Steam ID для зарахування коштів.
            </p>
          </div>

        </div>

        <div className="rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 p-6 sm:p-8 shadow-2xl animate-enter delay-3 transition duration-300 hover:border-white/30">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[#b6c980]">Логи транзакцій</p>
              <h3 className="heading text-2xl text-white mt-1">Історія покупок</h3>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#1c2413] text-[#b6c980] border border-[#b6c980]/30 shadow-md">
              <ShoppingBag size={20} />
            </div>
          </div>

          {orders.length > 0 ? (
            <div className="max-h-[520px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {orders.map((order) => {
                const displayCode = order.code || "OUT-7492-X9M1";
                const fullCommand = `!code ${displayCode}`;

                return (
                  <div key={order.id} className="rounded-xl bg-black/50 border border-white/10 p-5 space-y-4 shadow-inner transition hover:border-[#b6c980]/40">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-[#b6c980]" size={16} />
                        <span className="font-mono text-sm font-bold text-white">{order.id}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="bg-[#1c2413] px-3 py-1.5 rounded-xl border border-[#b6c980]/30 flex items-center gap-2 shadow-sm">
                          <Terminal size={14} className="text-[#b6c980]" />
                          <span className="font-mono text-xs font-bold text-[#b6c980]">{fullCommand}</span>
                          <button
                            onClick={() => handleCopyCode(displayCode)}
                            className="ml-2 text-[10px] uppercase bg-[#2b381c] hover:bg-[#384925] text-[#b6c980] px-2 py-0.5 rounded transition cursor-pointer font-bold"
                          >
                            {copiedCode === displayCode ? "Скопійовано!" : "Копіювати"}
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-stone-400">
                          <Calendar size={14} /> {order.date}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-2.5 border border-white/5 text-[11px] text-stone-400 flex items-center gap-2">
                      <span className="text-[#b6c980] font-bold">💡 Підказка:</span> 
                      <span>Скопіюйте цю команду та введіть її у загальний або ігровий чат на сервері Outland DayZ, щоб отримати придбані предмети.</span>
                    </div>

                    <div className="grid gap-2 pt-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-stone-300">{item.name}</span>
                          <span className="font-mono text-[#b6c980] font-bold">{item.price} ₴</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-sm font-bold">
                      <span className="text-stone-400 uppercase tracking-wider text-xs">Загальна сума:</span>
                      <span className="font-mono text-base text-[#b6c980]">{order.total} ₴</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl bg-black/50 border border-white/10 p-10 text-center text-stone-400 text-sm shadow-inner flex flex-col items-center justify-center gap-3">
              <ShoppingBag size={28} className="text-stone-600" />
              <p>У вас поки немає історії покупок. Зробіть перше замовлення в магазині!</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}