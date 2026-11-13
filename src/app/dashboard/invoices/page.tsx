export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InvoiceManager } from "@/components/invoice/InvoiceManager";

export default async function InvoicesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [invoices, clients] = await Promise.all([
    supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("clients")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">الفواتير</h1>
      </div>
      <InvoiceManager
        invoices={(invoices.data || []).map((i: any) => ({ ...i, total: Number(i.total || 0) }))}
        clients={clients.data || []}
      />
    </div>
  );
}
