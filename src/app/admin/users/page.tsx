export const dynamic = "force-dynamic";

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { verifyAdminSessionToken } from "@/lib/auth/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit3, Shield, AlertCircle } from "lucide-react";

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("fatora_admin_session")?.value;

  if (!token) redirect("/admin/login");
  const payload = await verifyAdminSessionToken(token);
  if (!payload) redirect("/admin/login");

  const sb = createSupabaseServiceClient();
  const { data: users } = await sb
    .from("profiles")
    .select("*, companies(name, name_ar)")
    .order("created_at", { ascending: false });

  const userList = users || [];

  const columns = [
    { key: "full_name", header: "الاسم", sortable: true },
    { key: "email", header: "البريد الإلكتروني", sortable: true },
    { key: "subscription_status", header: "حالة الاشتراك", sortable: true },
    { key: "subscription_plan", header: "الخطة", sortable: true },
    { key: "created_at", header: "تاريخ الانضمام", sortable: true },
  ];

  return (
    <div className="space-y-8 page-transition animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">إدارة المستخدمين</h1>
          <p className="text-text-muted">إدارة حسابات المستخدمين والاشتراكات</p>
        </div>
        <Button className="shadow-glow-purple">
          <Shield className="w-4 h-4 mr-2" /> مستخدم جديد
        </Button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-border-subtle">
        {userList.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-text-primary">لا توجد مستخدمين</h3>
            <p className="text-text-muted">لا يوجد مستخدمين مسجلين في النظام</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={userList}
            actions={[
              {
                label: "تعديل",
                icon: Edit3,
                variant: "outline",
                onClick: (row) => {
                  // Handle edit
                },
              },
              {
                label: "حذف",
                icon: Trash2,
                variant: "destructive",
                onClick: (row) => {
                  if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
                    // Handle delete
                  }
                },
              },
            ]}
          />
        )}
      </div>

      {/* Subscription status summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="glass-card p-6 rounded-2xl border border-border-subtle">
          <h3 className="text-lg font-bold text-text-primary mb-4">توزيع الحالات</h3>
          <div className="space-y-3">
            {["active", "trial", "expired", "canceled", "past_due"].map((status) => {
              const count = userList.filter((u) => u.subscription_status === status).length;
              const labels: Record<string, string> = {
                active: "نشط",
                trial: "تجربة مجانية",
                expired: "منتهي",
                canceled: "ملغي",
                past_due: "متأخر",
              };
              return (
                <div key={status} className="flex items-center justify-between p-3 rounded-xl bg-bg-card-hover border border-border-subtle/50">
                  <span className="text-sm text-text-secondary">{labels[status]}</span>
                  <Badge variant="default">{count}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}