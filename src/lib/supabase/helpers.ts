import { cookies } from "next/headers";
import { createServerSupabaseClient } from "./server";
import { createSupabaseServiceClient } from "./server";

/**
 * الحصول على المستخدم الحالي المسجل دخوله عبر Supabase Auth (على الخادم).
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * جلب ملف التعريف (profile) للمستخدم الحالي.
 */
export async function getCurrentProfile() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile };
}

/**
 * عميل بمفتاح الخدمة للعمليات الإدارية الموثوقة فقط (Server-side).
 */
export async function getServiceClient() {
  return createSupabaseServiceClient();
}

/**
 * التحقق من أن البريد الإلكتروني يعود للإدارة الفائقة.
 */
export function isAdminEmail(email: string | undefined | null): boolean {
  return email?.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
}
