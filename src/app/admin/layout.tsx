import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="ml-[240px] p-8">{children}</main>
    </div>
  );
}