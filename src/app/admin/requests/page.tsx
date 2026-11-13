"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await fetch("/api/subscriptions/requests", { credentials: "include" });
    const json = await res.json();
    setRequests(json.requests || []);
    setLoading(false);
  };

  const decide = async (id: string, status: "approved" | "rejected") => {
    const notes = status === "rejected" ? "مرفوض من الإدارة" : null;
    await fetch("/api/subscriptions/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, admin_notes: notes }),
      credentials: "include",
    });
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">إدارة طلبات الاشتراك</h1>
      <p className="text-gray-600">طلبات الاشتراك التي تُرسل عبر واتساب ويتم تفعيلها يدوياً بعد تأكيد الدفع.</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-b border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="pb-3 text-gray-500 font-medium">اسم العميل</th>
              <th className="pb-3 text-gray-500 font-medium">البريد</th>
              <th className="pb-3 text-gray-500 font-medium">رقم الحساب</th>
              <th className="pb-3 text-gray-500 font-medium">الخطة</th>
              <th className="pb-3 text-gray-500 font-medium">السعر</th>
              <th className="pb-3 text-gray-500 font-medium">المدة</th>
              <th className="pb-3 text-gray-500 font-medium">تاريخ الطلب</th>
              <th className="pb-3 text-gray-500 font-medium">الحالة</th>
              <th className="pb-3 text-gray-500 font-medium text-center">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={9} className="py-10 text-center text-gray-500">جاري التحميل...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={9} className="py-10 text-center text-gray-500">لا توجد طلبات</td></tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 font-medium">{r.customer_name}</td>
                  <td className="py-3 text-gray-600">{r.customer_email}</td>
                  <td className="py-3 font-mono text-xs">{r.account_id}</td>
                  <td className="py-3">{r.plan_name}</td>
                  <td className="py-3">{r.price_egp} ج.م</td>
                  <td className="py-3">{r.duration}</td>
                  <td className="py-3 text-xs text-gray-500">{new Date(r.requested_at).toLocaleDateString("ar-EG")}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${r.status === "approved" ? "bg-green-100 text-green-700" : r.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      {r.status === "pending" ? "معلق" : r.status === "approved" ? "تم التفعيل" : "مرفوض"}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    {r.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => decide(r.id, "approved")} className="p-1.5 text-green-600 hover:bg-green-50">تفعيل</Button>
                        <Button size="sm" variant="outline" onClick={() => decide(r.id, "rejected")} className="p-1.5 text-red-600 hover:bg-red-50">رفض</Button>
                      </>
                    )}
                    {r.status !== "pending" && <span className="text-xs text-gray-400">{r.status}</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
