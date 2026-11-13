export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">إعدادات النظام</h1>
      <p className="text-gray-600">ضبط إعدادات المنصة عبر متغيرات البيئة في لوحة تحكم الاستضافة (Vercel).</p>

      <div className="p-6 rounded-xl border border-gray-200 bg-white">
        <h2 className="text-lg font-bold mb-4">متغيرات البيئة المطلوبة</h2>
        <table className="w-full text-sm text-left">
          <thead><tr className="border-b text-gray-500">
            <th className="pb-3">المتغير</th><th className="pb-3 text-right">الحالة</th><th className="pb-3">الوصف</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-3 font-mono text-xs">ADMIN_EMAIL</td>
              <td className="py-3 text-right text-gray-600">{process.env.ADMIN_EMAIL || "غير مضبوط"}</td>
              <td className="py-3 text-xs text-gray-500">بريد المدير الفائق</td>
            </tr>
            <tr>
              <td className="py-3 font-mono text-xs">ADMIN_PASSWORD_HASH</td>
              <td className="py-3 text-right text-gray-600">{process.env.ADMIN_PASSWORD_HASH ? "مضبوط (هاش مشفر)" : "غير مضبوط"}</td>
              <td className="py-3 text-xs text-gray-500">هاش bcrypt لكلمة مرور الإدارة</td>
            </tr>
            <tr>
              <td className="py-3 font-mono text-xs">WHATSAPP_NUMBER</td>
              <td className="py-3 text-right text-gray-600">{process.env.WHATSAPP_NUMBER || "غير مضبوط"}</td>
              <td className="py-3 text-xs text-gray-500">رقم واتساب لطلبات الاشتراك</td>
            </tr>
            <tr>
              <td className="py-3 font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL / ANON_KEY</td>
              <td className="py-3 text-right text-gray-600">{process.env.NEXT_PUBLIC_SUPABASE_URL ? "مضبوط" : "غير مضبوط"}</td>
              <td className="py-3 text-xs text-gray-500">اتصال قاعدة بيانات Supabase</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-6 rounded-xl border border-gray-200 bg-amber-50">
        <h2 className="text-lg font-bold mb-2">إجراءات الأمان المتبعة</h2>
        <ul className="text-sm text-amber-800 space-y-2 list-disc pl-5">
          <li>كلمة مرور الإدارة تُخزن كهاش bcrypt فقط في متغير البيئة، ولا تُكتب في الكود أو قاعدة البيانات كنص عاري.</li>
          <li>جلسة الإدارة تُدار عبر كوكيز httpOnly موقّعة (JWT) وتنتهي تلقائياً بعد 7 أيام.</li>
          <li>جميع تحركات الإدارة تُسجل في جدول الأنشطة للمراجعة.</li>
          <li>جميع واجهات API المحمية تتطلب مصادقة المدير عبر الخادم (Server-side).</li>
        </ul>
      </div>
    </div>
  );
}
