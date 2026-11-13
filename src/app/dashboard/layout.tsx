export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex lg:w-64 flex-col border-r bg-white">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              F
            </div>
            <span className="font-bold text-sm">فاتورة SaaS</span>
          </div>
        </div>
        <Sidebar user={profile} onLogout={async () => {}} isAdmin={profile.role === "admin"} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">لوحة التحكم</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block">{profile.full_name}</span>
              <button
                onClick={() => {
                  fetch("/api/auth/session", { method: "DELETE" }).then(() =>
                    location.replace("/login")
                  );
                }}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
