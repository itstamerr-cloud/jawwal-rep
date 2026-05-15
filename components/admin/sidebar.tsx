"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Download,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/admin", label: "اليوم", icon: LayoutDashboard, exact: true },
  { href: "/admin/monthly", label: "الشهري", icon: CalendarDays },
  { href: "/admin/employee", label: "الموظفين", icon: Users },
  { href: "/admin/export", label: "التصدير", icon: Download },
  { href: "/admin/manage", label: "الإدارة", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
        active
          ? "bg-[#1A8CFF] text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {label}
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch {
      toast.error("فشل تسجيل الخروج");
    } finally {
      setLoggingOut(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-full bg-[#1A8CFF] flex items-center justify-center font-bold text-white text-lg select-none">
          ج
        </div>
        <div>
          <p className="font-bold text-gray-900">جوال</p>
          <p className="text-xs text-gray-400">لوحة التحكم</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navLinks.map((link) => (
          <NavLink
            key={link.href}
            {...link}
            active={isActive(link.href, link.exact)}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {loggingOut ? "جار الخروج..." : "تسجيل الخروج"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-100 shadow-sm z-40 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 right-0 left-0 z-40 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1A8CFF] flex items-center justify-center font-bold text-white select-none">
            ج
          </div>
          <span className="font-bold text-gray-900 text-sm">جوال - لوحة التحكم</span>
        </div>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          aria-label="القائمة"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "lg:hidden fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-64 bg-white border-l border-gray-100 shadow-lg z-40 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile spacer */}
      <div className="lg:hidden h-14" />
    </>
  );
}
