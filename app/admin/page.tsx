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
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatTime, getTodayString } from "@/lib/utils";
import { TrendingUp, Wallet, Users, MapPin, DollarSign } from "lucide-react";

interface Report {
  id: string;
  report_date: string;
  jawwal_revenue: number;
  paltel_revenue: number;
  collections: number;
  visits_count: number;
  visited_accounts: string | null;
  submitted_at: string;
  employees: { name: string }[] | null;
}

export default function AdminDashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const today = getTodayString();

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase
      .from("daily_reports")
      .select(
        "id, report_date, jawwal_revenue, paltel_revenue, collections, visits_count, visited_accounts, submitted_at, employees(name)"
      )
      .eq("report_date", today)
      .order("submitted_at", { ascending: false })
      .then(({ data }) => {
        setReports((data as Report[]) ?? []);
        setLoading(false);
      });
  }, [today]);

  const totalJawwal = reports.reduce((s, r) => s + (r.jawwal_revenue ?? 0), 0);
  const totalPaltel = reports.reduce((s, r) => s + (r.paltel_revenue ?? 0), 0);
  const totalCollections = reports.reduce((s, r) => s + (r.collections ?? 0), 0);
  const totalVisits = reports.reduce((s, r) => s + (r.visits_count ?? 0), 0);
  const employeesCount = reports.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">لوحة اليوم</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(today).toLocaleDateString("ar", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="إيرادات جوال"
          value={formatCurrency(totalJawwal)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KpiCard
          title="إيرادات بالتل"
          value={formatCurrency(totalPaltel)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KpiCard
          title="التحصيلات"
          value={formatCurrency(totalCollections)}
          icon={<Wallet className="h-5 w-5" />}
        />
        <KpiCard
          title="الزيارات"
          value={totalVisits}
          icon={<MapPin className="h-5 w-5" />}
        />
        <KpiCard
          title="الموظفين المُبلِّغين"
          value={employeesCount}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">تقارير اليوم</h2>
        </div>
        {loading ? (
          <div className="py-16 text-center text-gray-400">جار التحميل...</div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            لا توجد تقارير لهذا اليوم بعد
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الموظف</TableHead>
                <TableHead>إيرادات جوال</TableHead>
                <TableHead>إيرادات بالتل</TableHead>
                <TableHead>التحصيلات</TableHead>
                <TableHead>الزيارات</TableHead>
                <TableHead>وقت الإرسال</TableHead>
                <TableHead>الحسابات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-semibold text-gray-900">
                    {r.employees?.[0]?.name ?? "-"}
                  </TableCell>
                  <TableCell>{formatCurrency(r.jawwal_revenue)}</TableCell>
                  <TableCell>{formatCurrency(r.paltel_revenue)}</TableCell>
                  <TableCell>{formatCurrency(r.collections)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{r.visits_count}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {formatTime(r.submitted_at)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-gray-500">
                    {r.visited_accounts ?? "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
