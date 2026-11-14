import { ShieldAlert } from "lucide-react";
import { currentAdmin } from "@/lib/admin";
import { getAdminDashboardData } from "@/lib/admin-players";
import VisitorsClient from "./visitors-client";

export const dynamic = "force-dynamic";

export default async function VisitorsAdminPage() {
  const admin = await currentAdmin();
  if (!admin) {
    return (
      <main className="shell grid min-h-[65vh] place-items-center py-14">
        <div className="panel max-w-lg p-9 text-center">
          <ShieldAlert className="mx-auto text-red-400" size={38} />
          <h1 className="heading mt-5 text-4xl">Доступ заборонено</h1>
          <p className="mt-4 text-sm text-stone-300">
            Ця панель доступна лише Steam ID зі списку <code>ADMIN_STEAM_IDS</code>.
          </p>
        </div>
      </main>
    );
  }

  const initialData = await getAdminDashboardData({ sync: false });
  return <VisitorsClient initialData={initialData} />;
}
