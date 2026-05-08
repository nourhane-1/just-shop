import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SellerSidebar from "@/components/SellerSidebar";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const role = (session.user as any).role;

  if (role !== "seller" && role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <SellerSidebar />
      <main className="ml-[240px] p-8">{children}</main>
    </div>
  );
}