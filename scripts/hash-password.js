/**
 * سكريبت لإنشاء هاش bcrypt لكلمة مرور الإدارة الفائق.
 * चलाएं: node scripts/hash-password.js "كلمة-المرور-الآمنة"
 * ثم ضع الناتج في متغير البيئة ADMIN_PASSWORD_HASH في لوحة تحكم Vercel / Supabase.
 */
import * as bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.log("الاستخدام: node scripts/hash-password.js <كلمة_المرور>");
  process.exit(1);
}

bcrypt.hash(password, 12).then((hash) => {
  console.log("\n=== ADMIN_PASSWORD_HASH (انسخ هذا القيمة إلى متغير البيئة) ===\n");
  console.log(hash);
  console.log("\n==============================================================\n");
});
