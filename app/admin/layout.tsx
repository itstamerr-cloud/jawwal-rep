import { AdminSidebar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="lg:pr-64 min-h-screen">
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
