"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
  LogIn,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/dashboard/invoices", label: "فواتيري", icon: FileText },
  { href: "/dashboard/clients", label: "العملاء", icon: Users },
  { href: "/dashboard/subscription", label: "الاشتراك", icon: CreditCard },
  { href: "/dashboard/profile", label: "الملف الشخصي", icon: User },
];

export function Navbar({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b glass-surface">
      <div className="flex h-14 shrink-0 items-center gap-1.5 px-4 md:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-neon-blue-600 to-electric-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-glow-blue">
            F
          </div>
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-text-primary"
            onClick={(e) => {
              if (pathname !== "/") {
                e.preventDefault();
                router.push("/");
              }
            }}
          >
            فاتورة SaaS
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />

          {user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:block"
                onClick={handleLogout}
              >
                <LogOut className="w-3 h-3 mr-1.5" /> تسجيل الخروج
              </Button>
              <Button
                asChild
                size="sm"
                className="hidden md:flex items-center gap-1"
                as={Link}
                href="/dashboard"
              >
                <LayoutDashboard className="w-3 h-3" /> لوحة التحكم
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:block"
                asChild
                as={Link}
                href="/login"
              >
                <LogIn className="w-3 h-3 mr-1.5" /> تسجيل الدخول
              </Button>
              <Button size="sm" className="hidden md:block" asChild as={Link} href="/register">
                إنشاء حساب
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden border border-border-subtle"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="فتح القائمة"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && user && (
        <div className="md:hidden border-b border-border-subtle p-4 glass-surface z-[60]">
          <div className="space-y-2 animate-slide-up">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "default" : "ghost"}
                  className="w-full justify-start text-left gap-2 px-2 py-2.5 rounded-xl"
                  as={Link}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </Button>
              );
            })}
            <Button
              onClick={handleLogout}
              className="w-full justify-start text-left text-red-400 gap-2 px-2 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5"
            >
              <LogOut className="w-4 h-4 mr-2" /> تسجيل الخروج
            </Button>
          </div>
        </div>
      )}

      {/* Desktop nav links (auth only) */}
      {!user && (
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5">
          <Button variant="outline" size="sm" asChild as={Link} href="/login">
            تسجيل الدخول
          </Button>
          <Button size="sm" asChild as={Link} href="/register">
            إنشاء حساب
          </Button>
        </div>
      )}
    </nav>
  );
}