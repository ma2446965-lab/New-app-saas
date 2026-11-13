import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("أدخل بريد إلكتروني صحيح / Enter a valid email"),
  password: z.string().min(1, "كلمة المرور مطلوبة / Password is required"),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, "الاسم الكامل مطلوب / Full name is required"),
  email: z.string().email("أدخل بريد إلكتروني صحيح / Enter a valid email"),
  password: z
    .string()
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل / Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("أدخل بريد إلكتروني صحيح / Enter a valid email"),
});

export const clientSchema = z.object({
  name: z.string().min(2, "اسم العميل مطلوب"),
  email: z.string().email("بريد إلكتروني غير صحيح").optional().or(z.literal("")),
  phone: z.string().optional(),
  tax_number: z.string().optional(),
  address: z.string().optional(),
});

export const invoiceItemSchema = z.object({
  name: z.string().min(1, "اسم الصنف مطلوب"),
  quantity: z.coerce.number().positive("الكمية يجب أن تكون أكبر من صفر"),
  unit_price: z.coerce.number().nonnegative("سعر الوحدة غير صحيح"),
});

export const invoiceSchema = z.object({
  client_id: z.string().optional(),
  client_name: z.string().min(1, "اسم العميل مطلوب"),
  client_email: z.string().email("بريد إلكتروني غير صحيح").optional().or(z.literal("")),
  client_phone: z.string().optional(),
  client_tax_number: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "أضف صنفاً واحداً على الأقل"),
  tax_amount: z.coerce.number().nonnegative().default(0),
  due_date: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "sent", "paid", "overdue"]),
});

export const adminLoginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const planFormSchema = z.object({
  name: z.string().min(1),
  name_ar: z.string().min(1),
  description: z.string().min(1),
  description_ar: z.string().min(1),
  price_monthly_egp: z.coerce.number().nonnegative(),
  price_yearly_egp: z.coerce.number().nonnegative(),
  max_invoices: z.coerce.number().nonnegative().optional().nullable(),
  max_clients: z.coerce.number().nonnegative().optional().nullable(),
  is_active: z.boolean().default(true),
  is_popular: z.boolean().default(false),
});
