import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSessionToken } from "@/lib/auth/admin";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

async function guard(req: NextRequest) {
  const token = req.cookies.get("fatora_admin_session")?.value;
  if (!token) return null;
  return await verifyAdminSessionToken(token);
}

export async function GET(req: NextRequest) {
  const payload = await guard(req);
  if (!payload) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const sb = createSupabaseServiceClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [usersRes, subsRes, requestsRes, invoicesRes] = await Promise.all([
    sb.from("profiles").select("id, subscription_status, subscription_plan, created_at"),
    sb.from("subscriptions").select("id, status, price_egp, ends_at, interval"),
    sb.from("subscription_requests").select("id, status, price_egp, created_at"),
    sb.from("invoices").select("total, status, created_at"),
  ]);

  const users = usersRes.data || [];
  const subs = subsRes.data || [];
  const requests = requestsRes.data || [];
  const invoices = invoicesRes.data || [];

  const totalUsers = users.length;
  const activeUsers = users.filter((u: any) => u.subscription_status === "active").length;
  const trialUsers = users.filter((u: any) => u.subscription_status === "trial").length;
  const paidUsers = activeUsers;
  const expiredUsers = users.filter((u: any) => u.subscription_status === "expired" || u.subscription_status === "canceled").length;

  const monthlyRevenue = subs.filter((s: any) => s.status === "active" && s.ends_at && new Date(s.ends_at) >= startOfMonth).reduce((sum: number, s: any) => sum + Number(s.price_egp || 0), 0);
  const yearlyRevenue = subs.filter((s: any) => s.status === "active" && s.ends_at && new Date(s.ends_at) >= startOfYear).reduce((sum: number, s: any) => sum + Number(s.price_egp || 0), 0);
  const totalRevenue = subs.filter((s: any) => s.status === "active").reduce((sum: number, s: any) => sum + Number(s.price_egp || 0), 0);

  const conversionRate = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;
  const churnRate = totalUsers > 0 ? Math.round((expiredUsers / totalUsers) * 100) : 0;
  const arpu = paidUsers > 0 ? Math.round(totalRevenue / paidUsers) : 0;

  // top plans
  const planCounts: Record<string, { count: number; revenue: number }> = {};
  subs.forEach((s: any) => {
    if (s.status === "active") {
      if (!planCounts[s.interval]) planCounts[s.interval] = { count: 0, revenue: 0 };
      planCounts[s.interval].count += 1;
      planCounts[s.interval].revenue += Number(s.price_egp || 0);
    }
  });
  const topPlans = Object.entries(planCounts).map(([plan, v]) => ({ plan, count: v.count, revenue: v.revenue }));

  return NextResponse.json({
    total_users: totalUsers,
    active_users: activeUsers,
    trial_users: trialUsers,
    paid_users: paidUsers,
    expired_users: expiredUsers,
    total_revenue: totalRevenue,
    monthly_revenue: monthlyRevenue,
    yearly_revenue: yearlyRevenue,
    conversion_rate: conversionRate,
    churn_rate: churnRate,
    arpu: arpu,
    top_plans: topPlans,
  });
}
