import type { Metadata } from "next";
import { AdminClient } from "@/components/admin-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return <AdminClient />;
}
