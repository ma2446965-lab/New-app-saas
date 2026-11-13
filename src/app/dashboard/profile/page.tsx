"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from "@/lib/supabase/client";
import { User, Mail, Phone, Clock } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    (async () => {
      const sb = createClientComponentClient();
      const { data: { user } } = await sb.auth.getUser();
      const { data } = await sb.from("profiles").select("*").eq("id", user?.id).single();
      setProfile(data);
      setForm({ full_name: data?.full_name || "", phone: data?.phone || "" });
      setLoading(false);
    })();
  }, []);

  const update = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const sb = createClientComponentClient();
    const { data: { user } } = await sb.auth.getUser();
    const { error } = await sb.from("profiles").update({ full_name: form.full_name, phone: form.phone }).eq("id", user?.id);
    if (!error) {
      setProfile({ ...profile, full_name: form.full_name, phone: form.phone });
      setToast({ msg: "تم حفظ التغييرات بنجاح", type: "success" });
    } else {
      setToast({ msg: "فشل الحفظ: " + error.message, type: "error" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-24 h-24 rounded-full mx-auto mb-4" />
        <h2 className="text-text-muted text-center">جاري التحميل...</h2>
      </div>
    );
  }

  const trialActive =
    profile?.subscription_status === "trial" &&
    profile?.trial_ends_at &&
    new Date(profile.trial_ends_at) > new Date();

  return (
    <div className="max-w-2xl mx-auto space-y-8 page-transition animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue-600 to-electric-purple-600 flex items-center justify-center text-white shadow-glow-purple">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">الملف الشخصي</h1>
            <p className="text-text-muted">إدارة بيانات حسابك ومعلومات الاشتراك</p>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="glass-card p-6">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-blue-600 to-electric-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-glow-purple shrink-0">
            {profile?.full_name?.charAt(0) || "U"}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-text-primary">{profile?.full_name || "مستخدم"}</h2>
            <p className="text-text-secondary">{profile?.email}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-bg-card-hover text-xs font-medium text-text-secondary border border-border-subtle">
                <User className="w-3 h-3" /> {profile?.account_id || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Trial badge */}
        {trialActive && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6 animate-pulse-glow">
            <Clock className="w-4 h-4" />
            <span>تجربة مجانية متبقي</span>
            <span className="text-amber-300 font-bold">{Math.ceil((new Date(profile.trial_ends_at!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} أيام</span>
          </div>
        )}

        <hr className="border-border-subtle mb-6" />

        {/* Edit Form */}
        <CardHeader className="pb-4 border-b border-border-subtle">
          <CardTitle className="text-text-primary">تعديل البيانات الشخصية</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={update} className="space-y-5">
            <div className="flex flex-col gap-1">
              <Label>الاسم الكامل *</Label>
              <Input value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} required className="glass-input" />
            </div>
            <div className="flex flex-col gap-1">
              <Label>رقم الهاتف</Label>
              <Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="glass-input" />
            </div>
            {toast && (
              <div className={`p-3 rounded-lg text-sm font-medium border ${toast.type === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                {toast.msg}
              </div>
            )}
            <Button type="submit" disabled={saving} className="shadow-glow-purple hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] w-full">
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="glass-card p-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-text-muted" />
            <CardTitle className="text-text-primary">معلومات الحساب</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-bg-card-hover border border-border-subtle">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-text-muted" />
              <span className="text-text-muted text-sm">البريد الإلكتروني</span>
            </div>
            <span className="text-text-primary font-medium">{profile?.email}</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-bg-card-hover border border-border-subtle">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-text-muted" />
              <span className="text-text-muted text-sm">رقم الهاتف</span>
            </div>
            <span className="text-text-primary font-medium">{profile?.phone || "—"}</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-bg-card-hover border border-border-subtle">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-text-muted" />
              <span className="text-text-muted text-sm">تاريخ الانضمام</span>
            </div>
            <span className="text-text-primary font-mono text-sm">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString("ar-EG") : "—"}</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-bg-card-hover border border-border-subtle">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-text-muted" />
              <span className="text-text-muted text-sm">حالة الاشتراك</span>
            </div>
            <span className={`font-medium text-sm ${profile?.subscription_status === "active" ? "text-emerald-400" : profile?.subscription_status === "trial" ? "text-amber-400" : "text-red-400"}`}>
              {profile?.subscription_status === "active" ? "نشط" : profile?.subscription_status === "trial" ? "تجربة مجانية" : profile?.subscription_status}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}