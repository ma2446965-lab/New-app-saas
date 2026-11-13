import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSessionToken } from "@/lib/auth/admin";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

async function guard(req: NextRequest) {
  const token = req.cookies.get("fatora_admin_session")?.value;
  if (!token) return null;
  return await verifyAdminSessionToken(token);
}

const planSchema = z.object({
  name: z.string().optional(),
  name_ar: z.string().optional(),
  description: z.string().optional(),
  description_ar: z.string().optional(),
  price_monthly_egp: z.coerce.number().nonnegative().optional(),
  price_yearly_egp: z.coerce.number().nonnegative().optional(),
  max_invoices: z.coerce.number().nonnegative().optional().nullable(),
  max_clients: z.coerce.number().nonnegative().optional().nullable(),
  is_active: z.boolean().optional(),
  is_popular: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const payload = await guard(req);
  if (!payload) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb.from("subscription_plans").select("*").order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plans: data || [] });
}

export async function PUT(req: NextRequest) {
  const payload = await guard(req);
  if (!payload) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const sb = createSupabaseServiceClient();
  const { id, ...fields } = await req.json();
  const parsed = planSchema.safeParse(fields);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  const { error } = await sb.from("subscription_plans").update(parsed.data).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
