"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`, { credentials: "include" });
    const json = await res.json();
    setUsers(json.users || []);
    setLoading(false);
  };

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/users`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: active }),
      credentials: "include",
    });
    load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الحساب؟")) return;
    await fetch(`/api/users`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
      credentials: "include",
    });
    load();
  };

  const filtered = users.filter((u) =>
    (u.full_name || "").includes(q) || (u.email || "").includes(q) || (u.account_id || "").includes(q)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <Input
          placeholder="بحث بالاسم أو البريد أو رقم الحساب..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full md:w-80"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-b border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="pb-3 text-gray-500 font-medium">الاسم</th>
              <th className="pb-3 text-gray-500 font-medium">البريد الإلكتروني</th>
              <th className="pb-3 text-gray-500 font-medium">رقم الحساب</th>
              <th className="pb-3 text-gray-500 font-medium">الحالة</th>
              <th className="pb-3 text-gray-500 font-medium">الاشتراك</th>
              <th className="pb-3 text-gray-500 font-medium text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center text-gray-500">جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-gray-500">لا توجد نتائج</td></tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 font-medium">{u.full_name || "—"}</td>
                  <td className="py-3 text-gray-600">{u.email}</td>
                  <td className="py-3 font-mono text-xs">{u.account_id}</td>
                  <td className="py-3">
                    <Button size="sm" variant={u.is_active ? "outline" : "secondary"} onClick={() => toggle(u.id, !u.is_active)}>
                      {u.is_active ? "نشط" : "موقف"}
                    </Button>
                  </td>
                  <td className="py-3">{u.subscription_status}</td>
                  <td className="py-3 text-center">
                    <Button size="sm" variant="destructive" onClick={() => remove(u.id)} className="p-1.5">حذف</Button>
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
