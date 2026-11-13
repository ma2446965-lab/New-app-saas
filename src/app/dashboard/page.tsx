export const dynamic = "force-dynamic";

import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerTranslations, isRTL } from "@/lib/i18n-server";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyEGP, formatDate, formatRelative } from "@/lib/utils";
import { FileText, Users, CreditCard, User, Clock, ArrowRight, Package } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { lang, t } = await getServerTranslations();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const trialActive =
    profile?.subscription_status === "trial" &&
    profile?.trial_ends_at &&
    new Date(profile.trial_ends_at) > new Date();

  const daysLeft = trialActive
    ? Math.ceil(
        (new Date(profile.trial_ends_at!).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const totalAmount = invoices?.reduce((sum, i) => sum + Number(i.total || 0), 0) || 0;

  const statCards = [
    {
      title: t("totalInvoices"),
      value: invoices?.length || 0,
      icon: FileText,
      color: "text-neon-blue-400",
      bg: "bg-neon-blue-500/10",
      border: "border-neon-blue-500/20",
      trend: "+12%",
      trendColor: "text-emerald-400",
    },
    {
      title: t("totalClients"),
      value: 0,
      icon: Users,
      color: "text-electric-purple-400",
      bg: "bg-electric-purple-500/10",
      border: "border-electric-purple-500/20",
      trend: "0",
      trendColor: "text-text-muted",
    },
    {
      title: t("totalRevenue"),
      value: formatCurrencyEGP(totalAmount, lang),
      icon: CreditCard,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      trend: "+8%",
      trendColor: "text-emerald-400",
    },
    {
      title: t("pendingInvoices"),
      value: invoices?.filter((i) => i.status === "sent" || i.status === "draft").length || 0,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      trend: "0",
      trendColor: "text-text-muted",
    },
  ];

  return (
    <div className="space-y-8 page-transition">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-text-primary">{t("overviewTitle")}</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-blue-500/10 text-neon-blue-400 text-xs font-medium border border-neon-blue-500/20">
              {t("active")}
            </span>
          </div>
          <p className="text-text-secondary">
            {t("welcomeUser", { name: profile?.full_name || user?.email || "" })}
          </p>
        </div>

        {trialActive && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium animate-pulse-glow">
            <Clock className="w-4 h-4" />
            <span>{t("trial")} — {t("daysLeft")}: {daysLeft}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={stat.title} className="glass-card p-6 animate-slide-up" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
            <div className="flex items-center justify-between mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.border}`}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <span className={stat.trendColor + " text-xs font-medium"}>
                {stat.trend}
              </span>
            </div>
            <p className="text-text-muted text-sm mb-2">{stat.title}</p>
            <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        <div className="lg:col-span-2">
          <Card className="glass-card p-0 overflow-hidden animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="p-6 pb-4 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-primary">{t("invoicesTitle")}</h2>
                <Link href="/dashboard/invoices" className="text-sm text-neon-blue-400 hover:text-neon-blue-300 font-medium flex items-center gap-1">
                  عرض الكل <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle text-xs font-medium text-text-muted uppercase tracking-wider">
                      <th className="pb-4 pr-4">{t("invoiceNumber")}</th>
                      <th className="pb-4 pr-4">{t("client")}</th>
                      <th className="pb-4 pr-4">{t("amount")}</th>
                      <th className="pb-4 pr-4">{t("status")}</th>
                      <th className="pb-4">{t("date")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoices || []).map((inv) => (
                      <tr key={inv.id} className="border-b border-border-subtle hover:bg-bg-card-hover transition-colors group">
                        <td className="py-4 pr-4 font-mono text-xs text-text-primary">{inv.invoice_number}</td>
                        <td className="py-4 pr-4 text-text-secondary">{inv.client_name}</td>
                        <td className="py-4 pr-4 text-text-primary">{formatCurrencyEGP(Number(inv.total), lang)}</td>
                        <td className="py-4 pr-4">
                          <Badge variant={inv.status === "paid" ? "success" : inv.status === "sent" ? "info" : inv.status === "overdue" ? "destructive" : "default"}>
                            {inv.status === "draft" ? t("draft") : inv.status === "sent" ? t("sent") : inv.status === "paid" ? t("paid") : t("overdue")}
                          </Badge>
                        </td>
                        <td className="py-4 text-xs text-text-muted">{formatRelative(inv.created_at, lang)}</td>
                      </tr>
                    ))}
                    {!invoices || invoices.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-text-muted">
                          <Package className="w-8 h-8 mx-auto mb-3 opacity-50" />
                          <p>{t("noInvoices")}</p>
                          <p className="text-xs text-text-muted mt-2">{t("createFirstInvoice")}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Status */}
        <div className="lg:col-span-1">
          <Card className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <h2 className="text-lg font-bold text-text-primary mb-6">{t("subscriptionStatus")}</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-bg-card-hover border border-border-subtle">
                <div>
                  <p className="text-xs text-text-muted">{t("currentPlan")}</p>
                  <p className="text-sm font-semibold text-text-primary">{profile?.subscription_plan || "—"}</p>
                </div>
                <Badge variant="success">
                  {profile?.subscription_status === "active" ? t("active") : profile?.subscription_status === "trial" ? t("trial") : profile?.subscription_status}
                </Badge>
              </div>
              {trialActive && (
                <div className="flex justify-between items-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div>
                    <p className="text-xs text-text-muted">{t("endsOn")}</p>
                    <p className="text-sm font-semibold text-text-primary">{formatDate(profile.trial_ends_at!, lang)}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-400">{daysLeft} {t("daysLeft")}</span>
                </div>
              )}
              <div className="pt-4">
                <Button
                  className="w-full py-3 rounded-xl shadow-glow-purple hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                  onClick={() => (location.href = "/dashboard/subscription")}
                >
                  {trialActive ? t("upgradeNow") : t("subscribeNow")}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}