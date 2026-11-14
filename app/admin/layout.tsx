import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { currentAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  if (!admin) redirect("/");
  return <div className="admin-workspace"><AdminNav />{children}</div>;
}
