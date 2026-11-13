"use client";

import Link from "next/link";
import { useTranslation } from "@/components/i18n/useTranslation";
import {
  ArrowRight,
  Check,
  Calendar,
  Smartphone,
  CreditCard,
  ShieldCheck,
  FileText,
  LayoutDashboard,
  Rocket,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { t, lang } = useTranslation();
  const isAr = lang === "ar";

  const features = [
    {
      title: t("feature1Title"),
      desc: t("feature1Desc"),
      icon: ShieldCheck,
      glow: "glow-blue",
    },
    {
      title: t("feature2Title"),
      desc: t("feature2Desc"),
      icon: FileText,
      glow: "glow-purple",
    },
    {
      title: t("feature3Title"),
      desc: t("feature3Desc"),
      icon: CreditCard,
      glow: "glow-blue",
    },
    {
      title: t("feature4Title"),
      desc: t("feature4Desc"),
      icon: LayoutDashboard,
      glow: "glow-purple",
    },
  ];

  return (
    <div className="min-h-full relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-neon-blue-600/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-electric-purple-600/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] bg-electric-purple-600/10 rounded-full blur-[80px]" />
      </div>

      {/* Navbar is handled by RootLayout, hero starts here */}
      <section className="relative px-4 pt-20 pb-32 sm:px-6 sm:pt-24 sm:pb-40 lg:px-8 lg:pt-32 lg:pb-48">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-card border border-border-subtle text-xs font-medium text-neon-blue-400 mb-8 animate-fade-in">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-blue-400 animate-pulse" />
            {t("etaCompliant")}
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-text-primary mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            {t("landingHeroTitle")}
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }} leading-relaxed>
            {t("landingHeroSub")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Button asChild as={Link} href="/register" className="px-10 py-4 text-lg shadow-glow-purple hover:shadow-[0_0_50px_rgba(168,85,247,0.6)]">
              <ArrowRight className="w-5 h-5 mr-2" /> {t("landingCta")}
            </Button>
            <Button variant="outline" asChild as={Link} href="/login" className="px-10 py-4 text-lg">
              {t("signIn")}
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-y border-border-subtle relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">{t("landingFeaturesTitle")}</h2>
            <p className="text-text-muted">{t("appTagline")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass-card p-6 rounded-2xl hover:border-border-bright transition-all duration-300 group animate-fade-in">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-neon-blue-500/20 to-electric-purple-500/20 flex items-center justify-center text-neon-blue-400 group-hover:scale-110 transition-transform duration-300 mb-5 border border-border-bright/30`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-3">{f.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">{t("pricing")}</h2>
            <p className="text-text-muted">{t("choosePlan")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              ["Starter", "بداية", "150", "جنيه/شهر", "حتى 50 فاتورة", "حتى 50 عميل", false],
              ["Professional", "احترافية", "300", "جنيه/شهر", "فواتير غير محدودة", "عملاء غير محدودين + تقارير", true],
              ["Professional Yearly", "احترافية (سنوي)", "3000", "جنيه/سنة", "فواتير غير محدودة", "كل المزايا + توفير شهرين", false],
            ].map(([nameEn, nameAr, price, period, limit1, limit2, popular], i) => (
              <div key={nameEn + "-" + i} className={`relative p-8 rounded-3xl glass-card border ${popular ? "border-neon-blue-500/50 shadow-[0_0_40px_rgba(37,99,235,0.3)]" : "border-border-subtle"} hover:border-border-bright transition-all duration-300 ${popular ? "scale-105 z-10" : ""}`}>
                {popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-neon-blue-600 to-electric-purple-600 text-xs font-bold text-white shadow-glow-purple">
                      {t("mostPopular")}
                    </span>
                  </div>
                )}
                <h3 className={`text-xl font-bold ${popular ? "text-neon-blue-400" : "text-text-primary"} mb-2`}>{isAr ? nameAr : nameEn}</h3>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-text-primary">{price}</span>
                  <span className="text-sm text-text-muted">{period}</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm text-text-secondary">{limit1}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm text-text-secondary">{limit2}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm text-text-secondary">{t("whatsappSupport")}</span>
                  </li>
                </ul>
                <div className="mt-auto pt-8">
                  <Button asChild as={Link} href="/register" className={`w-full py-3 rounded-xl text-lg font-semibold transition-all duration-300 ${popular ? "bg-gradient-to-r from-neon-blue-600 to-electric-purple-600 text-white shadow-glow-purple hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]" : "bg-bg-card-hover text-text-primary hover:bg-bg-card"}`}>
                    {popular ? t("subscribeNow") : t("joinWaitlist")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-12 text-center text-xs text-text-muted">{t("subscriptionRequestNote")}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="relative p-8 sm:p-12 rounded-3xl glass-card border border-border-bright/50 shadow-glow-card text-center mx-auto sm:max-w-4xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue-500 to-transparent" />
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4 animate-fade-in">{t("startFreeTrial")}</h2>
          <p className="text-text-muted mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>{t("freeTrialDesc")}</p>
          <Button asChild as={Link} href="/register" className="px-10 py-4 text-lg shadow-glow-purple hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <Calendar className="w-5 h-5 mr-2" /> {t("freeTrialCta")}
          </Button>
        </div>
      </section>

      <footer className="border-t border-border-subtle py-10 px-4 text-center text-xs text-text-muted">
        {new Date().getFullYear()} فاتورة SaaS. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
}