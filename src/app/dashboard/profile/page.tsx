"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "" });

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
      alert("تم حفظ التغييرات");
    } else {
      alert("فشل الحفظ: " + error.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="py-10 text-center">جاري التحميل...</div>;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
      <Card>
        <CardHeader><CardTitle>تعديل البيانات</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={update} className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label>الاسم الكامل</Label>
              <Input value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} required />
            </div>
            <div className="flex flex-col gap-1">
              <Label>رقم الهاتف</Label>
              <Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
            </div>
            <Button type="submit" disabled={saving} className="w-full">{saving ? "جاري..." : "حفظ التغييرات"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>معلومات الحساب</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm"><span className="text-gray-600">البريد الإلكتروني</span><span className="font-medium">{profile?.email}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">رقم الحساب (Account ID)</span><span className="font-mono font-medium">{profile?.account_id}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">تاريخ الانضمام</span><span className="font-medium">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString("ar-EG") : "—"}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">حالة الاشتراك</span><span className={`font-medium ${profile?.subscription_status === "active" ? "text-green-600" : "text-gray-600"}`}>{profile?.subscription_status}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">الخطة</span><span className="font-medium">{profile?.subscription_plan || "—"}</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
