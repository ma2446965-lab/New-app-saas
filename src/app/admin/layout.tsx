import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAdminSessionToken } from "@/lib/auth/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("fatora_admin_session")?.value;
  let authenticated = false;
  if (token) {
    const payload = await verifyAdminSessionToken(token);
    authenticated = !!payload;
  }
  if (!authenticated) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden lg:flex lg:w-64 flex-col border-r bg-white">
        <div className="flex h-16 items-center justify-between border-b px-4 bg-white">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">F</div>
            <span className="font-bold text-sm text-gray-900">فاتورة - الإدارة</span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          <a href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground">
            لوحة التحكم
          </a>
          <a href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
            المستخدمون
          </a>
          <a href="/admin/requests" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
            طلبات الاشتراك
          </a>
          <a href="/admin/plans" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
            الخطط والأسعار
          </a>
          <a href="/admin/logs" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
            السجلات
          </a>
          <a href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
            الإعدادات
          </a>
        </nav>
        <div className="p-4 border-t">
          <form onSubmit={(e) => { e.preventDefault(); fetch("/api/auth/session", { method: "DELETE" }).then(() => location.replace("/admin/login")); }}>
            <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">تسجيل الخروج</button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
