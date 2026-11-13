"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";

export default function AdminLogin() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("بيانات دخول غير صحيحة");
      location.replace("/admin");
    } catch (err: any) {
      setError(err.message || "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">تسجيل دخول الإدارة</CardTitle>
          <CardDescription>هذه الصفحة مخصصة للمدير الفائق فقط.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">بريد الإدارة</Label>
              <Input id="email" name="email" type="email" placeholder="ma24469655@gmail.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة مرور الإدارة</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-100">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري..." : <><LogIn className="w-4 h-4 mr-2" /> تسجيل الدخول كمدير</>}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-xs text-gray-500">
          كلمة المرور تُضبط عبر متغير البيئة ADMIN_PASSWORD_HASH (هاش bcrypt).
        </CardFooter>
      </Card>
    </div>
  );
}
