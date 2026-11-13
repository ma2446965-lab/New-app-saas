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
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { t, lang } = useTranslation();
  const isAr = lang === "ar";

  const features = [
    {
      title: t("feature1Title"),
      titleEn: "ETA compliant",
      desc: t("feature1Desc"),
      icon: ShieldCheck,
    },
    {
      title: t("feature2Title"),
      titleEn: "Client & invoice management",
      desc: t("feature2Desc"),
      icon: FileTextIcon,
    },
    {
      title: t("feature3Title"),
      titleEn: "Flexible subscriptions in EGP",
      desc: t("feature3Desc"),
      icon: CreditCard,
    },
    {
      title: t("feature4Title"),
      titleEn: "Full dashboard & admin panel",
      desc: t("feature4Desc"),
      icon: LayoutDashboardIcon,
    },
  ];

  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="relative px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900">{t("landingHeroTitle")}</h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">{t("landingHeroSub")}</p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              as={Link}
              href="/register"
              className="px-8 py-3 text-lg"
            >
              <ArrowRight className="w-5 h-5 mr-2" /> {t("landingCta")}
            </Button>
            <Button variant="outline" asChild as={Link} href="/login" className="px-8 py-3 text-lg">
              {t("signIn")}
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-y bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t("landingFeaturesTitle")}</h2>
            <p className="mt-4 text-gray-600">{t("appTagline")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-gray-200 bg-gray-50 hover:shadow-md transition">
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{f.title}</h3>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t("pricing")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[["استarter", "150", "جنيه/شهر", "حتى 50 فاتورة", "حتى 50 عميل", false],
              ["احترافية", "300", "جنيه/شهر", "فواتير غير محدودة", "عملاء غير محدودين + تقارير", true],
              ["احترافية (سنوي)", "3000", "جنيه/سنة", "فواتير غير محدودة", "كل المزايا + توفير 2 شهر", false]].map(([name, price, period, limit1, limit2, popular]) => (
              <div key={String(name)} className={`p-6 rounded-2xl border relative flex flex-col ${popular ? "ring-2 ring-primary border-primary bg-gray-50" : "border-gray-200 bg-white"}`}>
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex -space-x-px rounded-t-lg">
                    <span className="-left-px rounded-t-lg bg-primary px-2 py-0.5 text-xs font-bold text-white">الأكثر شيوعاً</span>
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">{price}</span>
                  <span className="text-sm text-gray-500">{period}</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> {limit1}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> {limit2}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> {t("whatsappSupport")}</li>
                </ul>
                <div className="mt-auto pt-6">
                  <Button asChild as={Link} href="/register" className="w-full disabled:opacity-100 disabled:pointer-events-none" disabled={!popular}>
                    {t("subscribeNow")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            {t("subscriptionRequestNote")}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">ابدأ في 3 دقائق</h2>
          <p className="text-gray-600 mb-8">أنشئ حسابك واستمتع بتجربة مجانية لمدة 3 أيام — لا تتطلب بطاقة ائتمانية.</p>
          <Button asChild as={Link} href="/register" className="px-8 py-3 text-lg">
            <Calendar className="w-5 h-5 mr-2" /> {t("freeTrial")}
          </Button>
        </div>
      </section>

      <footer className="border-t py-8 px-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} فاتورة SaaS. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
}

// Fallback icon components (avoid extra imports)
function FileTextIcon(props: any) { return <FileText {...props} />; }
function LayoutDashboardIcon(props: any) { return <LayoutDashboard {...props} />; }
