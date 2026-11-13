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
      const { error } = await supabase.from("invoices").insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
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
      // refresh list
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
    if (!window.confirm("هل أنت متأكد من حذف الفاتورة؟")) return;
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
      <style>body{font-family:Tahoma,Arial;direction:rtl;padding:20px;}
      table{width:100%;border-collapse:collapse}th,td{border:1px solid #999;padding:6px;text-align:right;}
      .total{font-weight:bold;font-size:1.2em;text-align:right;margin-top:20px}
      h1{text-align:center}</style></head>
      <body>
      <h1>فاتورة ضريبية رقم ${inv.invoice_number}</h1>
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
    <div className="space-y-6">
      {/* Client quick-add (inline) */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> <CardTitle className="text-sm">إضافة عميل جديد سريعاً</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">اسم العميل</Label>
            <Input value={newClient.name} onChange={(e) => setNewClient({...newClient, name:e.target.value})} placeholder="اسم العميل" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">بريد إلكتروني</Label>
            <Input value={newClient.email} onChange={(e) => setNewClient({...newClient, email:e.target.value})} placeholder="بريد إلكتروني" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">هاتف</Label>
            <Input value={newClient.phone} onChange={(e) => setNewClient({...newClient, phone:e.target.value})} placeholder="هاتف" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">الرقم الضريبي</Label>
            <Input value={newClient.tax_number} onChange={(e) => setNewClient({...newClient, tax_number:e.target.value})} placeholder="الرقم الضريبي" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">العنوان</Label>
            <Input value={newClient.address} onChange={(e) => setNewClient({...newClient, address:e.target.value})} placeholder="العنوان" />
          </div>
          <Button onClick={async () => {
            const { error } = await supabase.from("clients").insert({
              user_id: (await supabase.auth.getUser()).data.user?.id,
              ...newClient,
            });
            if (!error) {
              setNewClient({ name: "", email: "", phone: "", tax_number: "", address: "" });
              setToast({ msg: "تم إضافة العميل", type: "success" });
              window.dispatchEvent(new Event("clients-updated"));
            }
          }}>إضافة العميل</Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">قائمة الفواتير</h2>
        <Button onClick={() => setOpen(true)} className="hidden sm:inline">
          <Plus className="w-4 h-4 mr-2" /> فاتورة جديدة
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="sm:hidden">
          +
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-b border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="pb-3 text-gray-500 font-medium">رقم الفاتورة</th>
              <th className="pb-3 text-gray-500 font-medium">العميل</th>
              <th className="pb-3 text-gray-500 font-medium text-right">الإجمالي</th>
              <th className="pb-3 text-gray-500 font-medium">الحالة</th>
              <th className="pb-3 text-gray-500 font-medium">التاريخ</th>
              <th className="pb-3 text-gray-500 font-medium text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  لا توجد فواتير بعد. أضف فاتورة أولى لبدء العمل.
                </td>
              </tr>
            )}
            {invoices.map((inv: any) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="py-3 font-mono text-xs">{inv.invoice_number}</td>
                <td className="py-3">{inv.client_name}</td>
                <td className="py-3 text-right font-medium">{formatCurrencyEGP(inv.total, "ar")}</td>
                <td className="py-3">
                  <Badge
                    variant={
                      inv.status === "paid" ? "default" :
                      inv.status === "sent" ? "secondary" :
                      inv.status === "overdue" ? "destructive" : "outline"
                    }
                  >
                    {inv.status}
                  </Badge>
                </td>
                <td className="py-3 text-xs text-gray-500">{formatDate(inv.created_at, "ar")}</td>
                <td className="py-3 text-center">
                  {inv.status !== "paid" && (
                    <Button size="sm" variant="outline" onClick={() => markPaid(inv.id)} className="p-1.5">
                      <CheckCircle2 className="w-3 h-3" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => printInvoice(inv)} className="p-1.5">
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => sendWhatsApp(inv)} className="p-1.5">
                    <Send className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => removeInvoice(inv.id)} className="p-1.5">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create invoice modal */}
      <div aria-hidden={!open ? "true" : "false"} className={open ? "" : "hidden fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"}>
        <Card className="w-full max-w-2xl bg-white">
          <CardHeader>
            <CardTitle>إشاء فاتورة جديدة</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createInvoice} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <Label>اسم العميل</Label>
                  <Input value={form.client_name} onChange={(e) => setForm({...form, client_name: e.target.value})} required />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>بريد العميل</Label>
                  <Input type="email" value={form.client_email} onChange={(e) => setForm({...form, client_email: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>هاتف العميل</Label>
                  <Input value={form.client_phone} onChange={(e) => setForm({...form, client_phone: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>الرقم الضريبي</Label>
                  <Input value={form.client_tax_number} onChange={(e) => setForm({...form, client_tax_number: e.target.value})} />
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <Label>الأصناف</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addItem}>
                    <Plus className="w-3 h-3 mr-1" /> إضافة صنف
                  </Button>
                </div>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="pb-2 text-left">اسم الصنف</th>
                        <th className="pb-2 text-center">الكمية</th>
                        <th className="pb-2 text-center">سعر الوحدة</th>
                        <th className="pb-2 text-center">الإجمالي</th>
                        <th className="pb-2 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((it: any, i: number) => (
                        <tr key={i} className="border-t divide-y divide-gray-200">
                          <td className="py-2">
                            <Input value={it.name} onChange={(e) => updateItem(i, "name", e.target.value)} />
                          </td>
                          <td className="py-2 text-center">
                            <Input type="number" value={it.quantity || 0} onChange={(e) => updateItem(i, "quantity", e.target.value)} className="w-16" />
                          </td>
                          <td className="py-2 text-center">
                            <Input type="number" value={it.unit_price || 0} onChange={(e) => updateItem(i, "unit_price", e.target.value)} className="w-20" />
                          </td>
                          <td className="py-2 text-center font-medium">{formatCurrencyEGP(Number(it.quantity || 0)*Number(it.unit_price || 0), "ar")}</td>
                          <td className="py-2 text-center">
                            <Button type="button" size="sm" variant="outline" onClick={() => removeItem(i)} className="p-1">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col gap-1">
                    <Label>الضريبة</Label>
                    <Input type="number" value={String(form.tax_amount || 0)} onChange={(e) => setForm({...form, tax_amount: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>تاريخ الاستحقاق</Label>
                    <Input type="date" value={form.due_date} onChange={(e) => setForm({...form, due_date: e.target.value})} />
                  </div>
                </div>
                <div className="mt-3 flex justify-between">
                  <div className="text-xs font-medium">المجموع الفرعي: <span>{formatCurrencyEGP(subtotal, "ar")}</span></div>
                  <div className="text-lg font-bold text-right">الإجمالي: <span>{formatCurrencyEGP(total, "ar")}</span></div>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
                <Button type="submit" disabled={creating}>
                  {creating ? <Loader2 className="w-4 h-4" /> : "إنشاء الفاتورة"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white font-medium shadow-lg flex items-center gap-2 z-50 ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
