"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getTodayString } from "@/lib/utils";

interface Employee {
  id: string;
  name: string;
}

export default function HomePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    employee_id: "",
    report_date: getTodayString(),
    jawwal_revenue: "",
    paltel_revenue: "",
    collections: "",
    visits_count: "",
    visited_accounts: "",
  });

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => r.json())
      .then((data) => {
        setEmployees(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("فشل تحميل قائمة الموظفين");
        setLoading(false);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_id) {
      toast.error("يرجى اختيار الموظف");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        employee_id: form.employee_id,
        report_date: form.report_date,
        jawwal_revenue: form.jawwal_revenue ? parseFloat(form.jawwal_revenue) : 0,
        paltel_revenue: form.paltel_revenue ? parseFloat(form.paltel_revenue) : 0,
        collections: form.collections ? parseFloat(form.collections) : 0,
        visits_count: form.visits_count ? parseInt(form.visits_count, 10) : 0,
        visited_accounts: form.visited_accounts.trim() || null,
      };

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "خطأ في الإرسال");
      }

      toast.success("تم إرسال التقرير بنجاح ✓");
      setForm((prev) => ({
        ...prev,
        jawwal_revenue: "",
        paltel_revenue: "",
        collections: "",
        visits_count: "",
        visited_accounts: "",
      }));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ ما");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header
        className="w-full py-4 px-6 flex items-center gap-3 shadow-sm"
        style={{ backgroundColor: "#1A8CFF" }}
      >
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-bold text-[#1A8CFF] text-lg select-none">
          ج
        </div>
        <h1 className="text-white text-xl font-bold tracking-wide">جوال</h1>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">تقرير الجولة اليومية</h2>
            <p className="text-sm text-gray-500 mt-1">أدخل بيانات تقرير اليوم</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
            {/* Employee Select */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                الموظف <span className="text-red-500">*</span>
              </label>
              <select
                name="employee_id"
                value={form.employee_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A8CFF] focus:border-transparent transition"
                disabled={loading}
              >
                <option value="">
                  {loading ? "جار التحميل..." : "اختر الموظف"}
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                التاريخ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="report_date"
                value={form.report_date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8CFF] focus:border-transparent transition"
                required
              />
            </div>

            {/* Revenue fields grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  إيرادات جوال (₪)
                </label>
                <input
                  type="number"
                  name="jawwal_revenue"
                  value={form.jawwal_revenue}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8CFF] focus:border-transparent transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  إيرادات بالتل (₪)
                </label>
                <input
                  type="number"
                  name="paltel_revenue"
                  value={form.paltel_revenue}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8CFF] focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  التحصيلات (₪)
                </label>
                <input
                  type="number"
                  name="collections"
                  value={form.collections}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8CFF] focus:border-transparent transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  عدد الزيارات
                </label>
                <input
                  type="number"
                  name="visits_count"
                  value={form.visits_count}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8CFF] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Visited Accounts */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                الحسابات المزارة
              </label>
              <textarea
                name="visited_accounts"
                value={form.visited_accounts}
                onChange={handleChange}
                rows={3}
                placeholder="أدخل أسماء الحسابات المزارة..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8CFF] focus:border-transparent transition resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full py-3 rounded-xl text-white font-bold text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
              style={{ backgroundColor: "#1A8CFF" }}
            >
              {submitting ? "جار الإرسال..." : "إرسال التقرير"}
            </button>
          </form>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-gray-400">
        © {new Date().getFullYear()} جوال - نظام التقارير اليومية
      </footer>
    </div>
  );
}
