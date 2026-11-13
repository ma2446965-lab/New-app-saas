"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  User,
  Shield,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/i18n/useTranslation";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

interface SidebarProps {
  user: any;
  onLogout: () => void;
  isAdmin?: boolean;
}

const items = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/dashboard/invoices", label: "فواتيري", icon: FileText },
  { href: "/dashboard/clients", label: "العملاء", icon: Users },
  { href: "/dashboard/subscription", label: "الاشتراك", icon: CreditCard },
  { href: "/dashboard/profile", label: "الملف الشخصي", icon: User },
];

export function Sidebar({ user, onLogout, isAdmin }: SidebarProps) {
  const { lang, isRTL } = useTranslation();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    setCollapsed(window.innerWidth < 768);
  }, []);

  return (
    <aside
      className={`fixed inset-0 z-50 flex w-72 flex-col border-r glass-surface transform transition-transform duration-300 ${isRTL ? "-right-full" : "-left-full"} ${collapsed ? "translate-x-0" : ""}`}
    >
      <div className="flex h-14 items-center justify-between border-b border-border-subtle px-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-neon-blue-600 to-electric-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-glow-purple">
            F
          </div>
          <span className="font-bold text-sm text-text-primary">فاتورة SaaS</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="border border-border-subtle"
          onClick={() => setCollapsed(false)}
          aria-label="إغلاق الشريط الجانبي"
        >
          <ChevronLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
        </Button>
      </div>

      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Button
              key={item.href}
              asChild
              variant={active ? "default" : "ghost"}
              className={`w-full justify-start text-sm gap-2 px-3 py-2.5 rounded-xl ${active ? "glass-card shadow-glow-blue" : ""}`}
              as={Link}
              href={item.href}
            >
              <Icon className="w-4 h-4" /> {item.label}
            </Button>
          );
        })}

        {isAdmin && (
          <div className="border-t border-border-subtle pt-3 mt-3 space-y-0.5">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start text-sm gap-2 px-3 py-2.5 rounded-xl"
              as={Link}
              href="/admin"
            >
              <Shield className="w-4 h-4 mr-2" /> لوحة الإدارة
            </Button>
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-border-subtle">
        <Button variant="outline" size="sm" className="w-full justify-start text-sm gap-2 px-3 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" /> تسجيل الخروج
        </Button>
        <div className="mt-2 flex items-center justify-center">
          <LanguageSwitcher />
        </div>
      </div>
    </aside>
  );
}