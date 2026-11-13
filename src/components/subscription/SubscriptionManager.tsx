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
      "يرجى تأكيد الدفع لتفعيل الاشتراك.",
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    // Record the request in the database (pending)
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

  if (loading) return <div className="py-10 text-center text-gray-500">جاري التحميل...</div>;

  const isExpired = profile?.subscription_status === "expired" || profile?.subscription_status === "canceled";
  const isActive = profile?.subscription_status === "active";

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">الخطة الحالية</h2>
            <p className="text-gray-600 text-sm">{profile?.email}</p>
          </div>
          <Badge variant={isActive ? "default" : trialActive ? "secondary" : "destructive"}>
            {isActive ? "نشط" : trialActive ? "تجربة مجانية" : "منتهي/ملغي"}
          </Badge>
        </div>

        {trialActive ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="font-bold text-amber-800">التجربة المجانية</span>
            </div>
            <p className="text-amber-700 text-sm mb-3">
              تبدأ تجربتك المجانية من تاريخ التسجيل وتنتهي تلقائياً بعد 72 ساعة (3 أيام) من الخادم.
            </p>
            <div className="text-lg font-mono font-bold text-amber-800">{daysLeft} أيام متبقية</div>
            <p className="text-xs text-amber-600 mt-2">ينتهي في: {formatDate(profile.trial_ends_at!, "ar")}</p>
          </div>
        ) : null}

        {isExpired && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <span className="text-red-700 font-medium">انتهت صلاحية اشتراكك. يرجى اختيار خطة للمتابعة.</span>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={() => (location.href = "/dashboard/subscription")}
            disabled={isActive || trialActive}
            className="opacity-100"
          >
            {trialActive ? "ترقية الاشتراك" : "اختر خطة اشتراك"}
          </Button>
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-900">اختر خطة اشتراك</h2>
      <p className="text-gray-600 text-sm mb-6">
        عند اختيار خطة سيتم توجيهك إلى واتساب لإرسال طلب الاشتراك. يتم تفعيل الاشتراك يدوياً من الإدارة بعد تأكيد الدفع.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.filter((p: Plan) => p.is_active).map((plan: Plan) => {
          const popular = plan.is_popular;
          return (
            <Card key={plan.id} className={`p-6 rounded-2xl border relative flex flex-col ${popular ? "ring-2 ring-primary bg-amber-50/50" : "border-gray-200"}`}>
              {popular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-t-lg">الأكثر شيوعاً</span>
              )}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-gray-900">{plan.price_monthly_egp}</span>
                <span className="text-sm text-gray-500">جنيه / شهر</span>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{plan.description_ar || plan.description}</p>
              <ul className="flex-1 space-y-2 text-sm text-gray-600 mb-4">
                {(plan.features_ar || plan.features || []).map((f: any, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-green-100 flex items-center justify-center text-[10px] text-green-700">✓</span>
                    {typeof f === "string" ? f : f}
                  </li>
                ))}
              </ul>
              <div className="space-y-2">
                <Button
                  onClick={() => requestViaWhatsApp(plan, "monthly")}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" /> اشتراك شهري - {plan.price_monthly_egp} ج.م
                </Button>
                {plan.price_yearly_egp > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => requestViaWhatsApp(plan, "yearly")}
                    className="w-full"
                  >
                    <Smartphone className="w-4 h-4 mr-2" /> اشتراك سنوي - {plan.price_yearly_egp} ج.م
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white font-medium shadow-lg z-50 flex items-center gap-2 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          <Send className="w-4 h-4" /> {toast.msg}
        </div>
      )}
    </div>
  );
}
