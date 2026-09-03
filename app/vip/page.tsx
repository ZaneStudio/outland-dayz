"use client";

import { Check, Crown, LoaderCircle, Coins } from "lucide-react";
import { useEffect, useState } from "react";

type VipPlan = { id: string; name: string; price: number; durationDays: number | null; features: string[] };
type SteamUser = { steamId: string; name: string; avatar: string };

export default function VipPage() {
  const [plans, setPlans] = useState<VipPlan[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [user, setUser] = useState<SteamUser | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/vip", { cache: "no-store" }).then((r) => r.ok ? r.json() : []).then(setPlans);
    fetch("/api/auth/session").then((r) => r.ok ? r.json() : null).then((d) => setUser(d?.user || null));
    fetch("/api/balance", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((d) => setBalance(d?.balance ?? null));
  }, []);

  const buy = async (planId: string) => {
    setLoading(planId); 
    setMessage("");
    const response = await fetch("/api/vip/purchase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId }) });
    const data = await response.json();
    if (!response.ok) { 
      setMessage(data.error || "Не вдалося оформити VIP."); 
      setLoading(null); 
      return; 
    }
    setBalance(data.balance);
    setMessage(`VIP активовано${data.expiresAt ? ` до ${new Date(data.expiresAt).toLocaleDateString("uk-UA")}` : " назавжди"}.`);
    setLoading(null);
  };

  return (
    <main className="min-h-screen pb-24">
      {/* Верхня секція з фоновим зображенням */}
      <section className="relative isolate overflow-hidden border-b border-white/10 py-8 sm:py-10">
        <div className="absolute inset-0 -z-20">
          <img
            src="/images/hero-bg.jpg"
            alt="Outland DayZ Background"
            className="h-full w-full scale-105 object-cover"
          />
        </div>

        <div className="absolute inset-0 -z-10 bg-black/40" />
        <div className="hero-vignette absolute inset-0 -z-10" />
        <div className="grid-lines absolute inset-0 -z-10 opacity-60" />

        <div className="shell relative z-10 flex items-center justify-end">
          {balance !== null && (
            <div className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 flex min-w-52 items-center gap-3 px-5 py-3 shadow-xl">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#2a351b] text-[#d8ec9a] border border-white/5">
                <Coins size={18} />
              </span>
              <div>
                <p className="eyebrow">Ваш баланс</p>
                <p className="mt-0.5 text-lg font-bold text-[#d8ec9a]">
                  {balance} ₴
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="shell mt-12 sm:mt-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="heading text-4xl sm:text-6xl text-[#f2f5e9]">
            VIP Статус
          </h1>
        </div>

        {message && (
          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-[#879d5b] bg-black/60 backdrop-blur-md p-4 text-center text-[#d7e69d] shadow-xl">
            {message}
          </div>
        )}

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.id} className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 p-6 sm:p-7 flex flex-col transition duration-300 hover:-translate-y-1 hover:border-[#84955a] shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <h2 className="heading text-3xl text-[#f2f5e9]">{plan.name}</h2>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2a351b] text-[#d9ca72] border border-white/5">
                  <Crown size={20} />
                </div>
              </div>

              <p className="mt-6 text-3xl font-extrabold text-[#d8ec9a]">{plan.price} ₴</p>
              <p className="mt-1 text-xs text-stone-400 uppercase tracking-wider">{plan.durationDays === null ? "Безстроковий статус" : `${plan.durationDays} днів VIP`}</p>

              <ul className="my-6 space-y-3 text-sm text-stone-300 border-t border-white/10 pt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 items-start">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#2a351b] text-[#adbe70]">
                      <Check size={12} />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => buy(plan.id)} 
                disabled={loading !== null} 
                className="btn mt-auto w-full !min-h-11 rounded-xl text-xs uppercase tracking-wider disabled:cursor-wait disabled:opacity-60"
              >
                {loading === plan.id ? (
                  <>
                    <LoaderCircle className="animate-spin" size={16} />
                    Оформлюємо
                  </>
                ) : (
                  "Придбати з балансу"
                )}
              </button>
            </article>
          ))}
        </div>

        {!plans.length && (
          <div className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 mx-auto mt-10 max-w-5xl p-12 text-center text-stone-400 shadow-xl">
            VIP-пакети з'являться зовсім скоро. Слідкуйте за оновленнями!
          </div>
        )}
      </div>
    </main>
  );
}