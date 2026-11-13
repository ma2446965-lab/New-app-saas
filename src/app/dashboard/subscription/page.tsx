export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from "@/lib/supabase/server";
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">اشتراكك</h1>
      </div>
      <SubscriptionManager
        plans={plans.data || []}
        profile={profile}
        lang={lang}
      />
    </div>
  );
}
