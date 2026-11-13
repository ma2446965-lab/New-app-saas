"use client";

import { useState, useEffect, useCallback } from "react";
import {
  createClientComponentClient,
} from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Send, CheckCircle2, Loader2, Download } from "lucide-react";
import { formatCurrencyEGP, formatDate, generateAccountId } from "@/lib/utils";

export function InvoiceManager({ invoices, clients }: any) {
  const supabase = createClientComponentClient();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [clientsList, setClientsList] = useState(clients);
  const [newClient, setNewClient] = useState({
    name: "", email: "", phone: "", tax_number: "", address: ""
  });
  const [form, setForm] = useState({
    client_name: "", client_email: "", client_phone: "", client_tax_number: "",
    items: [{ name: "", quantity: 1, unit_price: 0 }],
    tax_amount: "0", due_date: "", status: "draft" as const
  });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const subtotal = form.items.reduce(
    (s: number, it: any) => s + Number(it.quantity || 0) * Number(it.unit_price || 0),
    0
  );
  const total = subtotal + Number(form.tax_amount || 0);

  const addItem = () =>
    setForm((f) => ({ ...f, items: [...f.items, { name: "", quantity: 1, unit_price: 0 }] }));
  const removeItem = (i: number) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, ix) => ix !== i) }));
  const updateItem = (i: number, field: string, value: any) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((it, ix) =>
        ix === i ? { ...it, [field]: value } : it
      ),
    }));

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const invoice_number = "INV-" + generateAccountId().replace("ACC-", "");
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("invoices").insert({
        user_id: user?.id,
        invoice_number,
        client_name: form.client_name,
        client_email: form.client_email || null,
        client_phone: form.client_phone || null,
        client_tax_number: form.client_tax_number || null,
        items: form.items,
        subtotal,
        tax_amount: Number(form.tax_amount || 0),
        total,
        status: form.status,
        due_date: form.due_date || null,
      });
      if (error) throw error;
      setToast({ msg: "تم إنشاء الفاتورة بنجاح", type: "success" });
      setForm({
        client_name: "", client_email: "", client_phone: "", client_tax_number: "",
        items: [{ name: "", quantity: 1, unit_price: 0 }], tax_amount: "0", due_date: "", status: "draft"
      });
      setOpen(false);
      window.dispatchEvent(new Event("invoice-created"));
    } catch (err: any) {
      setToast({ msg: err.message || "فشل إنشاء الفاتورة", type: "error" });
    } finally {
      setCreating(false);
    }
  };

  const markPaid = async (id: string) => {
    await supabase.from("invoices").update({ status: "paid" }).eq("id", id);
    setToast({ msg: "تم تحديث الفاتورة إلى مدفوعة", type: "success" });
    window.dispatchEvent(new Event("invoice-created"));
  };

  const removeInvoice = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف الفاتورة؟")) return;
    await supabase.from("invoices").delete().eq("id", id);
    window.dispatchEvent(new Event("invoice-created"));
  };

  const sendWhatsApp = (inv: any) => {
    const phone = inv.client_phone;
    if (!phone) return setToast({ msg: "العميل ليس لديه رقم هاتف", type: "error" });
    const text = encodeURIComponent(
      `مطلوب دفع الفاتورة رقم ${inv.invoice_number} بقيمة ${formatCurrencyEGP(inv.total, "ar")} يرجى التواصل معنا`
    );
    window.open(`https://wa.me/${phone.replace(/\s/g, "")}?text=${text}`, "_blank");
  };

  const printInvoice = (inv: any) => {
    const printWindow = window.open("", "_blank");
    printWindow!.document.write(`
      <html><head><title>فاتورة ${inv.invoice_number}</title>
      <style>body{font-family:'Segoe UI',Tahoma,Arial;direction:rtl;padding:20px;background:#0a0a0f;color:#f8fafc;}
      table{width:100%;border-collapse:collapse}th,td{border:1px solid #334155;padding:10px;text-align:right;}
      .total{font-weight:bold;font-size:1.3em;text-align:right;margin-top:24px;color:#3b82f6;}
      h1{text-align:center;color:#3b82f6;text-transform:uppercase;letter-spacing:2px}
      .header{border-bottom:2px solid #3b82f6;padding-bottom:12px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;}
      .badge{display:inline-block;padding:4px 12px;border-radius:6px;background:#1e293b;border:1px solid #3b82f6;color:#3b82f6;font-size:12px;}
      </style></head>
      <body>
      <div class="header">
        <h1>فاتورة ضريبية</div>
        <span class="badge">رقم: ${inv.invoice_number}</span>
      </div>
      <p><strong>العميل:</strong> ${inv.client_name}</p>
      <p><strong>التاريخ:</strong> ${formatDate(inv.created_at, "ar")}</p>
      <table>
        <thead><tr><th>الصنف</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead>
        <tbody>
        ${(inv.items || []).map((it:any)=>`<tr><td>${it.name}</td><td>${it.quantity}</td><td>${it.unit_price}</td><td>${Number(it.quantity)*Number(it.unit_price)}</td></tr>`).join("")}
        </tbody>
      </table>
      <div class="total">الإجمالي: ${formatCurrencyEGP(inv.total, "ar")}</div>
      <script>window.print()</script>
      </body></html>`);
    printWindow!.document.close();
  };

  return (
    <div className="space-y-8">
      {/* Client quick-add */}
      <Card className="glass-card p-6">
        <CardHeader className="pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-neon-blue-400" />
            <CardTitle className="text-sm font-bold text-text-primary">إضافة عميل جديد سريعاً</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-text-muted">اسم العميل</Label>
            <Input value={newClient.name} onChange={(e) => setNewClient({...newClient, name:e.target.value})} placeholder="اسم العميل" className="glass-input" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-text-muted">بريد إلكتروني</Label>
            <Input value={newClient.email} onChange={(e) => setNewClient({...newClient, email:e.target.value})} placeholder="بريد إلكتروني" className="glass-input" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-text-muted">هاتف</Label>
            <Input value={newClient.phone} onChange={(e) => setNewClient({...newClient, phone:e.target.value})} placeholder="هاتف" className="glass-input" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-text-muted">الرقم الضريبي</Label>
            <Input value={newClient.tax_number} onChange={(e) => setNewClient({...newClient, tax_number:e.target.value})} placeholder="الرقم الضريبي" className="glass-input" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-text-muted">العنوان</Label>
            <Input value={newClient.address} onChange={(e) => setNewClient({...newClient, address:e.target.value})} placeholder="العنوان" className="glass-input" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-text-muted hidden">&nbsp;</Label>
            <Button onClick={async () => {
              const { data: { user } } = await supabase.auth.getUser();
              const { error } = await supabase.from("clients").insert({
                user_id: user?.id,
                ...newClient,
              });
              if (!error) {
                setNewClient({ name: "", email: "", phone: "", tax_number: "", address: "" });
                setToast({ msg: "تم إضافة العميل", type: "success" });
                window.dispatchEvent(new Event("clients-updated"));
              }
            }} className="w-full shadow-glow-purple hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]">
              إضافة العميل
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-blue-600 to-electric-purple-600 flex items-center justify-center text-white text-xs">
            <FileIcon className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">قائمة الفواتير</h2>
        </div>
        <Button onClick={() => setOpen(true)} className="hidden sm:inline shadow-glow-purple hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]">
          <Plus className="w-4 h-4 mr-2" /> فاتورة جديدة
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="sm:hidden glass-card">+</Button>
      </div>

      <div className="overflow-x-auto">
        <Card className="glass-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-bg-card-hover border-b border-border-subtle">
              <tr>
                <th className="pb-4 pr-4 text-xs font-medium text-text-muted uppercase tracking-wider">رقم الفاتورة</th>
                <th className="pb-4 pr-4 text-xs font-medium text-text-muted uppercase tracking-wider">العميل</th>
                <th className="pb-4 pr-4 text-xs font-medium text-text-muted uppercase tracking-wider">الإجمالي</th>
                <th className="pb-4 pr-4 text-xs font-medium text-text-muted uppercase tracking-wider">الحالة</th>
                <th className="pb-4 text-xs font-medium text-text-muted uppercase tracking-wider text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-text-muted">
                    <div className="flex flex-col items-center gap-3">
                      <FileIcon className="w-12 h-12 opacity-30" />
                      <p>لا توجد فواتير بعد</p>
                      <p className="text-xs">أضف فاتورة أولى لبدء العمل</p>
                    </div>
                  </td>
                </tr>
              )}
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-bg-card-hover transition-colors group">
                  <td className="py-4 pr-4 font-mono text-xs text-text-primary">{inv.invoice_number}</td>
                  <td className="py-4 pr-4 text-text-secondary">{inv.client_name}</td>
                  <td className="py-4 pr-4 text-right font-medium text-text-primary">{formatCurrencyEGP(inv.total, "ar")}</td>
                  <td className="py-4 pr-4">
                    <Badge variant={inv.status === "paid" ? "success" : inv.status === "sent" ? "info" : inv.status === "overdue" ? "destructive" : "default"}>
                      {inv.status === "draft" ? "مسودة" : inv.status === "sent" ? "مرسلة" : inv.status === "paid" ? "مدفوعة" : "متأخرة"}
                    </Badge>
                  </td>
                  <td className="py-4 text-xs text-text-muted">{formatDate(inv.created_at, "ar")}</td>
                  <td className="py-4 text-center">
                    {inv.status !== "paid" && (
                      <Button size="sm" variant="outline" onClick={() => markPaid(inv.id)} className="p-1.5 hover:bg-emerald-500/5 border-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => printInvoice(inv)} className="p-1.5">
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => sendWhatsApp(inv)} className="p-1.5">
                      <Send className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => removeInvoice(inv.id)} className="p-1.5 hover:bg-red-500/10">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Create invoice modal */}
      <div aria-hidden={!open ? "true" : "false"} className={open ? "" : "hidden fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in"} aria-modal="true" role="dialog">
        <Card className="w-full max-w-2xl glass-card animate-scale-in">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-neon-blue-400" />
              <CardTitle className="text-text-primary">إنشاء فاتورة جديدة</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={createInvoice} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <Label>اسم العميل *</Label>
                  <Input value={form.client_name} onChange={(e) => setForm({...form, client_name: e.target.value})} required className="glass-input" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>بريد العميل</Label>
                  <Input type="email" value={form.client_email} onChange={(e) => setForm({...form, client_email: e.target.value})} className="glass-input" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>هاتف العميل</Label>
                  <Input value={form.client_phone} onChange={(e) => setForm({...form, client_phone: e.target.value})} className="glass-input" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>الرقم الضريبي</Label>
                  <Input value={form.client_tax_number} onChange={(e) => setForm({...form, client_tax_number: e.target.value})} className="glass-input" />
                </div>
              </div>
              <div className="border-t border-border-subtle pt-6">
                <div className="flex justify-between items-center mb-4">
                  <Label>الأصناف</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addItem} className="glass-card">
                    <Plus className="w-3 h-3 mr-1" /> إضافة صنف
                  </Button>
                </div>
                <div className="overflow-x-auto border border-border-subtle rounded-xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-bg-card-hover border-b border-border-subtle">
                        <th className="pb-3 text-left text-xs font-medium text-text-muted uppercase">اسم الصنف</th>
                        <th className="pb-3 text-center text-xs font-medium text-text-muted uppercase">الكمية</th>
                        <th className="pb-3 text-center text-xs font-medium text-text-muted uppercase">سعر الوحدة</th>
                        <th className="pb-3 text-center text-xs font-medium text-text-muted uppercase">الإجمالي</th>
                        <th className="pb-3 text-center text-xs font-medium text-text-muted uppercase">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {form.items.map((it: any, i: number) => (
                        <tr key={i}>
                          <td className="py-3">
                            <Input value={it.name} onChange={(e) => updateItem(i, "name", e.target.value)} className="glass-input" />
                          </td>
                          <td className="py-3 text-center">
                            <Input type="number" value={it.quantity || 0} onChange={(e) => updateItem(i, "quantity", e.target.value)} className="w-20 glass-input" />
                          </td>
                          <td className="py-3 text-center">
                            <Input type="number" value={it.unit_price || 0} onChange={(e) => updateItem(i, "unit_price", e.target.value)} className="w-24 glass-input" />
                          </td>
                          <td className="py-3 text-center font-medium text-text-primary">{formatCurrencyEGP(Number(it.quantity || 0)*Number(it.unit_price || 0), "ar")}</td>
                          <td className="py-3 text-center">
                            <Button type="button" size="sm" variant="outline" onClick={() => removeItem(i)} className="p-1 glass-card">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex flex-col gap-1">
                    <Label>الضريبة</Label>
                    <Input type="number" value={String(form.tax_amount || 0)} onChange={(e) => setForm({...form, tax_amount: e.target.value})} className="glass-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>تاريخ الاستحقاق</Label>
                    <Input type="date" value={form.due_date} onChange={(e) => setForm({...form, due_date: e.target.value})} className="glass-input" />
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-end">
                  <div className="text-xs font-medium text-text-muted">المجموع الفرعي: <span className="text-text-primary">{formatCurrencyEGP(subtotal, "ar")}</span></div>
                  <div className="text-2xl font-bold text-text-primary">الإجمالي: <span className="text-neon-blue-400">{formatCurrencyEGP(total, "ar")}</span></div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="glass-card">إلغاء</Button>
                <Button type="submit" disabled={creating} className="shadow-glow-purple hover:shadow-[0_0_35px_rgba(168,85,247,0.5)]">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "إنشاء الفاتورة"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {toast && (
        <div className={`fixed bottom-4 right-4 px-5 py-3.5 rounded-2xl text-white font-medium shadow-[0_0_30px_rgba(0,0,0,0.4)] z-50 animate-slide-up ${toast.type === "success" ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-red-600"}`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}