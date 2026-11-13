-- ============================================================================
-- فاتورة SaaS - مخطط قاعدة البيانات (Supabase / PostgreSQL)
-- يتم تنفيذ هذا السكربت في "SQL Editor" داخل لوحة تحكم مشروع Supabase
-- ============================================================================

-- امتدادات
create extension if not exists "pgcrypto";

-- 1. ملفات تعريف المستخدمين (مرتبطة بـ auth.users عبر id)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  account_id text unique,
  phone text,
  role text not null default 'user' check (role in ('user','admin')),
  subscription_status text not null default 'trial' check (subscription_status in ('trial','active','expired','canceled','past_due')),
  subscription_plan text,
  trial_ends_at timestamptz,
  subscription_starts_at timestamptz,
  subscription_ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. الخطط المتاحة للاشتراك
create table if not exists public.subscription_plans (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  name_ar text not null,
  description text,
  description_ar text,
  price_monthly_egp integer not null default 0,
  price_yearly_egp integer not null default 0,
  interval text not null default 'monthly' check (interval in ('monthly','yearly')),
  max_invoices integer,
  max_clients integer,
  features jsonb default '[]'::jsonb,
  features_ar jsonb default '[]'::jsonb,
  is_active boolean not null default true,
  is_popular boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 3. الاشتراكات الفعلية للمستخدمين
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_id uuid references public.subscription_plans(id),
  status text not null default 'trial' check (status in ('trial','active','expired','canceled','past_due')),
  interval text not null default 'monthly',
  price_egp integer not null default 0,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  trial_ends_at timestamptz,
  auto_renew boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. طلبات الاشتراك عبر واتساب (يتم تفعيلها يدوياً من لوحة الإدارة)
create table if not exists public.subscription_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  customer_name text not null,
  customer_email text not null,
  account_id text not null,
  plan_name text not null,
  plan_name_ar text,
  price_egp integer not null default 0,
  duration text not null, -- 'monthly' | 'yearly'
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_notes text,
  activated_by uuid references public.profiles(id),
  activated_at timestamptz
);

-- 5. الفواتير
create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  invoice_number text not null,
  client_name text not null,
  client_email text,
  client_phone text,
  client_tax_number text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  status text not null default 'draft' check (status in ('draft','sent','paid','overdue')),
  due_date timestamptz,
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. العملاء
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  tax_number text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. سجل العمليات (Audit log) للإدارة
create table if not exists public.activities (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- فهارس وأمان على مستوى الصفوف (Row Level Security)
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscription_requests enable row level security;
alter table public.invoices enable row level security;
alter table public.clients enable row level security;
alter table public.activities enable row level security;

-- الملف الشخصي: كل مستخدم يرى ملفه فقط
create policy "profiles_select_own" on public.profiles
  for select using ( auth.uid() = id );
create policy "profiles_update_own" on public.profiles
  for update using ( auth.uid() = id );

-- الخطط: الجميع يراها (للاختيار)، الإدارة تعدلها
create policy "plans_select_all" on public.subscription_plans
  for select using ( true );

-- الاشتراكات: كل مستخدم يرى اشتراكه فقط
create policy "subscriptions_select_own" on public.subscriptions
  for select using ( auth.uid() = user_id );

-- طلبات الاشتراك: صاحب الطلب يرى طلباته فقط
create policy "subscription_requests_select_own" on public.subscription_requests
  for select using ( auth.uid() = user_id );
create policy "subscription_requests_insert_own" on public.subscription_requests
  for insert with check ( auth.uid() = user_id );

-- الفواتير: كل مستخدم يرى فواتيره فقط
create policy "invoices_select_own" on public.invoices
  for select using ( auth.uid() = user_id );
create policy "invoices_insert_own" on public.invoices
  for insert with check ( auth.uid() = user_id );
create policy "invoices_update_own" on public.invoices
  for update using ( auth.uid() = user_id );
create policy "invoices_delete_own" on public.invoices
  for delete using ( auth.uid() = user_id );

-- العملاء: كل مستخدم يرى عملاءه فقط
create policy "clients_select_own" on public.clients
  for select using ( auth.uid() = user_id );
create policy "clients_insert_own" on public.clients
  for insert with check ( auth.uid() = user_id );
create policy "clients_update_own" on public.clients
  for update using ( auth.uid() = user_id );
create policy "clients_delete_own" on public.clients
  for delete using ( auth.uid() = user_id );

-- السجلات: للقراءة فقط من قبل الخدمة/الإدارة (يُكمل عبر Service Role في الإجراءات الخلفية)
create policy "activities_insert_service" on public.activities
  for insert with check ( true );

-- ============================================================================
-- بيانات أولية للخطط (بالجنيه المصري)
-- ============================================================================

insert into public.subscription_plans (
  name, name_ar, description, description_ar,
  price_monthly_egp, price_yearly_egp, interval,
  max_invoices, max_clients, features, features_ar,
  is_active, is_popular, sort_order
) values
  ('Starter', 'بداية',
   'للمستقلين وأصحاب المشاريع الصغيرة. فواتير محدودة وعملاء محدودون.',
   'للمستقلين وأصحاب المشاريع الصغيرة. عدد محدود من الفواتير والعملاء.',
   150, 1500, 'monthly',
   50, 50,
   '["إصدار ما يصل إلى 50 فاتورة شهرياً", "إدارة ما يصل إلى 50 عميلاً", "فواتير احترافية قابلة للطباعة", "إرسال الفواتير عبر واتساب"]',
   '["إصدار ما يصل إلى 50 فاتورة شهرياً", "إدارة ما يصل إلى 50 عميلاً", "فواتير احترافية قابلة للطباعة", "إرسال الفواتير عبر واتساب"]',
   true, false, 1),

  ('Starter Yearly', 'بداية (سنوي)',
   'نفس خطة البداية بسداد سنوي مع توفير شهرين مجاناً.',
   'نفس خطة البداية بسداد سنوي مع توفير شهرين مجاناً.',
   150, 1500, 'yearly',
   50, 50,
   '["إصدار ما يصل إلى 50 فاتورة شهرياً", "إدارة ما يصل إلى 50 عميلاً", "فواتير احترافية قابلة للطباعة", "إرسال الفواتير عبر واتساب", "توفير شهرين عند الدفع السنوي"]',
   '["إصدار ما يصل إلى 50 فاتورة شهرياً", "إدارة ما يصل إلى 50 عميلاً", "فواتير احترافية قابلة للطباعة", "إرسال الفواتير عبر واتساب", "توفير شهرين عند الدفع السنوي"]',
   true, false, 2),

  ('Professional', 'احترافية',
   'للمشروعات الناشئة. فواتير وعملاء غير محدودين وتقارير ومتابعة المصروفات.',
   'للمشروعات الناشئة. فواتير وعملاء غير محدودين وتقارير ومتابعة المصروفات.',
   300, 3000, 'monthly',
   null, null,
   '["فواتير غير محدودة", "عملاء غير محدودين", "تتبع المصروفات", "تقارير مالية", "إرسال الفواتير عبر واتساب", "أولوية في الدعم"]',
   '["فواتير غير محدودة", "عملاء غير محدودين", "تتبع المصروفات", "تقارير مالية", "إرسال الفواتير عبر واتساب", "أولوية في الدعم"]',
   true, true, 3),

  ('Professional Yearly', 'احترافية (سنوي)',
   'نفس خطة الاحترافية بسداد سنوي مع توفير شهرين مجاناً.',
   'نفس خطة الاحترافية بسداد سنوي مع توفير شهرين مجاناً.',
   300, 3000, 'yearly',
   null, null,
   '["فواتير غير محدودة", "عملاء غير محدودين", "تتبع المصروفات", "تقارير مالية", "إرسال الفواتير عبر واتساب", "أولوية في الدعم", "توفير شهرين عند الدفع السنوي"]',
   '["فواتير غير محدودة", "عملاء غير محدودين", "تتبع المصروفات", "تقارير مالية", "إرسال الفواتير عبر واتساب", "أولوية في الدعم", "توفير شهرين عند الدفع السنوي"]',
   true, false, 4)
on conflict do nothing;

-- ملاحظة: كلمة مرور الإدارة الفائق تُضبط عبر متغير البيئة ADMIN_PASSWORD_HASH
-- (هاش bcrypt) ولا تُخزن في هذه القاعدة كنص عادي.
