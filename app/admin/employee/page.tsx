"use client";

import { useEffect, useState } from "react";
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
} from "recharts";
import { TrendingUp, Wallet, MapPin, DollarSign } from "lucide-react";

interface Employee {
  id: string;
  name: string;
}

interface Report {
  id: string;
  report_date: string;
  jawwal_revenue: number;
  paltel_revenue: number;
  collections: number;
  visits_count: number;
  visited_accounts: string | null;
  submitted_at: string;
}

export default function EmployeeDetailsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(getFirstDayOfMonth());
  const [to, setTo] = useState(getTodayString());

  useEffect(() => {
    fetch("/api/admin/employees")
      .then((r) => r.json())
      .then((data) => setEmployees(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setReports([]);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({ employee_id: selectedId, from, to });
    fetch(`/api/admin/reports?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setReports(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedId, from, to]);

  const totalJawwal = reports.reduce((s, r) => s + (r.jawwal_revenue ?? 0), 0);
  const totalPaltel = reports.reduce((s, r) => s + (r.paltel_revenue ?? 0), 0);
  const totalCollections = reports.reduce((s, r) => s + (r.collections ?? 0), 0);
  const totalVisits = reports.reduce((s, r) => s + (r.visits_count ?? 0), 0);

  const chartData = [...reports]
    .sort((a, b) => a.report_date.localeCompare(b.report_date))
    .map((r) => ({
      date: r.report_date,
      jawwal: r.jawwal_revenue,
      paltel: r.paltel_revenue,
      collections: r.collections,
      visits: r.visits_count,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">تفاصيل الموظف</h1>
        <p className="text-sm text-gray-500 mt-1">عرض تقارير وأداء موظف معين</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5 flex-1 min-w-[180px]">
            <label className="block text-sm font-semibold text-gray-700">الموظف</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8CFF] focus:border-transparent"
            >
              <option value="">اختر الموظف</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
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

      {!selectedId ? (
        <div className="py-16 text-center text-gray-400">اختر موظفاً لعرض تقاريره</div>
      ) : loading ? (
        <div className="py-16 text-center text-gray-400">جار التحميل...</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="إيرادات جوال" value={formatCurrency(totalJawwal)} icon={<TrendingUp className="h-5 w-5" />} />
            <KpiCard title="إيرادات بالتل" value={formatCurrency(totalPaltel)} icon={<DollarSign className="h-5 w-5" />} />
            <KpiCard title="التحصيلات" value={formatCurrency(totalCollections)} icon={<Wallet className="h-5 w-5" />} />
            <KpiCard title="الزيارات" value={totalVisits} icon={<MapPin className="h-5 w-5" />} />
          </div>

          {/* Bar chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-4">الإيرادات اليومية</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="jawwal" name="جوال" fill="#1A8CFF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="paltel" name="بالتل" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Line chart - visits */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-4">الزيارات اليومية</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }} />
                  <Line type="monotone" dataKey="visits" name="الزيارات" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Reports Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">سجل التقارير</h2>
            </div>
            {reports.length === 0 ? (
              <div className="py-12 text-center text-gray-400">لا توجد تقارير للفترة المحددة</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>إيرادات جوال</TableHead>
                    <TableHead>إيرادات بالتل</TableHead>
                    <TableHead>التحصيلات</TableHead>
                    <TableHead>الزيارات</TableHead>
                    <TableHead>الحسابات المزارة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {new Date(r.report_date + "T00:00:00").toLocaleDateString("ar")}
                      </TableCell>
                      <TableCell>{formatCurrency(r.jawwal_revenue)}</TableCell>
                      <TableCell>{formatCurrency(r.paltel_revenue)}</TableCell>
                      <TableCell>{formatCurrency(r.collections)}</TableCell>
                      <TableCell>{r.visits_count}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs text-gray-500">
                        {r.visited_accounts ?? "-"}
                      </TableCell>
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
