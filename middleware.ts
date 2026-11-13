import { createServerClient } from "@supabase/ssr";
import { verifyAdminSessionToken } from "@/lib/auth/admin";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_PREFIX = "/admin";
const DASHBOARD_PREFIX = "/dashboard";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- مسارات الإدارة: تحتاج جلسة مدير فائق (JWT في كوكيز httpOnly) ---
  if (pathname.startsWith(ADMIN_PREFIX)) {
    const token = req.cookies.get("fatora_admin_session")?.value;
    let adminOk = false;
    if (token) {
      try {
        adminOk = !!await verifyAdminSessionToken(token);
      } catch {}
    }
    if (!adminOk) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // --- لوحة التحكم المستخدم: تحتاج جلسة Supabase Auth ---
  if (pathname.startsWith(DASHBOARD_PREFIX)) {
    const res = NextResponse.next();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, any> | undefined) {
            res.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: Record<string, any> | undefined) {
            res.cookies.set({ name, value: "", ...options });
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
