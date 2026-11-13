"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { clientSchema } from "@/lib/validations";
import { z } from "zod";

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
      setToast({ msg: "تم إضافة العميل", type: "success" });
      setForm({ name: "", email: "", phone: "", tax_number: "", address: "" });
      setOpen(false);
      loadClients();
    } catch (err: any) {
      setToast({ msg: err.message || "فشل الإضافة", type: "error" });
    } finally { setCreating(false); }
  };

  const removeClient = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف العميل؟")) return;
    await supabase.from("clients").delete().eq("id", id);
    loadClients();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">العملاء</h1>
        <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> عميل جديد</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-b border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="pb-3 text-gray-500 font-medium">الاسم</th>
              <th className="pb-3 text-gray-500 font-medium">البريد</th>
              <th className="pb-3 text-gray-500 font-medium">الهاتف</th>
              <th className="pb-3 text-gray-500 font-medium">الرقم الضريبي</th>
              <th className="pb-3 text-gray-500 font-medium text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="py-10 text-center text-gray-500">جاري التحميل...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-gray-500">لا توجد عملاء بعد</td></tr>
            ) : (
              clients.map((c) => (
                <tr key={c.id}>
                  <td className="py-3">{c.name}</td>
                  <td className="py-3 text-gray-600">{c.email || "—"}</td>
                  <td className="py-3">{c.phone || "—"}</td>
                  <td className="py-3 text-xs text-gray-500">{c.tax_number || "—"}</td>
                  <td className="py-3 text-center">
                    <Button size="sm" variant="destructive" onClick={() => removeClient(c.id)} className="p-1.5">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={`fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 ${open ? "" : "hidden"}`} aria-hidden={!open}>
        <Card className="w-full max-w-md bg-white">
          <CardHeader><CardTitle>إضافة عميل جديد</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={addClient} className="space-y-4">
              <div className="flex flex-col gap-1">
                <Label>اسم العميل *</Label>
                <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="flex flex-col gap-1">
                <Label>بريد إلكتروني</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>هاتف</Label>
                <Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>الرقم الضريبي</Label>
                <Input value={form.tax_number} onChange={(e) => setForm({...form, tax_number: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>العنوان</Label>
                <Input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
              </div>
              {toast && (
                <div className={`p-3 rounded text-sm ${toast.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{toast.msg}</div>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
                <Button type="submit" disabled={creating}>{creating ? "جاري..." : "إضافة العميل"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
