import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070807] py-12">
      <div className="shell grid gap-8 md:grid-cols-3">
        <div>
          <div className="heading text-3xl text-[#dce5bd]">{siteConfig.name}</div>
          <p className="mt-3 text-sm sm:text-base text-stone-300">Український DayZ сервер</p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 text-sm sm:text-[15px] font-medium text-stone-300">
          <Link className="hover:text-[#b6c980] transition" href="/shop">
            Магазин
          </Link>
          <Link className="hover:text-[#b6c980] transition" href="/rules">
            Правила
          </Link>
          <Link className="hover:text-[#b6c980] transition" href="/forum">
            Форум
          </Link>
        </div>
        <div className="text-sm sm:text-[15px] text-stone-300">
          <a className="font-semibold text-[#b4c77d] hover:underline" href={siteConfig.discord}>
            Discord спільнота
          </a>
          <p className="mt-4 text-stone-400">© 2026 OUTLAND DAYZ</p>
        </div>
      </div>
    </footer>
  );
}
