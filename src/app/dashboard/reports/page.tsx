export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  RevenueChart,
  RevenueAreaChart,
  CategoryChart,
  StatCard,
} from "@/components/charts/RevenueChart";
import { FileText, CreditCard, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function ReportsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Fetch data for charts
  const [invoicesRes, expensesRes, productsRes, clientsRes] =
    await Promise.all([
      supabase
        .from("invoices")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("expenses")
        .select("*")
        .eq("company_id", profile.company_id),
      supabase
        .from("products")
        .select("*")
        .eq("company_id", profile.company_id),
      supabase
        .from("clients")
        .select("*")
        .eq("company_id", profile.company_id),
    ]);

  const invoices = invoicesRes.data || [];
  const expenses = expensesRes.data || [];
  const products = productsRes.data || [];
  const clients = clientsRes.data || [];

  // Prepare monthly data for last 6 months
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }

  const monthlyData = months.map((month) => {
    const monthInv = invoices.filter((i) => i.created_at.startsWith(month));
    const monthExp = expenses.filter((e) => e.expense_date.startsWith(month));
    const revenue = monthInv
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + Number(i.total || 0), 0);
    const exp = monthExp.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return {
      name: month,
      revenue,
      invoices: monthInv.length,
      expenses: exp,
      profit: revenue - exp,
    };
  });

  // Category data for expenses
  const expenseCategories: Record<string, number> = {};
  expenses.forEach((e) => {
    const cat = e.category || "General";
    expenseCategories[cat] = (expenseCategories[cat] || 0) + Number(e.amount || 0);
  });
  const categoryData = Object.entries(expenseCategories)
    .map(([name, value]) => ({ name, value }))
    .slice(0, 5);

  // Invoice status distribution
  const statusDist: Record<string, number> = {};
  invoices.forEach((i) => {
    statusDist[i.status] = (statusDist[i.status] || 0) + 1;
  });
  const statusData = Object.entries(statusDist).map(([name, value]) => ({ name, value }));

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.total || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const profit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-8 page-transition animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">التقارير المالية</h1>
          <p className="text-text-muted">تقارير وتحليلات مالية شاملة لأعمالك</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            تصدير PDF
          </Button>
          <Button size="sm" className="shadow-glow-purple">
            تصدير Excel
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="إجمالي الإيرادات"
          value={new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0 }).format(totalRevenue)}
          change="+12%"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard
          title="إجمالي المصروفات"
          value={new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0 }).format(totalExpenses)}
          change="+5%"
          trend="down"
          icon={CreditCard}
        />
        <StatCard
          title="صافي الربح"
          value={new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0 }).format(profit)}
          change="+8%"
          trend="up"
          icon={ArrowRight}
        />
        <StatCard
          title="إجمالي الفواتير"
          value={invoices.length}
          change="+3"
          trend="up"
          icon={FileText}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Revenue Chart */}
        <div className="md:col-span-7 lg:col-span-8">
          <RevenueChart data={monthlyData} />
        </div>

        {/* Expense Categories */}
        <div className="md:col-span-5 lg:col-span-4">
          <CategoryChart data={categoryData} title="توزيع المصروفات حسب الفئة" />
        </div>

        {/* Invoice Status */}
        <div className="md:col-span-5 lg:col-span-4 mt-6 md:mt-0">
          <CategoryChart data={statusData} title="حالة الفواتير" />
        </div>

        {/* Revenue Area */}
        <div className="md:col-span-7 lg:col-span-8 mt-6 md:mt-0">
          <RevenueAreaChart data={monthlyData} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-2xl overflow-hidden border border-border-subtle">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>النشاط المالي الأخير</CardTitle>
            <Button variant="outline" size="sm" asChild as={Button} href="/dashboard/invoices">
              عرض الكل <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-bg-card-hover border-b border-border-subtle">
                <tr>
                  <th className="pb-4 pr-4 text-xs font-medium text-text-muted uppercase">التاريخ</th>
                  <th className="pb-4 pr-4 text-xs font-medium text-text-muted uppercase">النوع</th>
                  <th className="pb-4 pr-4 text-xs font-medium text-text-muted uppercase">الوصف</th>
                  <th className="pb-4 text-xs font-medium text-text-muted uppercase text-right">المبلغ</th>
                  <th className="pb-4 text-xs font-medium text-text-muted uppercase text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {[...invoices
                  .filter((i) => i.status === "paid")
                  .map((i) => ({
                    type: "invoice",
                    title: `فاتورة #${i.invoice_number}`,
                    amount: Number(i.total || 0),
                    date: i.created_at,
                    status: i.status,
                  })),
                ...expenses.map((e) => ({
                  type: "expense",
                  title: e.title || "مصروف",
                  amount: -Number(e.amount || 0),
                  date: e.expense_date,
                  status: e.status,
                }))]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((item) => (
                    <tr key={`${item.type}-${item.date}`} className="border-b border-border-subtle hover:bg-bg-card-hover transition-colors">
                      <td className="py-4 pr-4 text-xs text-text-muted">
                        {new Date(item.date).toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-4 pr-4 text-xs font-medium text-text-primary capitalize">
                        {item.type === "invoice" ? "فاتورة" : "مصروف"}
                      </td>
                      <td className="py-4 pr-4 text-sm text-text-secondary">{item.title}</td>
                      <td className="py-4 text-right">
                        <span className={`font-mono text-xs ${item.amount > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {item.amount > 0 ? "+" : ""}{new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0 }).format(Math.abs(item.amount))}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <Badge variant={item.status === "paid" ? "success" : "default"}>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </div>
    </div>
  );
}