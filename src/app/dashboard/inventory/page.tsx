export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Package,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/DataTable";

export default async function InventoryPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false });

  const productList = products || [];

  const lowStock = productList.filter(
    (p) => p.track_inventory && p.current_stock <= p.min_stock_alert
  );
  const outOfStock = productList.filter((p) => p.current_stock === 0);
  const totalValue = productList.reduce(
    (sum, p) => sum + Number(p.selling_price || 0) * Number(p.current_stock || 0),
    0
  );

  return (
    <div className="space-y-8 page-transition animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">إدارة المخزون</h1>
          <p className="text-text-muted">تتبع كميات المنتجات وتنبيهات انخفاض المخزون</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass-card p-5 rounded-2xl border border-border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">إجمالي المنتجات</p>
              <h3 className="text-2xl font-bold text-text-primary">{productList.length}</h3>
            </div>
            <Package className="w-8 h-8 text-neon-blue-400" />
          </div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">قيمة المخزون</p>
              <h3 className="text-2xl font-bold text-text-primary">
                {new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0 }).format(totalValue)}
              </h3>
            </div>
            <DollarSign className="w-8 h-8 text-electric-purple-400" />
          </div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">منخفض المخزون</p>
              <h3 className={`text-2xl font-bold ${lowStock.length > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {lowStock.length}
              </h3>
            </div>
            <AlertTriangle className={`w-8 h-8 ${lowStock.length > 0 ? "text-rose-400" : "text-emerald-400"}`} />
          </div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">نفاد المخزون</p>
              <h3 className={`text-2xl font-bold ${outOfStock.length > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {outOfStock.length}
              </h3>
            </div>
            <TrendingDown className={`w-8 h-8 ${outOfStock.length > 0 ? "text-rose-400" : "text-emerald-400"}`} />
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="glass-card p-6 rounded-2xl border border-rose-500/30 bg-rose-500/5">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5" />
            <div>
              <h3 className="font-bold text-text-primary">تنبيهات انخفاض المخزون</h3>
              <p className="text-sm text-text-secondary">
                المنتجات التالية تحتاج إلى إعادة طلب عاجلة
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-xs font-medium text-text-muted uppercase">
                  <th className="pb-3 pr-4">المنتج</th>
                  <th className="pb-3 pr-4 text-right">المخزون الحالي</th>
                  <th className="pb-3 pr-4 text-right">الحد الأدنى</th>
                  <th className="pb-3 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id} className="border-b border-border-subtle">
                    <td className="py-3 pr-4 text-text-secondary">{p.name}</td>
                    <td className="py-3 pr-4 text-right font-mono text-xs text-rose-400">{p.current_stock}</td>
                    <td className="py-3 pr-4 text-right font-mono text-xs text-text-muted">{p.min_stock_alert}</td>
                    <td className="py-3 text-center">
                      <Button  variant="outline" className="p-1.5">
                        <TrendingUp className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-border-subtle">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-lg">قائمة المنتجات والمخزون</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-bg-card-hover border-b border-border-subtle">
                <tr>
                  <th className="pb-4 pr-4 text-xs font-medium text-text-muted uppercase">المنتج</th>
                  <th className="pb-4 pr-4 text-xs font-medium text-text-muted uppercase text-right">SKU</th>
                  <th className="pb-4 pr-4 text-xs font-medium text-text-muted uppercase text-right">الفئة</th>
                  <th className="pb-4 pr-4 text-xs font-medium text-text-muted uppercase text-right">سعر البيع</th>
                  <th className="pb-4 pr-4 text-xs font-medium text-text-muted uppercase text-right">المخزون</th>
                  <th className="pb-4 text-xs font-medium text-text-muted uppercase text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {productList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-text-muted">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد منتجات في المخزون</p>
                    </td>
                  </tr>
                ) : (
                  productList.map((p) => {
                    const isLowStock = p.track_inventory && p.current_stock <= p.min_stock_alert;
                    const isOut = p.current_stock === 0;
                    return (
                      <tr key={p.id} className={`border-b border-border-subtle hover:bg-bg-card-hover transition-colors ${isOut ? "bg-rose-500/5" : ""}`}>
                        <td className="py-4 pr-4 text-text-primary">{p.name}</td>
                        <td className="py-4 pr-4 text-right font-mono text-xs text-text-muted">{p.sku || "—"}</td>
                        <td className="py-4 pr-4 text-right text-xs text-text-muted">{p.category || "—"}</td>
                        <td className="py-4 pr-4 text-right font-mono text-xs text-text-secondary">
                          {new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0 }).format(Number(p.selling_price || 0))}
                        </td>
                        <td className="py-4 pr-4 text-right font-mono text-xs">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${isOut ? "bg-rose-500/10 text-rose-400" : isLowStock ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                            {p.current_stock}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <Badge
                            variant={isOut ? "destructive" : isLowStock ? "default" : "success"}
                            
                          >
                            {isOut ? "نفذ المخزون" : isLowStock ? "منخفض" : "متوفر"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </div>
    </div>
  );
}