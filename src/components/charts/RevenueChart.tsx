"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/components/i18n/useTranslation";

const COLORS = ["#3b82f6", "#a855f7", "#10b981", "#f59e0b", "#ef4444"];

const RADIANTS = [
  { fill: "#3b82f6", stroke: "#3b82f6" },
  { fill: "#a855f7", stroke: "#a855f7" },
  { fill: "#10b981", stroke: "#10b981" },
];

export interface RevenueData {
  name: string;
  revenue: number;
  invoices: number;
  expenses: number;
  profit: number;
}

export interface CategoryData {
  name: string;
  value: number;
}

export function RevenueChart({ data }: { data: RevenueData[] }) {
  const { lang } = useTranslation();
  const labels = lang === "ar" ? {
    revenue: "الإيرادات",
    invoices: "الفواتير",
    expenses: "المصروفات",
    profit: "الأرباح",
  } : {
    revenue: "Revenue",
    invoices: "Invoices",
    expenses: "Expenses",
    profit: "Profit",
  };

  return (
    <Card className="glass-card rounded-2xl overflow-hidden border border-border-subtle">
      <CardHeader>
        <CardTitle className="text-lg">{lang === "ar" ? "الأرباح والإيرادات" : "Revenue & Profit"}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a3a" />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
              />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ backgroundColor: "#161625", border: "1px solid #2a2a3a" }} />
              <Legend verticalAlign="top" align="right" height={36} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", strokeWidth: 2 }} />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", strokeWidth: 2 }} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ fill: "#ef4444", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function RevenueAreaChart({ data }: { data: RevenueData[] }) {
  return (
    <Card className="glass-card rounded-2xl overflow-hidden border border-border-subtle">
      <CardContent className="pt-6 pb-6">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a3a" />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ backgroundColor: "#161625", border: "1px solid #2a2a3a" }} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoryChart({ data, title }: { data: CategoryData[]; title: string }) {
  const { lang } = useTranslation();
  return (
    <Card className="glass-card rounded-2xl overflow-hidden border border-border-subtle">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#161625", border: "1px solid #2a2a3a" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCard({ title, value, change, trend, icon: Icon }: {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const trendColors = {
    up: "text-emerald-400",
    down: "text-rose-400",
    neutral: "text-text-muted",
  };
  return (
    <div className="glass-card p-6 rounded-2xl border border-border-subtle">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">{title}</p>
          <h3 className="text-2xl font-bold text-text-primary">{value}</h3>
          {change && (
            <p className={`text-xs font-medium mt-1 ${trendColors[trend || "neutral"]}`}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : ""} {change}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-neon-blue-500/10 flex items-center justify-center text-neon-blue-400">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}