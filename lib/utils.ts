import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "0 ₪";
  return new Intl.NumberFormat("ar", { maximumFractionDigits: 2 }).format(amount) + " ₪";
}

export function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
}

export function getTodayString(): string { return new Date().toISOString().split("T")[0]; }

export function getFirstDayOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
}
