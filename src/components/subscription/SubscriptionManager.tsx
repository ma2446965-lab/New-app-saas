"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrencyEGP, formatDate } from "@/lib/utils";
import { Send, Clock, Crown, Smartphone } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  price_monthly_egp: number;
  price_yearly_egp: number;
  max_invoices: number | null;
  max_clients: number | null;
  features: any[];
  features_ar?: any[];
  is_popular: boolean;
  is_active: boolean;
}

export function SubscriptionManager({ plans, profile, lang }: any) {
  const supabase = createClientComponentClient();
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadSub();
    const h = () => loadSub();
    window.addEventListener("subscription-updated", h);
    return () => window.removeEventListener("subscription-updated", h);
  }, []);

  const loadSub = async () => {
    const { data } = await supabase.from("subscriptions").select("*").eq("user_id", profile?.id).order("created_at", { ascending: false }).limit(1);
    setSub((data && data[0]) || null);
    setLoading(false);
  };

  const trialActive =
    profile?.subscription_status === "trial" &&
    profile?.trial_ends_at &&
    new Date(profile.trial_ends_at) > new Date();
  const daysLeft = trialActive
    ? Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const WHATSAPP = "201148469161";

  const requestViaWhatsApp = (plan: Plan, interval: "monthly" | "yearly") => {
    const price = interval === "yearly" ? plan.price_yearly_egp : plan.price_monthly_egp;
    const durationAr = interval === "yearly" ? "سنة واحدة" : "شهر واحد";
    const now = new Date();
    const dateStr = now.toLocaleDateString("ar-EG");
    const message = [
      `طلب اشتراك جديد - فاتورة SaaS`,
      `اسم العميل: ${profile?.full_name || "غير محدد"}`,
      `البريد الإلكتروني: ${profile?.email || "—"}`,
      `رقم الحساب (Account ID): ${profile?.account_id || "—"}`,
      `الخطة المختارة: ${plan.name_ar || plan.name} (${durationAr})`,
      `سعر الاشتراك: ${price} جنيه مصري`,
      `مدة الاشتراك: ${durationAr}`,
      `تاريخ الطلب: ${dateStr}`,
      "",
      `يرجى تأكيد الدفع لتفعيل الاشتراك.`,
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    supabase
      .from("subscription_requests")
      .insert({
        user_id: profile?.id,
        customer_name: profile?.full_name || "",
        customer_email: profile?.email || "",
        account_id: profile?.account_id || "",
        plan_name: plan.name,
        plan_name_ar: plan.name_ar || plan.name,
        price_egp: price,
        duration: interval,
        status: "pending",
      })
      .then(() => {
        setToast({ msg: "تم فتح واتساب لإرسال طلب الاشتراك. سيقوم المدير بتفعيله بعد تأكيد الدفع.", type: "success" });
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-24 h-24 rounded-full mx-auto mb-4" />
        <h2 className="text-text-muted text-center">جاري التحميل...</h2>
      </div>
    );
  }

  const isExpired = profile?.subscription_status === "expired" || profile?.subscription_status === "canceled";
  const isActive = profile?.subscription_status === "active";

  return (
    <div className="space-y-8 page-transition animate-fade-in">
      {/* Current Plan Card */}
      <Card className="glass-card p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-lg font-bold text-text-primary">الخطة الحالية</h2>
            <p className="text-text-muted text-sm">{profile?.email}</p>
          </div>
          <Badge variant={isActive ? "success" : trialActive ? "info" : "destructive"}>
            {isActive ? "نشط" : trialActive ? "تجربة مجانية" : "منتهي/ملغي"}
          </Badge>
        </div>

        {trialActive ? (
          <div className="flex items-start gap-4 px-6 py-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-8 animate-pulse-glow">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-amber-300">التجربة المجانية</span>
              </div>
              <p className="text-amber-200 text-sm mb-3">
                تبدأ تجربتك المجانية من تاريخ التسجيل وتنتهي تلقائياً بعد 72 ساعة (3 أيام).
              </p>
              <div className="text-2xl font-mono font-bold text-amber-300">{daysLeft} أيام متبقية</div>
              <p className="text-xs text-amber-200 mt-2">ينتهي في: {formatDate(profile.trial_ends_at!, lang)}</p>
            </div>
          </div>
        ) : null}

        {isExpired && (
          <div className="flex items-start gap-4 px-6 py-6 rounded-2xl bg-red-500/10 border border-red-500/20 mb-8">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-red-400 font-medium">انتهت صلاحية اشتراكك</span>
              <p className="text-red-200 text-sm mt-1">يرجى اختيار خطة للمتابعة.</p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={() => (location.href = "/dashboard/subscription")}
            disabled={isActive || trialActive}
            className="w-full shadow-glow-purple hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] opacity-100"
          >
            {trialActive ? "ترقية الاشتراك" : "اختر خطة اشتراك"}
          </Button>
        </div>
      </Card>

      {/* Plans */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-electric-purple-400" />
            <h2 className="text-lg font-bold text-text-primary">اختر خطة اشتراك</h2>
          </div>
          <p className="text-text-muted">عند اختيار خطة سيتم توجيهك إلى واتساب لإرسال طلب الاشتراك.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.filter((p: Plan) => p.is_active).map((plan: Plan) => {
            const popular = plan.is_popular;
            return (
              <Card key={plan.id} className={`glass-card p-8 rounded-3xl border relative flex flex-col group ${popular ? "border-neon-blue-500/40 shadow-[0_0_40px_rgba(37,99,235,0.25)] scale-[1.02] z-10" : "border-border-subtle"}`}>
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-neon-blue-600 to-electric-purple-600 text-xs font-bold text-white shadow-glow-purple">
                      الأكثر شيوعاً
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-1 mb-4">
                  <span className={`text-3xl font-bold ${popular ? "text-neon-blue-400" : "text-text-primary"}`}>{plan.price_monthly_egp}</span>
                  <span className="text-sm text-text-muted">جنيه / شهر</span>
                </div>
                <p className="text-sm text-text-muted mb-6 line-clamp-2">{plan.description_ar || plan.description}</p>
                <ul className="flex-1 space-y-3 text-sm text-text-muted mb-6">
                  {(plan.features_ar || plan.features || []).map((f: any, i: number) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <span className="text-[10px]">✓</span>
                      </div>
                      <span>{typeof f === "string" ? f : f}</span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-3">
                  <Button
                    onClick={() => requestViaWhatsApp(plan, "monthly")}
                    className="w-full py-3 rounded-xl shadow-glow-purple hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] text-lg font-semibold"
                  >
                    <Send className="w-4 h-4 mr-2" /> اشتراك شهري - {plan.price_monthly_egp} ج.م
                  </Button>
                  {plan.price_yearly_egp > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => requestViaWhatsApp(plan, "yearly")}
                      className="w-full py-3 rounded-xl text-lg font-semibold glass-card"
                    >
                      <Smartphone className="w-4 h-4 mr-2" /> اشتراك سنوي - {plan.price_yearly_egp} ج.م
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-4 right-4 px-5 py-3.5 rounded-2xl text-white font-medium shadow-[0_0_30px_rgba(0,0,0,0.4)] z-50 animate-slide-up ${toast.type === "success" ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-red-600"}`}>
          <Send className="w-4 h-4 mr-2" /> {toast.msg}
        </div>
      )}
    </div>
  );
}