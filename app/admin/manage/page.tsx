"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus, Users } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export default function ManagePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchEmployees = async () => {
    const res = await fetch("/api/admin/employees");
    const data = await res.json();
    setEmployees(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("يرجى إدخال اسم الموظف");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "فشل الإضافة");
      }
      const emp = await res.json();
      setEmployees((prev) => [...prev, emp].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      toast.success(`تم إضافة الموظف "${emp.name}" بنجاح`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ ما");
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (emp: Employee) => {
    setTogglingId(emp.id);
    try {
      const res = await fetch(`/api/admin/employees/${emp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !emp.is_active }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "فشل التحديث");
      }
      const updated = await res.json();
      setEmployees((prev) => prev.map((e) => (e.id === emp.id ? updated : e)));
      toast.success(
        updated.is_active
          ? `تم تفعيل الموظف "${updated.name}"`
          : `تم تعطيل الموظف "${updated.name}"`
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ ما");
    } finally {
      setTogglingId(null);
    }
  };

  const activeCount = employees.filter((e) => e.is_active).length;
  const inactiveCount = employees.filter((e) => !e.is_active).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة الموظفين</h1>
        <p className="text-sm text-gray-500 mt-1">إضافة وتعديل حالات الموظفين</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
          <p className="text-sm text-gray-500 mt-1">إجمالي الموظفين</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-sm text-gray-500 mt-1">نشطون</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-400">{inactiveCount}</p>
          <p className="text-sm text-gray-500 mt-1">غير نشطين</p>
        </div>
      </div>

      {/* Add Employee */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-[#1A8CFF]" />
          إضافة موظف جديد
        </h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="اسم الموظف..."
            className="flex-1"
            disabled={adding}
          />
          <Button type="submit" disabled={adding}>
            {adding ? "جار الإضافة..." : "إضافة"}
          </Button>
        </form>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500" />
          <h2 className="font-bold text-gray-800">قائمة الموظفين</h2>
        </div>
        {loading ? (
          <div className="py-16 text-center text-gray-400">جار التحميل...</div>
        ) : employees.length === 0 ? (
          <div className="py-16 text-center text-gray-400">لا يوجد موظفون بعد</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الإضافة</TableHead>
                <TableHead>تفعيل / تعطيل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-semibold text-gray-900">{emp.name}</TableCell>
                  <TableCell>
                    <Badge variant={emp.is_active ? "success" : "secondary"}>
                      {emp.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {new Date(emp.created_at).toLocaleDateString("ar")}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={emp.is_active}
                      onCheckedChange={() => handleToggleActive(emp)}
                      disabled={togglingId === emp.id}
                      aria-label={`تبديل حالة ${emp.name}`}
                    />
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
