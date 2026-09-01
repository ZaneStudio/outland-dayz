"use client";

import { Check, Crown, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

type VipPlan = { id: string; name: string; price: number; durationDays: number | null; features: string[] };

export default function VipPage() {
  const [plans, setPlans] = useState<VipPlan[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/vip", { cache: "no-store" }).then((response) => response.json()).then(setPlans);
    fetch("/api/balance", { cache: "no-store" }).then(async (response) => response.ok ? response.json() : null).then((data) => setBalance(data?.balance ?? null));
  }, []);

  const buy = async (planId: string) => {
    setLoading(planId); setMessage("");
    const response = await fetch("/api/vip/purchase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || "Не вдалося оформити VIP."); setLoading(null); return; }
    setBalance(data.balance);
    setMessage(`VIP активовано${data.expiresAt ? ` до ${new Date(data.expiresAt).toLocaleDateString("uk-UA")}` : " назавжди"}.`);
    setLoading(null);
  };

  return <main className="shell py-14">
    <div className="mx-auto max-w-2xl text-center"><p className="eyebrow">Перевага в пустці</p><h1 className="heading mt-2 text-5xl">VIP статус</h1><p className="mt-4 text-stone-400">Купуйте VIP прямо з балансу акаунта — без сторонньої оплати.</p>{balance !== null && <p className="mt-5 font-bold text-[#d7e69d]">Ваш баланс: {balance} ₴</p>}</div>
    {message && <p className="mx-auto mt-7 max-w-2xl border border-[#879d5b] bg-[#1b2314] p-4 text-center text-[#d7e69d]">{message}</p>}
    <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
      {plans.map((plan) => <article key={plan.id} className="panel cut flex flex-col p-6 transition hover:-translate-y-1 hover:border-[#b5ca78]"><div className="flex items-start justify-between gap-3"><h2 className="heading text-3xl">{plan.name}</h2><Crown className="shrink-0 text-[#d9ca72]" /></div><p className="mt-4 text-3xl font-bold text-[#d7e69d]">{plan.price} ₴</p><p className="mt-2 text-sm text-stone-400">{plan.durationDays === null ? "Безстроковий статус" : `${plan.durationDays} днів VIP`}</p><ul className="my-7 space-y-3 text-sm text-stone-300">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><Check size={17} className="shrink-0 text-[#adbe70]" />{feature}</li>)}</ul><button onClick={() => buy(plan.id)} disabled={loading !== null} className="btn mt-auto disabled:cursor-wait disabled:opacity-60">{loading === plan.id ? <><LoaderCircle className="animate-spin" size={17} />Оформлюємо</> : "Придбати з балансу"}</button></article>)}
    </div>
    {!plans.length && <div className="panel mx-auto mt-10 max-w-5xl p-10 text-center text-stone-400">VIP-пакети з'являться зовсім скоро. Слідкуйте за оновленнями!</div>}
  </main>;
}
