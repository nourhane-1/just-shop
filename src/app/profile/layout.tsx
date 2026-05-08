import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileSidebar from "@/components/ProfileSidebar";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-[260px_minmax(0,1fr)] gap-8 items-start">
          <aside className="sm:sticky sm:top-24 h-fit">
            <ProfileSidebar user={session.user} />
          </aside>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}