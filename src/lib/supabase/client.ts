"use strict";

import { createBrowserSupabaseClient } from "./server";

/**
 * ينشئ عميل Supabase مزوّدًا بجلسة المتصفح الحالية.
 * يُستخدم داخل Client Components عند الحاجة إلى الاستعلام المباشر من Supabase.
 */
export function createClientComponentClient() {
  return createBrowserSupabaseClient();
}
