"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, Dices, Newspaper, Package, ShieldCheck, Ticket } from "lucide-react";

const items = [
  { href: "/admin", label: "Товари", description: "Магазин", Icon: Package },
  { href: "/admin/vip", label: "VIP-пакети", description: "Привілеї", Icon: Crown },
  { href: "/admin/news", label: "Новини", description: "Публікації", Icon: Newspaper },
  { href: "/admin/roulette", label: "Рулетка", description: "Нагороди", Icon: Dices },
  { href: "/admin/promocodes", label: "Промокоди", description: "Бонуси", Icon: Ticket },
];

export function AdminNav() {
  const pathname = usePathname();
  return <aside className="admin-nav-shell">
    <div className="shell">
      <div className="admin-nav-head">
        <span className="admin-shield"><ShieldCheck size={18} /></span>
        <div><p className="eyebrow">Outland control</p><p className="font-bold text-stone-100">Адмінпанель</p></div>
        <span className="admin-access">Steam Admin</span>
      </div>
      <nav className="admin-nav" aria-label="Розділи адмінпанелі">
        {items.map(({ href, label, description, Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} className={`admin-nav-item ${active ? "is-active" : ""}`}>
            <Icon size={18} /><span><b>{label}</b><small>{description}</small></span>
          </Link>;
        })}
      </nav>
    </div>
  </aside>;
}
