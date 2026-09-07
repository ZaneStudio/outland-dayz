import { db } from "@/lib/db";
import VisitorsClient from "./visitors-client";

export const dynamic = "force-dynamic";

export default async function VisitorsAdminPage() {
  const visitors = await db.steamVisitor.findMany({
    orderBy: { lastSeen: "desc" },
  });

  return <VisitorsClient initialVisitors={visitors} />;
}