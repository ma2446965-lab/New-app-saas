export const dynamic = "force-dynamic";

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { formatCurrencyEGP } from "@/lib/utils";
import { verifyAdminSessionToken } from "@/lib/auth/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Users,
  CreditCard,
  FileText,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Shield,
  LayoutDashboard,
  Activity,
  PieChart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RevenueChart, CategoryChart, StatCard } from "@/components/charts/RevenueChart";

export default async function SuperAdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("fatora_admin_session")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const payload = await verifyAdminSessionToken(token);
  if (!payload) {
    redirect("/admin/login");
  }

  const sb = createSupabaseServiceClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [usersRes, subsRes, reqsRes, invoicesRes, companiesRes] =
    await Promise.all([
      sb.from("profiles").select("*, companies(*)"),
      sb.from("subscriptions").select("*"),
      sb.from("subscription_requests").select("*"),
      sb.from("invoices").select("*"),
      sb.from("companies").select("*"),
    ]);

  const users = usersRes.data || [];
  const subs = subsRes.data || [];
  const requests = reqsRes.data || [];
  const invoices = invoicesRes.data || [];
  const companies = companiesRes.data || [];

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.subscription_status === "active").length;
  const trialUsers = users.filter((u) => u.subscription_status === "trial").length;
  const expiredUsers = users.filter((u) => u.subscription_status === "expired" || u.subscription_status === "canceled").length;
  const pendingRequests = requests.filter((r) => r.status === "pending").length;

  const totalRevenue = subs.filter((s) => s.status === "active")
    .reduce((sum, s) => sum + Number(s.price_egp || 0), 0);
  const monthlyRevenue = subs.filter((s) => s.status === "active" && s.ends_at && new Date(s.ends_at) >= startOfMonth)
    .reduce((sum, s) => sum + Number(s.price_egp || 0), 0);

  const conversionRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }

  const monthlyChartData = months.map((month) => {
    const monthSubs = subs.filter((s) => s.starts_at && s.starts_at.startsWith(month));
    const rev = monthSubs.reduce((sum, s) => sum + Number(s.price_egp || 0), 0);
    return {
      name: month,
      revenue: rev,
      invoices: monthSubs.length,
      expenses: 0,
      profit: rev,
    };
  });

  const planDist: Record<string, number> = {};
  subs.forEach((s) => {
    planDist[s.interval] = (planDist[s.interval] || 0) + 1;
  });
  const planData = Object.entries(planDist).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 page-transition animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-text-primary">لوحة الإدارة الفائقة</h1>
            <Badge variant="success" className="text-xs px-2 py-1">
              <Shield className="w-3 h-3 mr-1" /> مدير فائق
            </Badge>
          </div>
          <p className="text-text-muted">إدارة المستخدمين، الشركات، الاشتراكات، والتقارير الشاملة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => (location.href = "/admin/users")}>
            مستخدمون جدد
          </Button>
          <Button size="sm" className="shadow-glow-purple" onClick={() => (location.href = "/admin/requests")}>
            طلبات الاشتراك
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        <StatCard
          title="إجمالي المستخدمين"
          value={totalUsers}
          change="+5%"
          trend="up"
          icon={Users}
        />
        <StatCard
          title="المستخدمون النشطون"
          value={activeUsers}
          change="+12%"
          trend="up"
          icon={CreditCard}
        />
        <StatCard
          title="تجربة مجانية"
          value={trialUsers}
          change="+3%"
          trend="up"
          icon={Clock}
        />
        <StatCard
          title="إجمالي الفواتير"
          value={invoices.length}
          change="+10%"
          trend="up"
          icon={FileText}
        />
        <StatCard
          title="اشتراكات منتهية"
          value={expiredUsers}
          change="-2%"
          trend="down"
          icon={TrendingDown}
        />
        <StatCard
          title="الإيرادات الإجمالية"
          value={formatCurrencyEGP(totalRevenue, "ar")}
          change="+15%"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard
          title="إيرادات هذا الشهر"
          value={formatCurrencyEGP(monthlyRevenue, "ar")}
          change="+8%"
          trend="up"
          icon={Activity}
        />
        <StatCard
          title="معدل التحويل"
          value={`${conversionRate}%`}
          change="+5%"
          trend="up"
          icon={PieChart}
        />
        <StatCard
          title="الشركات المسجلة"
          value={companies.length}
          change="+2%"
          trend="up"
          icon={LayoutDashboard}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 lg:col-span-9">
          <Card className="glass-card rounded-2xl overflow-hidden border border-border-subtle">
            <CardHeader>
              <CardTitle className="text-lg">نمو الإيرادات الشهري</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <RevenueChart data={monthlyChartData} />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4 lg:col-span-3">
          <Card className="glass-card rounded-2xl overflow-hidden border border-border-subtle">
            <CardHeader>
              <CardTitle className="text-lg">توزيع الخطط</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CategoryChart data={planData} title="الاشتراكات حسب النوع" />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4 lg:col-span-3 mt-6 md:mt-0">
          <Card className="glass-card rounded-2xl overflow-hidden border border-border-subtle">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">طلبات الاشتراك المعلقة</CardTitle>
                <Button size="sm" asChild as={Button} href="/admin/requests">
                  عرض الكل
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-center justify-between text-2xl font-bold mb-2">
                  <span className="text-text-primary">{pendingRequests}</span>
                  <Badge variant={pendingRequests > 0 ? "default" : "success"}>
                    {pendingRequests > 0 ? "يحتاج إجراء" : "محدث"}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {requests
                    .filter((r) => r.status === "pending")
                    .slice(0, 5)
                    .map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-card-hover border border-border-subtle/50">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{r.customer_name}</p>
                          <p className="text-xs text-text-muted">{r.customer_email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-text-primary">
                            {formatCurrencyEGP(r.price_egp || 0, "ar")}
                          </p>
                          <p className="text-xs text-text-muted">{r.duration}</p>
                        </div>
                      </div>
                    ))}
                  {pendingRequests === 0 && (
                    <div className="text-center text-text-muted py-4">
                      لا توجد طلبات معلقة
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4 lg:col-span-3 mt-6 md:mt-0">
          <Card className="glass-card rounded-2xl overflow-hidden border border-border-subtle">
            <CardHeader>
              <CardTitle className="text-lg">النشاط الأخير</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {users
                  .slice(0, 5)
                  .map((u) => (
                    <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-card-hover transition-colors">
                      <div className="w-8 h-8 rounded-full bg-neon-blue-600/20 flex items-center justify-center text-neon-blue-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">
                          {u.full_name || u.email}
                        </p>
                        <p className="text-xs text-text-muted">
                          انضمام منذ {new Date(u.created_at).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}