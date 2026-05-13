import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your table",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
