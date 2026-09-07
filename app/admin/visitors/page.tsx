import { db } from "@/lib/db";
import { currentAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminVisitorsPage() {
  const admin = await currentAdmin();
  if (!admin) redirect("/");

  let visitors: any[] = [];
  try {
    visitors = await db.steamVisitor.findMany({
      orderBy: { lastSeen: "desc" },
      take: 100,
    });
  } catch (e) {
    console.log("SteamVisitor table not ready");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Гравці на сайті (Steam)</h1>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
        <table className="w-full text-left text-sm text-stone-300">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-stone-200">
            <tr>
              <th className="px-6 py-4">Останній візит</th>
              <th className="px-6 py-4">Нікнейм</th>
              <th className="px-6 py-4">Steam ID</th>
            </tr>
          </thead>
          <tbody>
            {visitors.map((v: any) => (
              <tr key={v.steamId} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 whitespace-nowrap text-stone-400">
                  {new Date(v.lastSeen).toLocaleString("uk-UA")}
                </td>
                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                  {v.avatar && <img src={v.avatar} alt="" className="w-8 h-8 rounded-full" />}
                  {v.username}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-stone-400">{v.steamId}</td>
              </tr>
            ))}
            {visitors.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-stone-500">
                  Список відвідувачів поки що порожній
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}