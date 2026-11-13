import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSessionToken } from "@/lib/auth/admin";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

async function guard(req: NextRequest) {
  const token = req.cookies.get("fatora_admin_session")?.value;
  if (!token) return null;
  return await verifyAdminSessionToken(token);
}

export async function POST(req: NextRequest) {
  const payload = await guard(req);
  if (!payload) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const sb = createSupabaseServiceClient();
  const { user_id, plan_name, price_egp, duration, starts_at, ends_at, notes } = await req.json();

  if (!user_id || !plan_name) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const start = starts_at ? new Date(starts_at) : new Date();
  const end = ends_at ? new Date(ends_at) : (duration === "yearly" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  await sb.from("profiles").update({
    subscription_status: "active",
    subscription_plan: plan_name,
    subscription_starts_at: start.toISOString(),
    subscription_ends_at: end.toISOString(),
  }).eq("id", user_id);

  await sb.from("subscriptions").insert({
    user_id,
    status: "active",
    interval: duration,
    price_egp: price_egp || 0,
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
    auto_renew: true,
  });

  await sb.from("activities").insert({
    admin_id: payload.sub,
    action: "activate_subscription",
    entity_type: "subscription",
    details: { plan: plan_name, price_egp, duration, user_id, notes },
  });

  return NextResponse.json({ ok: true, starts_at: start.toISOString(), ends_at: end.toISOString() });
}
