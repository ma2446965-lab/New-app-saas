export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Globe, Languages, Bell, Shield, User } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <div className="space-y-8 page-transition animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">الإعدادات</h1>
          <p className="text-text-muted">إدارة تفضيلات حسابك وإعدادات المنصة</p>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="glass-card rounded-2xl overflow-hidden border border-border-subtle">
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-neon-blue-400" />
            <CardTitle className="text-lg">الملف الشخصي</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Label>الاسم الكامل</Label>
              <Input defaultValue={profile.full_name || ""} className="glass-input" />
            </div>
            <div className="space-y-4">
              <Label>البريد الإلكتروني</Label>
              <Input type="email" defaultValue={profile.email || ""} className="glass-input" />
            </div>
            <div className="space-y-4">
              <Label>رقم الهاتف</Label>
              <Input defaultValue={profile.phone || ""} className="glass-input" />
            </div>
            <div className="space-y-4">
              <Label>رقم الحساب</Label>
              <Input defaultValue={profile.account_id || ""} className="glass-input" />
            </div>
          </div>
          <Button className="shadow-glow-purple">حفظ التغييرات</Button>
        </CardContent>
      </div>

      {/* Appearance Settings */}
      <div className="glass-card rounded-2xl overflow-hidden border border-border-subtle">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-electric-purple-400" />
            <CardTitle className="text-lg">المظهر واللغة</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text-primary">القالب اللوني</h3>
                <p className="text-sm text-text-muted">الوضع الدافئ (الافتراضي) أو الوضع الفاتح</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="w-8 h-8 rounded-full bg-black border-2 border-neon-blue-400" title="Dark Mode">
                  <Moon className="w-4 h-4 text-white" />
                </button>
                <button className="w-8 h-8 rounded-full bg-white border-2 border-gray-300" title="Light Mode">
                  <Sun className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <h3 className="font-medium text-text-primary">اللغة</h3>
                <p className="text-sm text-text-muted">العربية أو الإنجليزية</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl bg-gradient-to-br from-neon-blue-600 to-electric-purple-600 text-white text-sm font-medium">
                  <Languages className="w-3 h-3 mr-1.5" /> العربية
                </button>
                <button className="px-4 py-2 rounded-xl border border-border-subtle bg-transparent text-text-secondary text-sm hover:text-text-primary">
                  <Languages className="w-3 h-3 mr-1.5" /> English
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
              <div>
                <h3 className="font-medium text-text-primary">إشعارات البريد الإلكتروني</h3>
                <p className="text-sm text-text-muted">تلقي إشعارات بالفواتير والمدفوعات</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
              <div>
                <h3 className="font-medium text-text-primary">إشعارات الدفع المتأخر</h3>
                <p className="text-sm text-text-muted">إعلامك عند تأخر العملاء في السداد</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </div>

      {/* Account Info */}
      <div className="glass-card rounded-2xl overflow-hidden border border-border-subtle">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-neon-blue-400" />
            <CardTitle className="text-lg">معلومات الحساب</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-primary">حالة الاشتراك</p>
                <p className="text-xs text-text-muted">{profile.subscription_status}</p>
              </div>
              <Badge variant={profile.subscription_status === "active" ? "success" : "default"}>
                {profile.subscription_status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text.primary">الخطة الحالية</p>
                <p className="text-xs text-text-muted">{profile.subscription_plan || "—"}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => (location.href = "/dashboard/subscription")}>
                إدارة الاشتراك
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text.primary">تاريخ الانضمام</p>
                <p className="text-xs text-text-muted">{new Date(profile.created_at).toLocaleDateString("ar-EG")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  );
}