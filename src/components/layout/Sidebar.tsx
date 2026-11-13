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
  Settings,
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
  { href: "/dashboard", label: "dashboard", icon: LayoutDashboard },
  { href: "/dashboard/invoices", label: "myInvoices", icon: FileText },
  { href: "/dashboard/clients", label: "clients", icon: Users },
  { href: "/dashboard/subscription", label: "subscription", icon: CreditCard },
  { href: "/dashboard/profile", label: "profile", icon: User },
];

export function Sidebar({ user, onLogout, isAdmin }: SidebarProps) {
  const { lang, changeLanguage, isRTL } = useTranslation();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Collapse on mobile
    setCollapsed(window.innerWidth < 768);
  }, []);

  return (
    <aside
      className={`
        fixed inset-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 transform
        ${isRTL ? "-right-full" : "-left-full"}
        ${collapsed ? "translate-x-0" : ""}
      `}
    >
      <div className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            F
          </div>
          <span className="font-bold text-sm">فاتورة SaaS</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          aria-label="Close sidebar"
        >
          <ChevronLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Button
              key={item.href}
              asChild
              variant={active ? "default" : "ghost"}
              className="w-full justify-start text-sm gap-2 px-2"
              as={Link}
              href={item.href}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Button>
          );
        })}

        {isAdmin && (
          <div className="border-t pt-3 mt-3 space-y-1">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start text-sm gap-2 px-2"
              as={Link}
              href="/admin"
            >
              <Shield className="w-4 h-4 mr-2" /> لوحة الإدارة
            </Button>
          </div>
        )}
      </nav>

      <div className="p-3 border-t">
        <Button variant="outline" size="sm" className="w-full justify-start text-sm gap-2 px-2" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" /> تسجيل الخروج
        </Button>
        <LanguageSwitcher />
      </div>
    </aside>
  );
}
