import * as bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * تشفير كلمة مرور الإدارة باستخدام bcrypt (لا تُخزن كلمة المرور كنص عادي أبدًا).
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * مقارنة كلمة مرور نصية مع الهاش المخزن.
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET || "default-secret-change-me"
);

/**
 * إنشاء توquin جلسة الإدارة (موقعّع) - يُخزن في كوكيز httpOnly.
 */
export async function createAdminSessionToken(adminId: string): Promise<string> {
  return await new SignJWT({ sub: adminId, role: "super_admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyAdminSessionToken(token: string): Promise<{
  sub: string;
  role: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { sub: payload.sub as string, role: payload.role as string };
  } catch {
    return null;
  }
}
