"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { KpiCard } from "@/components/admin/kpi-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, getFirstDayOfMonth, getTodayString } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { TrendingUp, Wallet, MapPin, DollarSign } from "lucide-react";

interface Report {
  id: string;
  report_date: string;
  jawwal_revenue: number;
  paltel_revenue: number;
  collections: number;
  visits_count: number;
  employees: { name: string } | null;
}

interface EmployeeSummary {
  name: string;
  jawwal: number;
  paltel: number;
  collections: number;
  visits: number;
  days: number;
}

interface DailySummary {
  date: string;
  jawwal: number;
  paltel: number;
  collections: number;
}

export default function MonthlyPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(getFirstDayOfMonth());
  const [to, setTo] = useState(getTodayString());

  useEffect(() => {
    if (!from || !to) return;
    setLoading(true);
    const supabase = createBrowserClient();
    supabase
      .from("daily_reports")
      .select(
        "id, report_date, jawwal_revenue, paltel_revenue, collections, visits_count, employees(name)"
      )
      .gte("report_date", from)
      .lte("report_date", to)
      .order("report_date")
      .then(({ data }) => {
        setReports((data as unknown as Report[]) ?? []);
        setLoading(false);
      });
  }, [from, to]);

  // Build employee summaries
  const employeeMap = new Map<string, EmployeeSummary>();
  for (const r of reports) {
    const name = r.employees?.name ?? "غير معروف";
    const prev = employeeMap.get(name) ?? { name, jawwal: 0, paltel: 0, collections: 0, visits: 0, days: 0 };
    employeeMap.set(name, {
      name,
      jawwal: prev.jawwal + (r.jawwal_revenue ?? 0),
      paltel: prev.paltel + (r.paltel_revenue ?? 0),
      collections: prev.collections + (r.collections ?? 0),
      visits: prev.visits + (r.visits_count ?? 0),
      days: prev.days + 1,
    });
  }
  const employeeSummaries = Array.from(employeeMap.values()).sort((a, b) => b.jawwal - a.jawwal);

  // Build daily summaries
  const dailyMap = new Map<string, DailySummary>();
  for (const r of reports) {
    const date = r.report_date;
    const prev = dailyMap.get(date) ?? { date, jawwal: 0, paltel: 0, collections: 0 };
    dailyMap.set(date, {
      date,
      jawwal: prev.jawwal + (r.jawwal_revenue ?? 0),
      paltel: prev.paltel + (r.paltel_revenue ?? 0),
      collections: prev.collections + (r.collections ?? 0),
    });
  }
  const dailySummaries = Array.from(dailyMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const totalJawwal = employeeSummaries.reduce((s, e) => s + e.jawwal, 0);
  const totalPaltel = employeeSummaries.reduce((s, e) => s + e.paltel, 0);
  const totalCollections = employeeSummaries.reduce((s, e) => s + e.collections, 0);
  const totalVisits = employeeSummaries.reduce((s, e) => s + e.visits, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">التقارير الشهرية</h1>
        <p className="text-sm text-gray-500 mt-1">ملخص أداء الموظفين للفترة المحددة</p>
      </div>

      {/* Date Range */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
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
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="إيرادات جوال" value={formatCurrency(totalJawwal)} icon={<TrendingUp className="h-5 w-5" />} />
        <KpiCard title="إيرادات بالتل" value={formatCurrency(totalPaltel)} icon={<DollarSign className="h-5 w-5" />} />
        <KpiCard title="التحصيلات" value={formatCurrency(totalCollections)} icon={<Wallet className="h-5 w-5" />} />
        <KpiCard title="إجمالي الزيارات" value={totalVisits} icon={<MapPin className="h-5 w-5" />} />
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400">جار التحميل...</div>
      ) : (
        <>
          {/* Bar Chart - Revenue by Employee */}
          {employeeSummaries.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-4">الإيرادات حسب الموظف</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={employeeSummaries} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelStyle={{ fontFamily: "inherit" }}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <Legend />
                  <Bar dataKey="jawwal" name="جوال" fill="#1A8CFF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="paltel" name="بالتل" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Line Chart - Daily Totals */}
          {dailySummaries.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-4">الإيرادات اليومية</h2>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={dailySummaries} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="jawwal" name="جوال" stroke="#1A8CFF" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="paltel" name="بالتل" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="collections" name="التحصيلات" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Summary Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">ملخص الموظفين</h2>
            </div>
            {employeeSummaries.length === 0 ? (
              <div className="py-12 text-center text-gray-400">لا توجد بيانات للفترة المحددة</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>أيام العمل</TableHead>
                    <TableHead>إيرادات جوال</TableHead>
                    <TableHead>إيرادات بالتل</TableHead>
                    <TableHead>التحصيلات</TableHead>
                    <TableHead>الزيارات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeSummaries.map((emp) => (
                    <TableRow key={emp.name}>
                      <TableCell className="font-semibold text-gray-900">{emp.name}</TableCell>
                      <TableCell>{emp.days}</TableCell>
                      <TableCell>{formatCurrency(emp.jawwal)}</TableCell>
                      <TableCell>{formatCurrency(emp.paltel)}</TableCell>
                      <TableCell>{formatCurrency(emp.collections)}</TableCell>
                      <TableCell>{emp.visits}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
