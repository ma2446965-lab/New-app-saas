"use strict";

import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables"
  );
}

/**
 * عميل Supabase للمتصفح (Client Component)
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * عميل Supabase للخادم (Server Component / Server Action)
 * يستخدم كوكيز الجلسة عبر Next.js cookies()
 */
export async function createServerSupabaseClient() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      remove(name: string, options: Record<string, any> | undefined) {
        cookieStore.set({ name, value: "", ...options, path: "/" });
      },
      set(name: string, value: string, options: Record<string, any> | undefined) {
        cookieStore.set({ name, value, ...options, path: "/" });
      },
    },
  });
}

/**
 * عميل Supabase بمفتاح الخدمة (Service Role) لأدوار الإدارة والسكريبتات الداخلية.
 * يُستخدم فقط من Server Actions / Route handlers الموثوقة - لا يُعرض على المتصفح.
 */
export function createSupabaseServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  }
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
