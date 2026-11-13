import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSessionToken, createAdminSessionToken, verifyPassword } from "@/lib/auth/admin";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH!;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "البريد وكلمة المرور مطلوبان" }, { status: 400 });
    }
    if (email.toLowerCase() !== ADMIN_EMAIL?.toLowerCase()) {
      return NextResponse.json({ error: "بيانات دخول غير صحيحة" }, { status: 401 });
    }
    if (!ADMIN_PASSWORD_HASH) {
      return NextResponse.json({ error: "الإدارة غير مهيأة بعد" }, { status: 500 });
    }
    const ok = await verifyPassword(password, ADMIN_PASSWORD_HASH);
    if (!ok) {
      return NextResponse.json({ error: "بيانات دخول غير صحيحة" }, { status: 401 });
    }

    const token = await createAdminSessionToken("admin");
    const res = NextResponse.json({ ok: true });
    res.cookies.set("fatora_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "خطأ في الخادم" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("fatora_admin_session")?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });
  const payload = await verifyAdminSessionToken(token);
  if (!payload) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, admin: payload });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("fatora_admin_session", "", { path: "/", maxAge: 0 });
  return res;
}
