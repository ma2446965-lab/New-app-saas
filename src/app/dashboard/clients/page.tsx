"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Users } from "lucide-react";
import { clientSchema } from "@/lib/validations";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";

export default function ClientsPage() {
  const supabase = createClientComponentClient();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", tax_number: "", address: "" });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadClients();
    const h = () => loadClients();
    window.addEventListener("clients-updated", h);
    window.addEventListener("invoice-created", h);
    return () => {
      window.removeEventListener("clients-updated", h);
      window.removeEventListener("invoice-created", h);
    };
  }, []);

  const loadClients = async () => {
    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    if (!error) setClients(data || []);
    setLoading(false);
  };

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("clients").insert({
        user_id: user?.id,
        ...form,
      });
      if (error) throw error;
      setToast({ msg: "تم إضافة العميل بنجاح", type: "success" });
      setForm({ name: "", email: "", phone: "", tax_number: "", address: "" });
      setOpen(false);
      loadClients();
    } catch (err: any) {
      setToast({ msg: err.message || "فشل الإضافة", type: "error" });
    } finally { setCreating(false); }
  };

  const removeClient = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف العميل؟")) return;
    await supabase.from("clients").delete().eq("id", id);
    loadClients();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-24 h-24 rounded-full mx-auto mb-4" />
        <h2 className="text-text-muted text-center">جاري التحميل...</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 page-transition animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue-600 to-electric-purple-600 flex items-center justify-center text-white shadow-glow-purple">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">العملاء</h1>
            <p className="text-text-muted">إدارة قائمة عملائك ومعلوماتهم</p>
          </div>
        </div>
        <Button onClick={() => setOpen(true)} className="shadow-glow-purple hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]">
          <Plus className="w-4 h-4 mr-2" /> عميل جديد
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card className="glass-card p-12 text-center animate-fade-in">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-bold text-text-primary mb-2">لا توجد عملاء بعد</h2>
          <p className="text-text-muted">ابدأ بإضافة عميل أول لإنشاء الفواتير له</p>
          <Button onClick={() => setOpen(true)} className="mt-4 shadow-glow-purple">
            <Plus className="w-4 h-4 mr-2" /> إضافة عميل جديد
          </Button>
        </Card>
      ) : (
        <Card className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-bg-card-hover border-b border-border-subtle">
                <tr>
                  <th className="pb-4 pr-4 text-xs font-medium text-text-muted uppercase tracking-wider">الاسم</th>
                  <th className="pb-4 pr-4 text-xs font-medium text-text-muted uppercase tracking-wider">البريد</th>
                  <th className="pb-4 pr-4 text-xs font-medium text-text-muted uppercase tracking-wider">الهاتف</th>
                  <th className="pb-4 pr-4 text-xs font-medium text-text-muted uppercase tracking-wider">الرقم الضريبي</th>
                  <th className="pb-4 text-xs font-medium text-text-muted uppercase tracking-wider text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-bg-card-hover transition-colors group">
                    <td className="py-4 pr-4 text-text-primary">{c.name}</td>
                    <td className="py-4 pr-4 text-text-secondary">{c.email || "—"}</td>
                    <td className="py-4 pr-4 text-text-secondary">{c.phone || "—"}</td>
                    <td className="py-4 pr-4 text-xs text-text-muted">{c.tax_number || "—"}</td>
                    <td className="py-4 text-center">
                      <Button size="sm" variant="destructive" onClick={() => removeClient(c.id)} className="p-1.5 hover:bg-red-500/10">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div aria-hidden={!open ? "true" : "false"} className={open ? "" : "hidden fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in"} aria-modal="true" role="dialog">
        <Card className="w-full max-w-md glass-card animate-scale-in">
          <CardHeader>
            <CardTitle className="text-text-primary">إضافة عميل جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addClient} className="space-y-5">
              <div className="flex flex-col gap-1">
                <Label>اسم العميل *</Label>
                <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required className="glass-input" />
              </div>
              <div className="flex flex-col gap-1">
                <Label>بريد إلكتروني</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="glass-input" />
              </div>
              <div className="flex flex-col gap-1">
                <Label>هاتف</Label>
                <Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="glass-input" />
              </div>
              <div className="flex flex-col gap-1">
                <Label>الرقم الضريبي</Label>
                <Input value={form.tax_number} onChange={(e) => setForm({...form, tax_number: e.target.value})} className="glass-input" />
              </div>
              <div className="flex flex-col gap-1">
                <Label>العنوان</Label>
                <Input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="glass-input" />
              </div>
              {toast && (
                <div className={`p-3 rounded-lg text-sm font-medium border ${toast.type === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                  {toast.msg}
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="glass-card">إلغاء</Button>
                <Button type="submit" disabled={creating} className="shadow-glow-purple hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                  {creating ? "جاري..." : "إضافة العميل"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}