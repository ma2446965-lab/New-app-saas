export const dynamic = "force-dynamic";

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { verifyAdminSessionToken } from "@/lib/auth/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table/DataTable";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

export default async function AdminRequestsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("fatora_admin_session")?.value;

  if (!token) redirect("/admin/login");
  const payload = await verifyAdminSessionToken(token);
  if (!payload) redirect("/admin/login");

  const sb = createSupabaseServiceClient();
  const { data: requests } = await sb
    .from("subscription_requests")
    .select("*, profiles(full_name, email)")
    .order("requested_at", { ascending: false });

  const requestList = requests || [];

  const columns = [
    { key: "customer_name", header: "اسم العميل", sortable: true },
    { key: "customer_email", header: "البريد الإلكتروني", sortable: true },
    { key: "plan_name", header: "الخطة", sortable: true },
    { key: "price_egp", header: "السعر (EGP)", align: "right" as const },
    { key: "duration", header: "المدة", sortable: true },
    { key: "status", header: "الحالة", sortable: true },
    { key: "requested_at", header: "تاريخ الطلب", sortable: true },
  ];

  return (
    <div className="space-y-8 page-transition animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">طلبات الاشتراك</h1>
          <p className="text-text-muted">مراجعة وتفعيل طلبات الاشتراك من العملاء</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-border-subtle">
        {requestList.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-text-primary">لا توجد طلبات</h3>
            <p className="text-text-muted">لا توجد طلبات اشتراك pending</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={requestList}
            actions={[
              {
                label: "الموافقة",
                icon: CheckCircle2,
                variant: "default",
                onClick: async (row) => {
                  if (confirm("هل أنت متأكد من الموافقة على هذا الطلب؟")) {
                    await fetch("/api/subscriptions/requests", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        id: row.id,
                        status: "approved",
                        admin_notes: "تم التفعيل من لوحة الإدارة",
                      }),
                    });
                    window.location.reload();
                  }
                },
              },
              {
                label: "الرفض",
                icon: XCircle,
                variant: "destructive",
                onClick: async (row) => {
                  if (confirm("هل أنت متأكد من رفض هذا الطلب؟")) {
                    await fetch("/api/subscriptions/requests", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        id: row.id,
                        status: "rejected",
                        admin_notes: "تم الرفض من لوحة الإدارة",
                      }),
                    });
                    window.location.reload();
                  }
                },
              },
            ]}
          />
        )}
      </div>

      {/* Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        {["pending", "approved", "rejected"].map((status) => {
          const count = requestList.filter((r) => r.status === status).length;
          const labels: Record<string, string> = {
            pending: "معلقة",
            approved: "تمت الموافقة",
            rejected: "مرفوض",
          };
          const colors: Record<string, string> = {
            pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
            approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
            rejected: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          };
          return (
            <div key={status} className={`glass-card p-6 rounded-2xl border border-border-subtle ${colors[status]}`}>
              <h3 className="text-lg font-bold text-text-primary mb-2">{count}</h3>
              <p className="text-sm text-text-secondary">{labels[status]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}