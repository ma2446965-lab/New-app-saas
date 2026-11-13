"use client";

import { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@/lib/supabase/client";
import {
  Plus,
  Trash2,
  Edit3,
  Package,
  DollarSign,
  AlertTriangle,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { useTranslation } from "@/components/i18n/useTranslation";
import { DataTable } from "@/components/data-table/DataTable";

interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  sku: string | null;
  barcode: string | null;
  category: string | null;
  unit: string;
  type: string;
  purchase_price: number;
  selling_price: number;
  currency: string;
  tax_rate: number;
  track_inventory: boolean;
  current_stock: number;
  min_stock_alert: number;
  max_stock: number | null;
  reorder_point: number;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
  tags: string[];
  created_at: string;
}

export function ProductManager({ companyId, userId }: { companyId: string; userId: string }) {
  const { lang, t } = useTranslation();
  const supabase = createClientComponentClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    let query = supabase
      .from("products")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (filterType === "low_stock") {
      query = query.lte("current_stock", 10);
    } else if (filterType === "out_of_stock") {
      query = query.eq("current_stock", 0);
    } else if (filterType === "active") {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (!error) {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) ||
      (p.name_ar && p.name_ar.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q));
  });

  const saveProduct = async (formData: any) => {
    try {
      if (editing) {
        await supabase.from("products").update(formData).eq("id", editing.id);
      } else {
        await supabase.from("products").insert({
          ...formData,
          company_id: companyId,
          user_id: userId,
        });
      }
      setOpen(false);
      setEditing(null);
      loadProducts();
    } catch (err: any) {
      alert(err.message || "فشل الحفظ");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    await supabase.from("products").delete().eq("id", id);
    loadProducts();
  };

  const lowStockCount = products.filter(
    (p) => p.track_inventory && p.current_stock <= p.min_stock_alert
  ).length;

  const columns = [
    { key: "name", header: lang === "ar" ? "اسم المنتج" : "Product Name", sortable: true },
    { key: "sku", header: lang === "ar" ? "المعرف (SKU)" : "SKU", sortable: true },
    { key: "category", header: lang === "ar" ? "الفئة" : "Category", sortable: true },
    { key: "selling_price", header: lang === "ar" ? "سعر البيع" : "Sell Price", align: "right" as const },
    { key: "current_stock", header: lang === "ar" ? "المخزون" : "Stock", align: "center" as const },
    { key: "type", header: lang === "ar" ? "النوع" : "Type", sortable: true },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue-600 to-electric-purple-600 flex items-center justify-center shadow-glow-blue">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              {lang === "ar" ? "إدارة المنتجات" : "Product Management"}
            </h2>
            <p className="text-text-muted">
              {lang === "ar" ? "أضف وادِر منتجاتك وخدماتك وتتبع المخزون" : "Add and manage your products and track inventory"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setOpen(true)} className="shadow-glow-purple">
            <Plus className="w-4 h-4 mr-2" />
            {lang === "ar" ? "منتج جديد" : "Add Product"}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card p-5 rounded-2xl border border-border-subtle">
          <p className="text-xs text-text-muted">{lang === "ar" ? "إجمالي المنتجات" : "Total Products"}</p>
          <h3 className="text-2xl font-bold text-text-primary">{products.length}</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-border-subtle">
          <p className="text-xs text-text-muted">{lang === "ar" ? "منخفض المخزون" : "Low Stock"}</p>
          <h3 className={`text-2xl font-bold ${lowStockCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
            {lowStockCount}
          </h3>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-border-subtle">
          <p className="text-xs text-text-muted">{lang === "ar" + "" ? "قيمة المخزون" : "Inventory Value"}</p>
          <h3 className="text-2xl font-bold text-text-primary">
            {new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-EG", {
              style: "currency",
              currency: "EGP",
            }).format(
              products.reduce((sum, p) => sum + Number(p.selling_price || 0) * Number(p.current_stock || 0), 0)
            )}
          </h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder={lang === "ar" ? "البحث عن منتج..." : "Search products..."}
            className="pl-9 glass-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterType("all")}
            className={filterType === "all" ? "bg-neon-blue-600/10 text-neon-blue-400 border-neon-blue-600/30" : ""}
          >
            {lang === "ar" ? "الكل" : "All"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterType("low_stock")}
            className={filterType === "low_stock" ? "bg-rose-500/10 text-rose-400 border-rose-500/30" : ""}
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            {lang === "ar" ? "منخفض المخزون" : "Low Stock"}
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-border-subtle">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="skeleton w-24 h-24 rounded-full mx-auto mb-4" />
            <p className="text-text-muted">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredProducts}
            actions={[
              {
                label: lang === "ar" ? "تعديل" : "Edit",
                icon: Edit3,
                variant: "outline",
                onClick: (row) => {
                  setEditing(row);
                  setOpen(true);
                },
              },
              {
                label: lang === "ar" ? "حذف" : "Delete",
                icon: Trash2,
                variant: "destructive",
                onClick: (row) => deleteProduct(row.id),
              },
            ]}
            emptyState={
              <div className="flex flex-col items-center justify-center p-12">
                <Package className="w-16 h-16 opacity-20 mb-4" />
                <h3 className="text-lg font-bold text-text-primary">
                  {lang === "ar" ? "لا توجد منتجات" : "No products"}
                </h3>
                <p className="text-text-muted">
                  {lang === "ar" ? "ابدأ بإضافة منتج أول" : "Start by adding your first product"}
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}