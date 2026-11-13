export const dynamic = "force-dynamic";

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { formatCurrencyEGP } from "@/lib/utils";

export default async function AdminStatsPage() {
  const sb = createSupabaseServiceClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [usersRes, subsRes, reqsRes] = await Promise.all([
    sb.from("profiles").select("id, subscription_status, subscription_plan, created_at, email"),
    sb.from("subscriptions").select("id, status, price_egp, ends_at, interval"),
    sb.from("subscription_requests").select("id, status, price_egp, created_at"),
  ]);

  const users = usersRes.data || [];
  const subs = subsRes.data || [];
  const requests = reqsRes.data || [];

  const totalUsers = users.length;
  const activeUsers = users.filter((u: any) => u.subscription_status === "active").length;
  const trialUsers = users.filter((u: any) => u.subscription_status === "trial").length;
  const expiredUsers = users.filter((u: any) => u.subscription_status === "expired" || u.subscription_status === "canceled").length;
  const pendingRequests = requests.filter((r: any) => r.status === "pending").length;

  const totalRevenue = subs.filter((s: any) => s.status === "active").reduce((sum: number, s: any) => sum + Number(s.price_egp || 0), 0);
  const monthlyRevenue = subs.filter((s: any) => s.status === "active" && s.ends_at && new Date(s.ends_at) >= startOfMonth).reduce((sum: number, s: any) => sum + Number(s.price_egp || 0), 0);

  const conversionRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
  const arpu = activeUsers > 0 ? Math.round(totalRevenue / activeUsers) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم الإحصائية</h1>
      <p className="text-gray-600">جميع الأرقام مستخرجة مباشرة من قاعدة البيانات.</p>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Stat title="إجمالي المستخدمين" value={totalUsers} subtitle="" />
        <Stat title="المستخدمون النشطون" value={activeUsers} subtitle="" />
        <Stat title="تجربة مجانية" value={trialUsers} subtitle="" />
        <Stat title="مشتركون مدفوعون" value={activeUsers} subtitle="" />
        <Stat title="اشتراكات منتهية" value={expiredUsers} subtitle="" />
        <Stat title="طلبات معلقة" value={pendingRequests} subtitle="" />
        <Stat title="الإيرادات الإجمالية" value={formatCurrencyEGP(totalRevenue, "ar")} subtitle="جنيه مصري" />
        <Stat title="إيرادات هذا الشهر" value={formatCurrencyEGP(monthlyRevenue, "ar")} subtitle="جنيه مصري" />
        <Stat title="معدل التحويل" value={`${conversionRate}%`} subtitle="من التجربة إلى المدفوع" />
        <Stat title="متوسط الإيرادات لكل مستخدم" value={formatCurrencyEGP(arpu, "ar")} subtitle="أربيو" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <div className="p-6 rounded-xl border border-gray-200 bg-white">
            <h2 className="text-lg font-bold mb-4">آخر المستخدمين المسجلين</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead><tr className="border-b text-gray-500">
                  <th className="pb-3">الاسم</th><th className="pb-3">البريد</th><th className="pb-3">الحالة</th><th className="pb-3">التاريخ</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {users.slice(0, 10).map((u: any) => (
                    <tr key={u.id} className="py-3">
                      <td className="font-medium">{u.full_name || "—"}</td>
                      <td className="text-gray-600">{u.email}</td>
                      <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs ${u.subscription_status === "active" ? "bg-green-100 text-green-700" : u.subscription_status === "trial" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{u.subscription_status}</span></td>
                      <td className="py-3 text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString("ar-EG")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-xl border border-gray-200 bg-white">
            <h2 className="text-lg font-bold mb-4">حالات الاشتراكات</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span>نشط</span><span className="font-medium text-green-600">{activeUsers}</span></div>
              <div className="flex justify-between text-sm"><span>تجربة مجانية</span><span className="font-medium text-amber-600">{trialUsers}</span></div>
              <div className="flex justify-between text-sm"><span>منتهي/ملغي</span><span className="font-medium text-red-600">{expiredUsers}</span></div>
              <div className="flex justify-between text-sm"><span>طلبات اشتراك معلقة</span><span className="font-medium text-blue-600">{pendingRequests}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value, subtitle }: { title: string; value: React.ReactNode; subtitle: string }) {
  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-white">
      <p className="text-xs text-gray-500">{title}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
      </div>
    </div>
  );
}
