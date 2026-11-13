export const dynamic = "force-dynamic";

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { verifyAdminSessionToken } from "@/lib/auth/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table/DataTable";
import { Trash2, Edit3, Plus } from "lucide-react";

export default async function AdminPlansPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("fatora_admin_session")?.value;

  if (!token) redirect("/admin/login");
  const payload = await verifyAdminSessionToken(token);
  if (!payload) redirect("/admin/login");

  const sb = createSupabaseServiceClient();
  const { data: plans } = await sb
    .from("subscription_plans")
    .select("*")
    .order("sort_order", { ascending: true });

  const planList = plans || [];

  return (
    <div className="space-y-8 page-transition animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">إدارة الخطط والأسعار</h1>
          <p className="text-text-muted">إدارة خطط الاشتراك والأسعار والمزايا</p>
        </div>
        <Button className="shadow-glow-purple">
          <Plus className="w-4 h-4 mr-2" /> خطة جديدة
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {planList.map((plan) => (
          <Card key={plan.id} className={`glass-card p-6 rounded-2xl border border-border-subtle hover:bg-bg-card-hover transition-colors ${plan.is_popular ? "ring-1 ring-neon-blue-500" : ""}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-text-primary">{plan.name_ar}</h3>
                <p className="text-sm text-text-muted">{plan.name}</p>
              </div>
              {plan.is_popular && (
                <Badge variant="default" className="text-xs px-2 py-1">
                  الأكثر شيوعاً
                </Badge>
              )}
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-text-primary">
                {plan.price_monthly_egp}
              </span>
              <span className="text-text-muted">جنيه / شهر</span>
            </div>
            <p className="text-sm text-text-secondary mb-6">{plan.description_ar || plan.description}</p>
            <div className="space-y-2 mb-6">
              {plan.features_ar?.map((f: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-blue-500" />
                  {f}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => editPlan(plan)}>
                <Edit3 className="w-3 h-3 mr-1" /> تعديل
              </Button>
              <Button variant="destructive" size="sm" onClick={() => deletePlan(plan.id)}>
                <Trash2 className="w-3 h-3 mr-1" /> حذف
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  function editPlan(plan: any) {
    // TODO: Open edit modal
    console.log("Edit plan:", plan);
  }

  function deletePlan(id: string) {
    if (confirm("هل أنت متأكد من حذف هذه الخطة؟")) {
      // TODO: Delete plan
    }
  }
}