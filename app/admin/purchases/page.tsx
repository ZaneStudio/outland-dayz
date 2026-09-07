import { db } from "@/lib/db";
import { currentAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPurchasesPage() {
  const admin = await currentAdmin();
  if (!admin) redirect("/");

  let purchases: any[] = [];
  try {
    purchases = await (db as any).purchaseLog?.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }) || [];
  } catch (e) {
    console.log("PurchaseLog table not ready");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Історія покупок</h1>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
        <table className="w-full text-left text-sm text-stone-300">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-stone-200">
            <tr>
              <th className="px-6 py-4">Дата та час</th>
              <th className="px-6 py-4">Гравець</th>
              <th className="px-6 py-4">Steam ID</th>
              <th className="px-6 py-4">Товар</th>
              <th className="px-6 py-4">Ціна</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p: any) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 whitespace-nowrap text-stone-400">
                  {p.createdAt ? new Date(p.createdAt).toLocaleString("uk-UA") : "—"}
                </td>
                <td className="px-6 py-4 font-medium text-white">{p.username || "Невідомо"}</td>
                <td className="px-6 py-4 font-mono text-xs text-stone-400">{p.steamId || "—"}</td>
                <td className="px-6 py-4 text-[#b6c980] font-medium">{p.productName || "Товар"}</td>
                <td className="px-6 py-4 text-emerald-400 font-bold">{p.price || 0} ₴</td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-stone-500">
                  Історія покупок поки що порожня
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}