"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await fetch("/api/plans", { credentials: "include" });
    const json = await res.json();
    setPlans(json.plans || []);
    setLoading(false);
  };

  const update = async (id: string, field: string, value: any) => {
    const body: any = { id };
    body[field] = field.endsWith("egp") || field.includes("max") ? Number(value) : value;
    await fetch("/api/plans", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });
    load();
  };

  if (loading) return <div className="py-10 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">إدارة الخطط والأسعار</h1>
      <p className="text-gray-600">تعديل الخطط يُطبَّق فوراً على جميع المستخدمين.</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-b border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="pb-3 text-gray-500 font-medium">اسم الخطة</th>
              <th className="pb-3 text-gray-500 font-medium text-right">سعر شهري</th>
              <th className="pb-3 text-gray-500 font-medium text-right">سعر سنوي</th>
              <th className="pb-3 text-gray-500 font-medium">الحد الأقصى للفواتير</th>
              <th className="pb-3 text-gray-500 font-medium">الحد الأقصى للعملاء</th>
              <th className="pb-3 text-gray-500 font-medium">مُفعّلة</th>
              <th className="pb-3 text-gray-500 font-medium text-center">الشائعة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {plans.map((p) => (
              <tr key={p.id} className="group">
                <td className="py-3 font-medium">
                  <Input value={p.name_ar || p.name} onChange={(e) => update(p.id, "name_ar", e.target.value)} className="w-24 bg-transparent border-0 p-0 focus:ring-0" />
                </td>
                <td className="py-3 text-right">
                  <Input type="number" value={p.price_monthly_egp} onChange={(e) => update(p.id, "price_monthly_egp", e.target.value)} className="w-20 bg-transparent border-0 p-0 focus:ring-0 text-right" />
                </td>
                <td className="py-3 text-right">
                  <Input type="number" value={p.price_yearly_egp} onChange={(e) => update(p.id, "price_yearly_egp", e.target.value)} className="w-20 bg-transparent border-0 p-0 focus:ring-0 text-right" />
                </td>
                <td className="py-3">{p.max_invoices ?? "غير محدود"}</td>
                <td className="py-3">{p.max_clients ?? "غير محدود"}</td>
                <td className="py-3">
                  <Button size="sm" variant={p.is_active ? "default" : "outline"} onClick={() => update(p.id, "is_active", !p.is_active)} className="px-2 py-1 text-xs">{p.is_active ? "نعم" : "لا"}</Button>
                </td>
                <td className="py-3 text-center">
                  <Button size="sm" variant={p.is_popular ? "default" : "outline"} onClick={() => update(p.id, "is_popular", !p.is_popular)} className="px-2 py-1 text-xs">{p.is_popular ? "نعم" : "لا"}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
