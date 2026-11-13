"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MessageCircle,
  Bot,
  Sparkles,
  Clock,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  PieChart,
  Copy,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/components/i18n/useTranslation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  contentAr?: string;
  data?: any;
  createdAt: string;
}

interface QuickAction {
  label: string;
  labelAr: string;
  icon: React.ComponentType<{ className?: string }>;
  query: string;
  queryAr: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Analyze performance",
    labelAr: "تحليل الأداء",
    icon: BarChart3,
    query: "Analyze my business performance for this month",
    queryAr: "حلل أداء عملي لهذا الشهر",
  },
  {
    label: "Top products",
    labelAr: "أفضل المنتجات",
    icon: TrendingUp,
    query: "What are my most profitable products?",
    queryAr: "ما هي المنتجات الأكثر ربحية لدي؟",
  },
  {
    label: "Overdue clients",
    labelAr: "العملاء المتأخرون",
    icon: AlertTriangle,
    query: "Which clients have overdue payments?",
    queryAr: "أي العملاء لديهم مدفوعات متأخرة؟",
  },
  {
    label: "Cash flow forecast",
    labelAr: "توقع التدفق النقدي",
    icon: PieChart,
    query: "Forecast my cash flow for the next 30 days",
    queryAr: "توقع التدفق النقدي لـ30 يومًا قادمة",
  },
];

export function AIAssistant() {
  const { lang, t } = useTranslation();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcome: AIMessage = {
        id: "welcome",
        role: "assistant",
        content: lang === "ar"
          ? "مرحباً! أنا مساعدك الذكي في إدارة الأعمال. يمكنني مساعدتك في تحليل الأداء المالي، اكتشاف المصروفات غير الطبيعية، توقع التدفقات النقدية، والإجابة على أسئلتك حول أعمالك. كيف يمكنني مساعدتك اليوم؟"
          : "Hello! I'm your AI business assistant. I can help you analyze financial performance, detect unusual expenses, forecast cash flow, and answer questions about your business. How can I help you today?",
        createdAt: new Date().toISOString(),
      };
      setMessages([welcome]);
    }
  }, []);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setSuggestionsVisible(false);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          lang,
          conversationId,
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const result = await response.json();

      if (!conversationId && result.conversationId) {
        setConversationId(result.conversationId);
      }

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.response || result.content,
        contentAr: result.responseAr,
        data: result.data,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: AIMessage = {
        id: "error",
        role: "system",
        content: lang === "ar"
          ? "عذراً، حدث خطأ في الاتصال بالمساعد الذكي. يرجى المحاولة مرة أخرى."
          : "Sorry, there was an error connecting to the AI assistant. Please try again.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, lang, conversationId]);

  const handleQuickAction = useCallback((action: QuickAction) => {
    setInput(lang === "ar" ? action.queryAr : action.query);
    setSuggestionsVisible(false);
  }, [lang]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass-surface border-b border-border-subtle p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue-600 to-electric-purple-600 flex items-center justify-center shadow-glow-purple">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-text-primary text-lg">
              {lang === "ar" ? "المساعد الذكي للأعمال" : "AI Business Assistant"}
            </h3>
            <p className="text-xs text-text-secondary">
              {lang === "ar" ? "محلل أعمال ذكي يعتمد على بياناتك الفعلية" : "AI business analyst powered by your real data"}
            </p>
          </div>
        </div>
        <Badge variant="default" className="text-xs px-2 py-1">
          <Sparkles className="w-3 h-3 mr-1 animate-pulse" /> AI
        </Badge>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {suggestionsVisible && messages.length === 1 && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-xs font-medium text-text-muted">
              {lang === "ar" ? "اقتراحات سريعة" : "Quick actions"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left gap-2 px-3 py-2.5 glass-card hover:bg-bg-card-hover border border-border-subtle"
                  onClick={() => handleQuickAction(action)}
                >
                  <action.icon className="w-4 h-4" />
                  <span className={lang === "ar" ? "" : ""}>
                    {lang === "ar" ? action.labelAr : action.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col gap-2",
                msg.role === "user" ? "items-end" : "items-start"
              )}
            >
              {msg.role === "user" ? (
                <div className="glass-card p-4 rounded-2xl rounded-tr-none max-w-[85%]">
                  <p className="text-text-primary">{msg.content}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-neon-blue-600/20 flex items-center justify-center text-neon-blue-400">
                      <Bot className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-neon-blue-400 uppercase tracking-wider">
                      AI
                    </span>
                  </div>
                  <div className="glass-card p-4 rounded-2xl rounded-tl-none max-w-[85%]">
                    <p className="text-text-primary leading-relaxed">
                      {lang === "ar" && msg.contentAr ? msg.contentAr : msg.content}
                    </p>
                    {msg.data && (
                      <div className="mt-4 p-3 rounded-xl bg-bg-card-hover border border-border-subtle/50">
                        <p className="text-xs font-medium text-text-primary mb-2">
                          {lang === "ar" ? "البيانات المرتبطة" : "Related data"}
                        </p>
                        <pre className="text-xs text-text-muted overflow-x-auto">
                          {JSON.stringify(msg.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </>
              )}
              {msg.role === "assistant" && (
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="p-1.5 hover:bg-bg-card-hover" onClick={() => {
                    navigator.clipboard.writeText(msg.content);
                  }}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-neon-blue-600/20 flex items-center justify-center text-neon-blue-400">
                <Bot className="w-4 h-4" />
              </div>
              <div className="glass-card p-4 rounded-2xl rounded-tl-none">
                <div className="flex gap-2">
                  <div className="w-20 h-3 bg-border-subtle rounded-full animate-pulse" />
                  <div className="w-12 h-3 bg-border-subtle rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border-subtle p-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            placeholder={lang === "ar" ? "اكتب سؤالك حول أعمالك..." : "Ask about your business..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 glass-input pr-10"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()} className="px-4 shadow-glow-purple hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageCircle className="w-4 h-4" />
            )}
          </Button>
        </form>
        <p className="text-[10px] text-text-muted mt-2 text-center">
          {lang === "ar" ? "المساعد الذكي يحلل بياناتك الفعلية ولا يخترع أرقاماً" : "AI analyzes your real data — no fabricated numbers"}
        </p>
      </div>
    </div>
  );
}