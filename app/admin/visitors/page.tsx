import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/admin";
import { getAdminDashboardData } from "@/lib/admin-players";
import VisitorsClient from "./visitors-client";

export const dynamic = "force-dynamic";

export default async function VisitorsAdminPage() {
  const admin = await currentAdmin();
  if (!admin) redirect("/");

  const initialData = await getAdminDashboardData({ sync: false });
  return <VisitorsClient initialData={initialData} />;
}
