import * as React from "react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function KpiCard({ title, value, subtitle, icon, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4",
        className
      )}
    >
      {icon && (
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#1A8CFF]/10 flex items-center justify-center text-[#1A8CFF]">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
