export const dynamic = "force-dynamic";

import { createSupabaseServiceClient } from "@/lib/supabase/server";

export default async function AdminLogsPage() {
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">سجلات النظام</h1>
      <p className="text-gray-600">سجل العمليات الإدارية الهامة (تفعيل الاشتراكات، التعديلات، إلخ).</p>

      {error && <div className="p-4 rounded bg-red-50 text-red-800 text-sm">{error.message}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-b border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="pb-3 text-gray-500 font-medium">الإجراء</th>
              <th className="pb-3 text-gray-500 font-medium">نوع الكيان</th>
              <th className="pb-3 text-gray-500 font-medium">التفاصيل</th>
              <th className="pb-3 text-gray-500 font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(data || []).map((log: any) => (
              <tr key={log.id} className="py-3">
                <td className="font-medium">{log.action}</td>
                <td className="text-gray-600">{log.entity_type}</td>
                <td className="text-xs text-gray-500">{log.details ? JSON.stringify(log.details) : "—"}</td>
                <td className="py-3 text-xs text-gray-500">{new Date(log.created_at).toLocaleString("ar-EG")}</td>
              </tr>
            ))}
            {!data || data.length === 0 && (
              <tr><td colSpan={4} className="py-10 text-center text-gray-500">لا توجد سجلات بعد</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
