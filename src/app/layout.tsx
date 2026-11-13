import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getServerTranslations, isRTL, getUserLang } from "@/lib/i18n-server";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "فاتورة SaaS - الفوترة الإلكترونية للمشروعات الصغيرة",
  description: "منصة فواتير إلكترونية احترافية متوافقة مع ضريبة القيمة المضافة للمستقلين وأصحاب المشاريع في مصر.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { lang } = await getServerTranslations();
  const cookieStore = await cookies();
  const session = cookieStore.get("fatora_session")?.value;
  const user = session ? { email: "user" } : null;

  const isRtl = isRTL(lang);

  return (
    <ThemeProvider>
      <html lang={lang} dir={isRtl ? "rtl" : "ltr"} className="h-full">
        <body className="antialiased min-h-full selection:bg-neon-blue-500 selection:text-white">
          <Navbar user={user} />
          <main className="min-h-full relative pb-20">{children}</main>
        </body>
      </html>
    </ThemeProvider>
  );
}