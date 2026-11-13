import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSessionToken } from "@/lib/auth/admin";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

async function guard(req: NextRequest) {
  const token = req.cookies.get("fatora_admin_session")?.value;
  if (!token) return null;
  return await verifyAdminSessionToken(token);
}

export async function GET(req: NextRequest) {
  const payload = await guard(req);
  if (!payload) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb.from("subscription_requests").select("*").order("requested_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests: data || [] });
}

export async function PATCH(req: NextRequest) {
  const payload = await guard(req);
  if (!payload) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id, status, admin_notes } = await req.json();
  const sb = createSupabaseServiceClient();
  const { data: reqData, error: ferr } = await sb.from("subscription_requests").select("*").eq("id", id).single();
  if (ferr || !reqData) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

  const { error: uerr } = await sb.from("subscription_requests").update({ status, admin_notes }).eq("id", id);
  if (uerr) return NextResponse.json({ error: uerr.message }, { status: 500 });

  if (status === "approved") {
    // Activate subscription: set profile status and subscription record
    const startsAt = new Date();
    const endsAt = new Date();
    if (reqData.duration === "yearly") endsAt.setFullYear(endsAt.getFullYear() + 1);
    else endsAt.setMonth(endsAt.getMonth() + 1);

    await sb.from("profiles").update({
      subscription_status: "active",
      subscription_plan: reqData.plan_name,
      subscription_starts_at: startsAt.toISOString(),
      subscription_ends_at: endsAt.toISOString(),
    }).eq("id", reqData.user_id);

    await sb.from("subscriptions").insert({
      user_id: reqData.user_id,
      status: "active",
      interval: reqData.duration,
      price_egp: reqData.price_egp,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      auto_renew: true,
    });

    await sb.from("activities").insert({
      admin_id: payload.sub,
      action: "activate_subscription",
      entity_type: "subscription",
      entity_id: reqData.id as any,
      details: { plan: reqData.plan_name, price_egp: reqData.price_egp, duration: reqData.duration, user_id: reqData.user_id },
    });
  }
  return NextResponse.json({ ok: true });
}
