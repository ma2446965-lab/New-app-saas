export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageCircle, Bot, BarChart3, AlertTriangle, CheckCircle2 } from "lucide-react";

export default async function AIAssistantPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, companies(*)")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Check if AI assistant is enabled in plan
  const aiEnabled = profile.subscription_status === "active" || profile.subscription_status === "trial";

  return (
    <div className="space-y-8 page-transition animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-text-primary">المساعد الذكي للأعمال</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-blue-500/10 text-neon-blue-400 text-xs font-medium border border-neon-blue-500/20">
              AI Powered
            </span>
          </div>
          <p className="text-text-secondary">
            احصل على رؤى ذكية حول أعمالك بناءً على بياناتك الفعلية. تحليل الأداء، توقع التدفقات النقدية، واكتشاف الفرص والمخاطر.
          </p>
        </div>

        {!aiEnabled && (
          <Card className="glass-card p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-text-primary">ميزة مميزة</h3>
                <p className="text-xs text-text-secondary">المساعد الذكي متوفر في الخطط المدفوعة</p>
              </div>
            </div>
            <Button size="sm" onClick={() => (location.href = "/dashboard/subscription")}>
              ترقية الآن
            </Button>
          </Card>
        )}
      </div>

      {aiEnabled && (
        <div className="glass-card rounded-2xl overflow-hidden border border-border-subtle h-[700px] flex flex-col">
          <CardHeader className="p-0">
            <div className="border-b border-border-subtle p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue-600 to-electric-purple-600 flex items-center justify-center shadow-glow-purple">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg mb-1">المساعد الذكي للأعمال</CardTitle>
                    <p className="text-xs text-text-secondary">محلل أعمال ذكي يعتمد على بياناتك الفعلية</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs px-2 py-1">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> نشط
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <AIAssistant />
          </CardContent>
        </div>
      )}

      {/* Example capabilities */}
      <div className="grid md:grid-cols-3 gap-6">
        <CapabilityCard
          icon={BarChart3}
          title="تحليل الأداء"
          titleEn="Performance Analysis"
          desc="تحليل الإيرادات والمصروفات والأرباح وتحديد نقاط القوة والضعف"
          descEn="Analyze revenue, expenses, and profits to identify strengths and weaknesses"
        />
        <CapabilityCard
          icon={AlertTriangle}
          title="اكتشاف الشذوذ"
          titleEn="Anomaly Detection"
          desc="اكتشاف المصروفات غير الطبيعية والمعاملات المشبوهة تلقائياً"
          descEn="Automatically detect unusual expenses and suspicious transactions"
        />
        <CapabilityCard
          icon={MessageCircle}
          title="توقع التدفق النقدي"
          titleEn="Cash Flow Forecast"
          desc="توقع التدفقات النقدية للأشهر القادمة بناءً على البيانات التاريخية"
          descEn="Forecast cash flow for upcoming months based on historical data"
        />
      </div>
    </div>
  );
}

function CapabilityCard({ icon: Icon, title, titleEn, desc, descEn }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  titleEn: string;
  desc: string;
  descEn: string;
}) {
  const lang = "ar"; // Default, will use translation hook in real implementation
  return (
    <Card className="glass-card p-6 rounded-2xl border border-border-subtle hover:bg-bg-card-hover transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-neon-blue-500/10 flex items-center justify-center text-neon-blue-400 mb-4 group-hover:shadow-glow-blue transition-shadow">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="font-bold text-text-primary text-lg mb-2">{title}</h4>
      <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
    </Card>
  );
}