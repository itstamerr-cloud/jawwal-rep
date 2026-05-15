"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("يرجى إدخال كلمة المرور");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "كلمة مرور خاطئة");
      }
      toast.success("تم تسجيل الدخول بنجاح");
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ ما");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#1A8CFF] flex items-center justify-center font-bold text-white text-3xl shadow-lg mb-3 select-none">
            ج
          </div>
          <h1 className="text-2xl font-bold text-gray-900">جوال</h1>
          <p className="text-sm text-gray-500 mt-1">لوحة تحكم التقارير</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5">تسجيل الدخول</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8CFF] focus:border-transparent transition"
                autoComplete="current-password"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 bg-[#1A8CFF] hover:bg-[#1578e0]"
            >
              {loading ? "جار الدخول..." : "دخول"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
