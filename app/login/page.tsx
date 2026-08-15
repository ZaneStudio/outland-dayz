import { Gamepad2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="shell grid min-h-[70vh] place-items-center py-14"><section className="panel w-full max-w-md p-7 sm:p-9"><p className="eyebrow">Ідентифікація</p><h1 className="heading mt-2 text-4xl">Вхід через Steam</h1><p className="mt-5 leading-relaxed text-stone-400">Використовуйте свій Steam-акаунт — пароль не передається й не зберігається на сайті OutLand DayZ.</p>{error && <p className="mt-5 border border-ember/50 bg-ember/10 p-3 text-sm text-red-200">Не вдалося підтвердити Steam-акаунт. Спробуйте ще раз.</p>}<a href="/api/auth/steam" className="btn mt-7 w-full"><Gamepad2 size={18}/> Увійти через Steam</a><div className="mt-6 flex gap-3 border-t border-white/10 pt-5 text-xs text-stone-500"><ShieldCheck className="shrink-0 text-[#b6c87b]" size={18}/><p>Steam OpenID підтверджує особу без доступу до вашого пароля.</p></div><Link href="/" className="mt-6 block text-center text-sm text-[#b7c87d]">Повернутися на головну</Link></section></main>
}
