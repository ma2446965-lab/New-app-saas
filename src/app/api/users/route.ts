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
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();

  let query = sb.from("profiles").select("id, email, full_name, account_id, phone, role, subscription_status, subscription_plan, trial_ends_at, subscription_ends_at, is_active, created_at").order("created_at", { ascending: false });
  // note: supabase-js filters applied client-side here for text search
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let users = (data || []).map((u: any) => u);
  if (q) {
    users = users.filter((u: any) =>
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.account_id || "").toLowerCase().includes(q)
    );
  }
  return NextResponse.json({ users });
}

export async function DELETE(req: NextRequest) {
  const payload = await guard(req);
  if (!payload) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await req.json();
  const sb = createSupabaseServiceClient();
  // delete related data then profile
  await sb.from("invoices").delete().eq("user_id", id);
  await sb.from("clients").delete().eq("user_id", id);
  await sb.from("subscriptions").delete().eq("user_id", id);
  await sb.from("subscription_requests").delete().eq("user_id", id);
  const { error } = await sb.from("profiles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const payload = await guard(req);
  if (!payload) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id, is_active } = await req.json();
  const sb = createSupabaseServiceClient();
  const { error } = await sb.from("profiles").update({ is_active }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
