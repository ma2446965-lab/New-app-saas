export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TrendingUp } from "lucide-react";
import { getServerTranslations } from "@/lib/i18n-server";
import { SubscriptionManager } from "@/components/subscription/SubscriptionManager";

export default async function SubscriptionPage() {
  const supabase = await createServerSupabaseClient();
  const { lang } = await getServerTranslations();
  const { data: { user } } = await supabase.auth.getUser();

  const [plans, profile] = await Promise.all([
    supabase.from("subscription_plans").select("*").order("sort_order", { ascending: true }),
    supabase.from("profiles").select("*").eq("id", user?.id).single(),
  ]);

  return (
    <div className="space-y-8 page-transition animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue-600 to-electric-purple-600 flex items-center justify-center text-white shadow-glow-purple">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">اشتراكك</h1>
            <p className="text-text-muted">إدارة خطة الاشتراك والفوترة</p>
          </div>
        </div>
      </div>
      <SubscriptionManager
        plans={plans.data || []}
        profile={profile}
        lang={lang}
      />
    </div>
  );
}