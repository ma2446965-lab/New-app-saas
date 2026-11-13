import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNowStrict, parseISO, isValid } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyEGP(amount: number, lang = "ar"): string {
  return new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, lang = "ar"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "-";
  const locale = lang === "ar" ? ar : enUS;
  return format(d, "dd MMMM yyyy", { locale });
}

export function formatDateTime(date: string | Date, lang = "ar"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "-";
  const locale = lang === "ar" ? ar : enUS;
  return format(d, "dd MMMM yyyy - hh:mm a", { locale });
}

export function formatRelative(date: string | Date, lang = "ar"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "-";
  const locale = lang === "ar" ? ar : enUS;
  return formatDistanceToNowStrict(d, { addSuffix: true, locale });
}

export function generateAccountId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "ACC-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function isArabic(lang: string): boolean {
  return lang === "ar";
}
