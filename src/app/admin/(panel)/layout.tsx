import { AdminBottomNav, AdminSidebar, AdminTopBar } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar email={user.email ?? ""} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 sm:px-6 lg:pb-10 lg:pt-8">{children}</main>
      </div>
      <AdminBottomNav />
    </div>
  );
}
