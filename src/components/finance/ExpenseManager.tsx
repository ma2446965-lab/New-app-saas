"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@/lib/supabase/client";
import {
  Plus,
  Trash2,
  Edit3,
  CreditCard,
  ArrowDown,
  ArrowUp,
  Search,
  Filter,
  FilterIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { useTranslation } from "@/components/i18n/useTranslation";
import { DataTable } from "@/components/data-table/DataTable";

interface Expense {
  id: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  amount: number;
  currency: string;
  expense_date: string;
  category_id: string | null;
  vendor: string | null;
  payment_method: string;
  status: string;
  tags: string[];
  created_at: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  name_ar: string | null;
  color: string;
  icon: string;
}

export function ExpenseManager({ companyId, userId }: { companyId: string; userId: string }) {
  const { lang, t } = useTranslation();
  const supabase = createClientComponentClient();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, []);

  const loadExpenses = async () => {
    let query = supabase
      .from("expenses")
      .select("*")
      .eq("company_id", companyId)
      .order("expense_date", { ascending: false });

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus);
    }

    const { data, error } = await query;
    if (!error) {
      setExpenses(data || []);
    }
    setLoading(false);
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("expense_categories")
      .select("*")
      .eq("company_id", companyId);
    if (!error) {
      setCategories(data || []);
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!e.title.toLowerCase().includes(q) && !(e.title_ar && e.title_ar.toLowerCase().includes(q))) {
        return false;
      }
    }
    if (filterCategory !== "all" && e.category_id !== filterCategory) {
      return false;
    }
    return true;
  });

  const totalExpenses = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const saveExpense = async (formData: any) => {
    try {
      if (editing) {
        await supabase.from("expenses").update(formData).eq("id", editing.id);
      } else {
        await supabase.from("expenses").insert({
          ...formData,
          company_id: companyId,
          user_id: userId,
        });
      }
      setOpen(false);
      setEditing(null);
      loadExpenses();
    } catch (err: any) {
      alert(err.message || "فشل الحفظ");
    }
  };

  const deleteExpense = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المصروف؟")) return;
    await supabase.from("expenses").delete().eq("id", id);
    loadExpenses();
  };

  const columns = [
    { key: "title", header: lang === "ar" ? "عنوان المصروف" : "Expense Title", sortable: true },
    { key: "category_id", header: lang === "ar" ? "الفئة" : "Category", sortable: true },
    { key: "amount", header: lang === "ar" ? "المبلغ" : "Amount", align: "right" as const },
    { key: "payment_method", header: lang === "ar" ? "طريقة الدفع" : "Payment Method", sortable: true },
    { key: "status", header: lang === "ar" ? "الحالة" : "Status", sortable: true },
    { key: "expense_date", header: lang === "ar" ? "التاريخ" : "Date", sortable: true },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-glow-card">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              {lang === "ar" ? "إدارة المصروفات" : "Expense Management"}
            </h2>
            <p className="text-text-muted">
              {lang === "ar" ? "سجل وتتبع مصروفاتك وإيراداتك اليومية" : "Record and track your daily expenses and revenue"}
            </p>
          </div>
        </div>

        <Button onClick={() => setOpen(true)} className="shadow-glow-card">
          <Plus className="w-4 h-4 mr-2" />
          {lang === "ar" ? "مصروف جديد" : "Add Expense"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass-card p-5 rounded-2xl border border-border-subtle">
          <p className="text-xs text-text-muted">{lang === "ar" ? "إجمالي المصروفات" : "Total Expenses"}</p>
          <h3 className="text-2xl font-bold text-text-primary">
            {new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-EG", {
              style: "currency",
              currency: "EGP",
            }).format(totalExpenses)}
          </h3>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-border-subtle">
          <p className="text-xs text-text-muted">{lang === "ar" ? "عدد المصروفات" : "Expense Count"}</p>
          <h3 className="text-2xl font-bold text-text-primary">{filteredExpenses.length}</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-border-subtle">
          <p className="text-xs text-text-muted">{lang === "ar" ? "متوسط المصروف" : "Avg Expense"}</p>
          <h3 className="text-2xl font-bold text-text-primary">
            {new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-EG", {
              style: "currency",
              currency: "EGP",
            }).format(filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0)}
          </h3>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-border-subtle">
          <p className="text-xs text-text-muted">{lang === "ar" ? "هذا الشهر" : "This Month"}</p>
          <h3 className="text-2xl font-bold text-text-primary">
            {new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-EG", {
              style: "currency",
              currency: "EGP",
            }).format(
              filteredExpenses.filter((e) => {
                const d = new Date(e.expense_date);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).reduce((sum, e) => sum + Number(e.amount || 0), 0)
            )}
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder={lang === "ar" ? "البحث عن مصروف..." : "Search expenses..."}
            className="pl-9 glass-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterStatus("all")}
            className={filterStatus === "all" ? "bg-neon-blue-600/10 text-neon-blue-400 border-neon-blue-600/30" : ""}
          >
            {lang === "ar" ? "الكل" : "All"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterStatus("recorded")}
            className={filterStatus === "recorded" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : ""}
          >
            {lang === "ar" ? "مسجل" : "Recorded"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterStatus("pending")}
            className={filterStatus === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : ""}
          >
            {lang === "ar" ? "معلق" : "Pending"}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setFilterCategory("all")}>
            {lang === "ar" ? "جميع الفئات" : "All Categories"}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant="outline"
              size="sm"
              onClick={() => setFilterCategory(cat.id)}
              className={filterCategory === cat.id
                ? `bg-${cat.color.replace("#", "")}/10 text-${cat.color.replace("#", "")} border-${cat.color.replace("#", "")}/30`
                : ""
              }
            >
              {lang === "ar" && cat.name_ar ? cat.name_ar : cat.name}
            </Button>
          ))}
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
            data={filteredExpenses}
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
                onClick: (row) => deleteExpense(row.id),
              },
            ]}
            emptyState={
              <div className="flex flex-col items-center justify-center p-12">
                <CreditCard className="w-16 h-16 opacity-20 mb-4" />
                <h3 className="text-lg font-bold text-text-primary">
                  {lang === "ar" ? "لا توجد مصروفات" : "No expenses"}
                </h3>
                <p className="text-text-muted">
                  {lang === "ar" ? "ابدأ بإضافة مصروف أول" : "Start by adding your first expense"}
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}