export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerTranslations, isRTL } from "@/lib/i18n-server";
import { formatCurrencyEGP, formatDate, formatRelative } from "@/lib/utils";

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

  const isRtl = isRTL(lang);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("overviewTitle")}</h1>
          <p className="text-gray-600">
            {t("welcomeUser", { name: profile?.full_name || user?.email || "" })}
          </p>
        </div>
        {trialActive && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-amber-50 text-amber-800 text-xs font-medium border-amber-200">
            ⏳ {t("trial")} — {t("daysLeft")}: {daysLeft}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("totalInvoices")}
          value={invoices?.length || 0}
          trend="+12%"
        />
        <StatCard
          title={t("totalClients")}
          value={0}
          trend="0"
        />
        <StatCard
          title={t("totalRevenue")}
          value={formatCurrencyEGP(
            invoices?.reduce((sum, i) => sum + Number(i.total || 0), 0) || 0,
            lang
          )}
          trend="+8%"
        />
        <StatCard
          title={t("pendingInvoices")}
          value={
            invoices?.filter((i) => i.status === "sent" || i.status === "draft")
              .length || 0
          }
          trend="0"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="p-6 rounded-xl border border-gray-200 bg-white">
            <h2 className="text-lg font-bold mb-4">الفواتير الأخيرة</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="pb-3 font-medium">{t("invoiceNumber")}</th>
                    <th className="pb-3 font-medium">{t("client")}</th>
                    <th className="pb-3 font-medium">{t("amount")}</th>
                    <th className="pb-3 font-medium">{t("status")}</th>
                    <th className="pb-3 font-medium">{t("date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoices || []).map((inv: any) => (
                    <tr key={inv.id} className="border-b last:border-0">
                      <td className="py-3 font-mono text-xs">{inv.invoice_number}</td>
                      <td className="py-3">{inv.client_name}</td>
                      <td className="py-3">{formatCurrencyEGP(Number(inv.total), lang)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          inv.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : inv.status === "sent"
                            ? "bg-blue-100 text-blue-700"
                            : inv.status === "overdue"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-gray-500">
                        {formatRelative(inv.created_at, lang)}
                      </td>
                    </tr>
                  ))}
                  {!invoices || invoices.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-500">{t("noInvoices")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-xl border border-gray-200 bg-white">
            <h2 className="text-lg font-bold mb-4">{t("subscriptionStatus")}</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("currentPlan")}</span>
                <span className="font-medium">{profile?.subscription_plan || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("active") === "نشط" ? "الحالة" : "Status"}</span>
                <span className={`font-medium ${profile?.subscription_status === "active" ? "text-green-600" : profile?.subscription_status === "trial" ? "text-amber-600" : "text-red-600"}`}>
                  {profile?.subscription_status === "trial" ? t("trial") : profile?.subscription_status}
                </span>
              </div>
              {trialActive && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("endsOn")}</span>
                  <span className="font-medium">{formatDate(profile.trial_ends_at!, lang)}</span>
                </div>
              )}
              <div className="pt-3">
                {trialActive ? (
                  <button
                    className="w-full py-2 px-4 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => (location.href = "/dashboard/subscription")}
                  >
                    {t("upgradeNow")}
                  </button>
                ) : (
                  <button
                    className="w-full py-2 px-4 rounded-lg bg-primary text-white text-sm hover:bg-primary/90"
                    onClick={() => (location.href = "/dashboard/subscription")}
                  >
                    {t("subscribeNow")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  trend: string;
}

function StatCard({ title, value, trend }: StatCardProps) {
  return (
    <div className="p-5 rounded-xl border border-gray-200 bg-white">
      <p className="text-sm text-gray-500">{title}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-xs text-green-600 mt-1">{trend}</p>
    </div>
  );
}
