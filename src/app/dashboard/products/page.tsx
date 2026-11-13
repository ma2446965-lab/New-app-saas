export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProductManager } from "@/components/inventory/ProductManager";

export default async function ProductsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <div className="space-y-8 page-transition animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">المنتجات والخدمات</h1>
          <p className="text-text-muted">إدارة منتجاتك وخدماتك وتتبع المخزون</p>
        </div>
      </div>
      <ProductManager companyId={profile.company_id!} userId={user.id} />
    </div>
  );
}