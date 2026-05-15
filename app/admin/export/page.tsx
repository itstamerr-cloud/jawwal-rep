"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getFirstDayOfMonth, getTodayString } from "@/lib/utils";
import { Download } from "lucide-react";

interface Report {
  id: string;
  report_date: string;
  jawwal_revenue: number;
  paltel_revenue: number;
  collections: number;
  visits_count: number;
  visited_accounts: string | null;
  submitted_at: string;
  updated_at: string;
  employees: { name: string } | null;
}

export default function ExportPage() {
  const [from, setFrom] = useState(getFirstDayOfMonth());
  const [to, setTo] = useState(getTodayString());
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!from || !to) {
      toast.error("يرجى تحديد نطاق التاريخ");
      return;
    }

    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("daily_reports")
        .select(
          "id, report_date, jawwal_revenue, paltel_revenue, collections, visits_count, visited_accounts, submitted_at, updated_at, employees(name)"
        )
        .gte("report_date", from)
        .lte("report_date", to)
        .order("report_date")
        .order("employees(name)");

      if (error) throw new Error(error.message);

      const reports = (data as unknown as Report[]) ?? [];

      if (reports.length === 0) {
        toast.info("لا توجد بيانات للفترة المحددة");
        return;
      }

      // Dynamic import of xlsx to avoid SSR issues
      const XLSX = await import("xlsx");

      const rows = reports.map((r) => ({
        التاريخ: r.report_date,
        الموظف: r.employees?.name ?? "-",
        "إيرادات جوال (₪)": r.jawwal_revenue ?? 0,
        "إيرادات بالتل (₪)": r.paltel_revenue ?? 0,
        "التحصيلات (₪)": r.collections ?? 0,
        "عدد الزيارات": r.visits_count ?? 0,
        "الحسابات المزارة": r.visited_accounts ?? "",
        "وقت الإرسال": r.submitted_at
          ? new Date(r.submitted_at).toLocaleString("ar")
          : "",
        "آخر تحديث": r.updated_at
          ? new Date(r.updated_at).toLocaleString("ar")
          : "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Set column widths
      worksheet["!cols"] = [
        { wch: 14 }, // date
        { wch: 20 }, // employee
        { wch: 18 }, // jawwal revenue
        { wch: 18 }, // paltel revenue
        { wch: 16 }, // collections
        { wch: 14 }, // visits
        { wch: 30 }, // visited accounts
        { wch: 22 }, // submitted at
        { wch: 22 }, // updated at
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "تقارير جوال");

      const fileName = `تقارير_جوال_${from}_${to}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success(`تم تصدير ${reports.length} سجل بنجاح`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل التصدير");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">تصدير البيانات</h1>
        <p className="text-sm text-gray-500 mt-1">تصدير تقارير المبيعات إلى ملف Excel</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-5">اختر نطاق التاريخ</h2>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">من</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8CFF] focus:border-transparent"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">إلى</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8CFF] focus:border-transparent"
            />
          </div>
          <Button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {loading ? "جار التصدير..." : "تصدير Excel"}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700 font-medium">ملاحظة</p>
          <p className="text-sm text-blue-600 mt-1">
            سيتم تضمين جميع الحقول: التاريخ، الموظف، إيرادات جوال، إيرادات بالتل، التحصيلات،
            عدد الزيارات، الحسابات المزارة، ووقت الإرسال.
          </p>
        </div>
      </div>

      {/* Preview info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-3">محتوى الملف</h2>
        <div className="overflow-x-auto">
          <table className="text-sm text-right w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {[
                  "التاريخ",
                  "الموظف",
                  "إيرادات جوال",
                  "إيرادات بالتل",
                  "التحصيلات",
                  "الزيارات",
                  "الحسابات المزارة",
                  "وقت الإرسال",
                ].map((col) => (
                  <th
                    key={col}
                    className="border border-gray-200 px-3 py-2 text-gray-600 font-semibold whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="border border-gray-200 px-3 py-4 text-center text-gray-400">
                  مثال على البيانات المُصدَّرة
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
