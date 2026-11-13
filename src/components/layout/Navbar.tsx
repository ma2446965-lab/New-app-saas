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
  ChevronRight,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "dashboard", icon: LayoutDashboard },
  { href: "/dashboard/invoices", label: "myInvoices", icon: FileText },
  { href: "/dashboard/clients", label: "clients", icon: Users },
  { href: "/dashboard/subscription", label: "subscription", icon: CreditCard },
  { href: "/dashboard/profile", label: "profile", icon: User },
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
    <nav className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 shrink-0 items-center gap-1.5 px-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            F
          </div>
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
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
          <LanguageSwitcher />

          {user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:block"
                onClick={handleLogout}
              >
                <LogOut className="w-3 h-3 mr-1" /> تسجيل الخروج
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
                <LogIn className="w-3 h-3 mr-1" /> تسجيل الدخول
              </Button>
              <Button size="sm" className="hidden md:block" asChild as={Link} href="/register">
                إنشاء حساب
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && user && (
        <div className="md:hidden border-b border-border p-4 bg-background">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "default" : "ghost"}
                  className="w-full justify-start text-left gap-2 px-2"
                  as={Link}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
            <Button
              onClick={handleLogout}
              className="w-full justify-start text-left text-destructive gap-2 px-2"
            >
              <LogOut className="w-4 h-4 mr-2" /> تسجيل الخروج
            </Button>
          </div>
        </div>
      )}

      {/* Desktop nav links (auth only) */}
      {!user && (
        <div className="hidden md:flex items-center gap-2 px-4 py-1">
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
