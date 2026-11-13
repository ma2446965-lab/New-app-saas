-- ============================================================================
-- فاتورة SaaS - مخطط قاعدة البيانات (Supabase / PostgreSQL)
-- منصة إدارة الأعمال والمال والمبيعات المدعومة بالذكاء الاصطناعي
-- يتم تنفيذ هذا السكربت في "SQL Editor" داخل لوحة تحكم مشروع Supabase
-- ============================================================================

-- امتدادات
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. ملفات تعريف المستخدمين (مرتبطة بـ auth.users عبر id)
-- ============================================================================
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  account_id text unique,
  phone text,
  role text not null default 'user' check (role in ('user','admin','super_admin')),
  subscription_status text not null default 'trial' check (subscription_status in ('trial','active','expired','canceled','past_due')),
  subscription_plan text,
  trial_ends_at timestamptz,
  subscription_starts_at timestamptz,
  subscription_ends_at timestamptz,
  is_active boolean not null default true,
  company_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 2. الشركات (Multi-tenant) - كل شركة لها بيانات معزولة
-- ============================================================================
create table if not exists public.companies (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  name_ar text,
  email text,
  phone text,
  address text,
  tax_number text,
  commercial_register text,
  currency text not null default 'EGP' check (currency in ('EGP','USD','SAR','AED')),
  tax_rate numeric(5,2) not null default 0,
  tax_type text not null default 'vat' check (tax_type in ('vat','gst','sales_tax','none')),
  country text not null default 'EG',
  language text not null default 'ar' check (language in ('ar','en')),
  logo_url text,
  website text,
  is_active boolean not null default true,
  subscription_status text not null default 'trial' check (subscription_status in ('trial','active','expired','canceled','past_due')),
  subscription_plan text,
  trial_ends_at timestamptz,
  subscription_starts_at timestamptz,
  subscription_ends_at timestamptz,
  max_users integer not null default 5,
  max_invoices_per_month integer not null default 100,
  features jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ربط profiles بالشركات
alter table public.profiles
  add constraint if not exists profiles_company_id_fkey
  foreign key (company_id) references public.companies(id) on delete set null;

-- ============================================================================
-- 3. الخطط المتاحة للاشتراك
-- ============================================================================
create table if not exists public.subscription_plans (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  name_ar text not null,
  description text,
  description_ar text,
  price_monthly_egp integer not null default 0,
  price_yearly_egp integer not null default 0,
  price_monthly_usd integer not null default 0,
  price_yearly_usd integer not null default 0,
  interval text not null default 'monthly' check (interval in ('monthly','yearly')),
  max_invoices integer,
  max_clients integer,
  max_products integer,
  max_users integer,
  ai_assistant_enabled boolean not null default false,
  advanced_reports boolean not null default false,
  inventory_management boolean not null default false,
  multi_currency boolean not null default false,
  features jsonb default '[]'::jsonb,
  features_ar jsonb default '[]'::jsonb,
  is_active boolean not null default true,
  is_popular boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 4. الاشتراكات الفعلية للمستخدمين والشركات
-- ============================================================================
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_id uuid references public.subscription_plans(id),
  status text not null default 'trial' check (status in ('trial','active','expired','canceled','past_due')),
  interval text not null default 'monthly',
  price_egp integer not null default 0,
  price_usd integer not null default 0,
  currency text not null default 'EGP',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  trial_ends_at timestamptz,
  auto_renew boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 5. طلبات الاشتراك عبر واتساب
-- ============================================================================
create table if not exists public.subscription_requests (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  customer_name text not null,
  customer_email text not null,
  account_id text not null,
  plan_name text not null,
  plan_name_ar text,
  price_egp integer not null default 0,
  price_usd integer not null default 0,
  currency text not null default 'EGP',
  duration text not null, -- 'monthly' | 'yearly'
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_notes text,
  activated_by uuid references public.profiles(id),
  activated_at timestamptz
);

-- ============================================================================
-- 6. الفواتير
-- ============================================================================
create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  invoice_number text not null,
  client_id uuid references public.clients(id) on delete set null,
  client_name text not null,
  client_email text,
  client_phone text,
  client_tax_number text,
  client_address text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'EGP',
  status text not null default 'draft' check (status in ('draft','sent','paid','overdue','voided')),
  due_date timestamptz,
  issued_at timestamptz not null default now(),
  paid_at timestamptz,
  payment_method text,
  payment_reference text,
  notes text,
  terms text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 7. عروض الأسعار (Quotes) - يمكن تحويلها إلى فواتير
-- ============================================================================
create table if not exists public.quotes (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  quote_number text not null,
  client_name text not null,
  client_email text,
  client_phone text,
  client_tax_number text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'EGP',
  status text not null default 'draft' check (status in ('draft','sent','accepted','rejected','expired','converted')),
  valid_until timestamptz,
  issued_at timestamptz not null default now(),
  converted_invoice_id uuid references public.invoices(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 8. العملاء (CRM)
-- ============================================================================
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  tax_number text,
  address text,
  city text,
  country text default 'EG',
  customer_type text not null default 'regular' check (customer_type in ('regular','vip','wholesale','retail')),
  credit_limit numeric(12,2) not null default 0,
  balance_due numeric(12,2) not null default 0,
  total_spent numeric(12,2) not null default 0,
  last_order_at timestamptz,
  notes text,
  tags jsonb default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 9. المنتجات والخدمات (Inventory & Products)
-- ============================================================================
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  name_ar text,
  description text,
  description_ar text,
  sku text unique,
  barcode text,
  category text,
  unit text not null default 'piece' check (unit in ('piece','kg','liter','meter','box','hour','service')),
  type text not null default 'product' check (type in ('product','service')),
  purchase_price numeric(12,2) not null default 0,
  selling_price numeric(12,2) not null default 0,
  currency text not null default 'EGP',
  tax_rate numeric(5,2) not null default 0,
  track_inventory boolean not null default true,
  current_stock integer not null default 0,
  min_stock_alert integer not null default 5,
  max_stock integer,
  reorder_point integer not null default 10,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  image_url text,
  tags jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 10. حركة المخزون (Inventory Transactions)
-- ============================================================================
create table if not exists public.inventory_transactions (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('in','out','adjustment','return','damaged')),
  quantity integer not null,
  reference_type text, -- 'invoice', 'purchase', 'adjustment', 'return'
  reference_id uuid,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 11. فئات المصروفات
-- ============================================================================
create table if not exists public.expense_categories (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  name text not null,
  name_ar text,
  color text not null default '#6366f1',
  icon text not null default 'Folder',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 12. المصروفات
-- ============================================================================
create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.expense_categories(id) on delete set null,
  title text not null,
  title_ar text,
  description text,
  description_ar text,
  amount numeric(12,2) not null default 0,
  currency text not null default 'EGP',
  expense_date timestamptz not null default now(),
  receipt_url text,
  vendor text,
  payment_method text not null default 'cash' check (payment_method in ('cash','bank','card','wallet','transfer')),
  status text not null default 'recorded' check (status in ('recorded','reimbursed','pending')),
  is_recurring boolean not null default false,
  recurrence_interval text, -- 'monthly', 'yearly'
  tags jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 13. الإيرادات الإضافية (غير الفواتير)
-- ============================================================================
create table if not exists public.revenue_entries (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  title_ar text,
  description text,
  source text not null, -- 'invoice', 'other', 'investment', 'refund'
  amount numeric(12,2) not null default 0,
  currency text not null default 'EGP',
  entry_date timestamptz not null default now(),
  reference_id uuid,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 14. التدفقات النقدية (Cash Flow) - عرض موحد
-- ============================================================================
create table if not exists public.cash_flow_entries (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('inflow','outflow')),
  category text not null, -- 'sales', 'expense', 'investment', 'loan', 'other'
  amount numeric(12,2) not null default 0,
  currency text not null default 'EGP',
  entry_date timestamptz not null default now(),
  reference_type text, -- 'invoice', 'expense', 'revenue', 'manual'
  reference_id uuid,
  description text,
  description_ar text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 15. التقارير المالية المحفوظة
-- ============================================================================
create table if not exists public.financial_reports (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  title_ar text,
  report_type text not null check (report_type in ('profit_loss','cash_flow','balance_sheet','tax_summary','sales_summary')),
  period_start timestamptz not null,
  period_end timestamptz not null,
  data jsonb not null default '{}'::jsonb,
  currency text not null default 'EGP',
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 16. محادثات المساعد الذكي (AI)
-- ============================================================================
create table if not exists public.ai_conversations (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  title_ar text,
  message_count integer not null default 0,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 17. رسائل المساعد الذكي
-- ============================================================================
create table if not exists public.ai_messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.ai_conversations(id) on delete cascade not null,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  content_ar text,
  data jsonb default '{}'::jsonb, -- بيانات مرتبطة (مثلاً معرفات الفواتير المذكورة)
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 18. رؤى وتوصيات الذكاء الاصطناعي
-- ============================================================================
create table if not exists public.ai_insights (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('anomaly','forecast','recommendation','opportunity','risk')),
  title text not null,
  title_ar text,
  description text,
  description_ar text,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  data jsonb default '{}'::jsonb,
  is_read boolean not null default false,
  is_dismissed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 19. سجل العمليات (Audit log) للإدارة
-- ============================================================================
create table if not exists public.activities (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade,
  admin_id uuid references public.profiles(id),
  user_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- فهارس وأمان على مستوى الصفوف (Row Level Security)
-- ============================================================================

-- تفعيل RLS على جميع الجداول
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscription_requests enable row level security;
alter table public.invoices enable row level security;
alter table public.quotes enable row level security;
alter table public.clients enable row level security;
alter table public.products enable row level security;
alter table public.inventory_transactions enable row level security;
alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;
alter table public.revenue_entries enable row level security;
alter table public.cash_flow_entries enable row level security;
alter table public.financial_reports enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_insights enable row level security;
alter table public.activities enable row level security;

-- ============================================================================
-- سياسات RLS - الشركات (Multi-tenant isolation)
-- ============================================================================

-- الملف الشخصي: كل مستخدم يرى ملفه فقط، ويمكنه رؤية شركته
create policy "profiles_select_own" on public.profiles
  for select using ( auth.uid() = id );
create policy "profiles_update_own" on public.profiles
  for update using ( auth.uid() = id );

-- الشركات: sees own company only
create policy "companies_select_own" on public.companies
  for select using (
    auth.uid() = owner_id OR
    id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "companies_insert_own" on public.companies
  for insert with check ( auth.uid() = owner_id );
create policy "companies_update_own" on public.companies
  for update using (
    auth.uid() = owner_id OR
    id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );

-- الخطط: الجميع يراها (للاختيار)، الإدارة تعدلها
create policy "plans_select_all" on public.subscription_plans
  for select using ( true );

-- الاشتراكات: شركة المستخدم فقط
create policy "subscriptions_select_own" on public.subscriptions
  for select using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );

-- طلبات الاشتراك
create policy "subscription_requests_select_own" on public.subscription_requests
  for select using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "subscription_requests_insert_own" on public.subscription_requests
  for insert with check (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );

-- الفواتير: شركة المستخدم فقط
create policy "invoices_select_own" on public.invoices
  for select using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "invoices_insert_own" on public.invoices
  for insert with check (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "invoices_update_own" on public.invoices
  for update using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "invoices_delete_own" on public.invoices
  for delete using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );

-- عروض الأسعار
create policy "quotes_select_own" on public.quotes
  for select using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "quotes_insert_own" on public.quotes
  for insert with check (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "quotes_update_own" on public.quotes
  for update using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "quotes_delete_own" on public.quotes
  for delete using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );

-- العملاء
create policy "clients_select_own" on public.clients
  for select using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "clients_insert_own" on public.clients
  for insert with check (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "clients_update_own" on public.clients
  for update using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "clients_delete_own" on public.clients
  for delete using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );

-- المنتجات
create policy "products_select_own" on public.products
  for select using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "products_insert_own" on public.products
  for insert with check (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "products_update_own" on public.products
  for update using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "products_delete_own" on public.products
  for delete using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );

-- حركة المخزون
create policy "inventory_transactions_select_own" on public.inventory_transactions
  for select using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "inventory_transactions_insert_own" on public.inventory_transactions
  for insert with check (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );

-- فئات المصروفات
create policy "expense_categories_select_own" on public.expense_categories
  for select using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "expense_categories_insert_own" on public.expense_categories
  for insert with check (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "expense_categories_update_own" on public.expense_categories
  for update using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "expense_categories_delete_own" on public.expense_categories
  for delete using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );

-- المصروفات
create policy "expenses_select_own" on public.expenses
  for select using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "expenses_insert_own" on public.expenses
  for insert with check (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "expenses_update_own" on public.expenses
  for update using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "expenses_delete_own" on public.expenses
  for delete using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );

-- الإيرادات
create policy "revenue_entries_select_own" on public.revenue_entries
  for select using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "revenue_entries_insert_own" on public.revenue_entries
  for insert with check (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );

-- التدفقات النقدية
create policy "cash_flow_entries_select_own" on public.cash_flow_entries
  for select using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "cash_flow_entries_insert_own" on public.cash_flow_entries
  for insert with check (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );

-- التقارير المالية
create policy "financial_reports_select_own" on public.financial_reports
  for select using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "financial_reports_insert_own" on public.financial_reports
  for insert with check (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );

-- محادثات الذكاء الاصطناعي
create policy "ai_conversations_select_own" on public.ai_conversations
  for select using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "ai_conversations_insert_own" on public.ai_conversations
  for insert with check (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "ai_conversations_update_own" on public.ai_conversations
  for update using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );

-- رسائل الذكاء الاصطناعي
create policy "ai_messages_select_own" on public.ai_messages
  for select using (
    (select company_id from public.ai_conversations where id = conversation_id limit 1) =
    (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "ai_messages_insert_own" on public.ai_messages
  for insert with check (
    (select company_id from public.ai_conversations where id = conversation_id limit 1) =
    (select company_id from public.profiles where id = auth.uid() limit 1)
  );

-- رؤى الذكاء الاصطناعي
create policy "ai_insights_select_own" on public.ai_insights
  for select using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "ai_insights_insert_own" on public.ai_insights
  for insert with check (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );
create policy "ai_insights_update_own" on public.ai_insights
  for update using (
    company_id = (select company_id from public.profiles where id = auth.uid() limit 1)
  );

-- السجلات: الإدراج للخدمة، القراءة للإدارة فقط (via Service Role)
create policy "activities_insert_service" on public.activities
  for insert with check ( true );
create policy "activities_select_admin" on public.activities
  for select using (
    (select role from public.profiles where id = auth.uid() limit 1) = 'super_admin'
  );

-- ============================================================================
-- فهارس للأداء
-- ============================================================================

create index if not exists idx_invoices_company_status on public.invoices(company_id, status);
create index if not exists idx_invoices_company_date on public.invoices(company_id, created_at);
create index if not exists idx_clients_company on public.clients(company_id);
create index if not exists idx_products_company on public.products(company_id);
create index if not exists idx_expenses_company_date on public.expenses(company_id, expense_date);
create index if not exists idx_cash_flow_company_date on public.cash_flow_entries(company_id, entry_date);
create index if not exists idx_ai_conversations_company on public.ai_conversations(company_id, updated_at);
create index if not exists idx_ai_insights_company_unread on public.ai_insights(company_id, is_read);
create index if not exists idx_subscriptions_company on public.subscriptions(company_id);
create index if not exists idx_companies_owner on public.companies(owner_id);

-- ============================================================================
-- بيانات أولية للخطط (بالجنيه المصري والدولار)
-- ============================================================================

insert into public.subscription_plans (
  name, name_ar, description, description_ar,
  price_monthly_egp, price_yearly_egp, price_monthly_usd, price_yearly_usd,
  interval, max_invoices, max_clients, max_products, max_users,
  ai_assistant_enabled, advanced_reports, inventory_management, multi_currency,
  features, features_ar, is_active, is_popular, sort_order
) values
  ('Starter', 'بداية',
   'للمستقلين وأصحاب المشاريع الصغيرة. فواتير محدودة وعملاء محدودون.',
   'للمستقلين وأصحاب المشاريع الصغيرة. عدد محدود من الفواتير والعملاء.',
   150, 1500, 5, 48, 'monthly', 50, 50, 100, 5,
   false, false, false, false,
   '["إصدار ما يصل إلى 50 فاتورة شهرياً", "إدارة ما يصل إلى 50 عميلاً", "فواتير احترافية قابلة للطباعة", "إرسال الفواتير عبر واتساب"]',
   '["إصدار ما يصل إلى 50 فاتورة شهرياً", "إدارة ما يصل إلى 50 عميلاً", "فواتير احترافية قابلة للطباعة", "إرسال الفواتير عبر واتساب"]',
   true, false, 1),

  ('Starter Yearly', 'بداية (سنوي)',
   'نفس خطة البداية بسداد سنوي مع توفير شهرين مجاناً.',
   'نفس خطة البداية بسداد سنوي مع توفير شهرين مجاناً.',
   150, 1500, 5, 48, 'yearly', 50, 50, 100, 5,
   false, false, false, false,
   '["إصدار ما يصل إلى 50 فاتورة شهرياً", "إدارة ما يصل إلى 50 عميلاً", "فواتير احترافية قابلة للطباعة", "إرسال الفواتير عبر واتساب", "توفير شهرين عند الدفع السنوي"]',
   '["إصدار ما يصل إلى 50 فاتورة شهرياً", "إدارة ما يصل إلى 50 عميلاً", "فواتير احترافية قابلة للطباعة", "إرسال الفواتير عبر واتساب", "توفير شهرين عند الدفع السنوي"]',
   true, false, 2),

  ('Professional', 'احترافية',
   'للمشروعات الناشئة. فواتير وعملاء غير محدودين وتقارير مالية وإدارة مصروفات.',
   'للمشروعات الناشئة. فواتير وعملاء غير محدودين وتقارير مالية وإدارة مصروفات.',
   300, 3000, 10, 96, 'monthly', null, null, 500, 10,
   true, true, true, true,
   '["فواتير غير محدودة", "عملاء غير محدودين", "تتبع المصروفات", "تقارير مالية متقدمة", "إدارة المخزون", "مساعد الذكاء الاصطناعي", "إرسال الفواتير عبر واتساب", "أولوية في الدعم"]',
   '["فواتير غير محدودة", "عملاء غير محدودين", "تتبع المصروفات", "تقارير مالية متقدمة", "إدارة المخزون", "مساعد الذكاء الاصطناعي", "إرسال الفواتير عبر واتساب", "أولوية في الدعم"]',
   true, true, 3),

  ('Professional Yearly', 'احترافية (سنوي)',
   'نفس خطة الاحترافية بسداد سنوي مع توفير شهرين مجاناً.',
   'نفس خطة الاحترافية بسداد سنوي مع توفير شهرين مجاناً.',
   300, 3000, 10, 96, 'yearly', null, null, 500, 10,
   true, true, true, true,
   '["فواتير غير محدودة", "عملاء غير محدودين", "تتبع المصروفات", "تقارير مالية متقدمة", "إدارة المخزون", "مساعد الذكاء الاصطناعي", "إرسال الفواتير عبر واتساب", "أولوية في الدعم", "توفير شهرين عند الدفع السنوي"]',
   '["فواتير غير محدودة", "عملاء غير محدودين", "تتبع المصروفات", "تقارير مالية متقدمة", "إدارة المخزون", "مساعد الذكاء الاصطناعي", "إرسال الفواتير عبر واتساب", "أولوية في الدعم", "توفير شهرين عند الدفع السنوي"]',
   true, false, 4),

  ('Enterprise', 'مؤسسات',
   'للشركات والفرق الكبيرة. كل شيء غير محدود مع دعم مخصص وإمكانيات متقدمة.',
   'للشركات والفرق الكبيرة. كل شيء غير محدود مع دعم مخصص وإمكانيات متقدمة.',
   750, 7500, 25, 240, 'monthly', null, null, null, 50,
   true, true, true, true,
   '["كل شيء غير محدود", "فواتير وعملاء ومنتجات غير محدودة", "تقارير مالية متقدمة وتخصيص", "إدارة مخزون متقدمة مع تنبيهات", "مساعد الذكاء الاصطناعي غير محدود", "دعم العملات المتعددة", "واجهة API للتكامل", "لوحة تحكم إدارية متقدمة", "دعم أولويات 24/7"]',
   '["كل شيء غير محدود", "فواتير وعملاء ومنتجات غير محدودة", "تقارير مالية متقدمة وتخصيص", "إدارة مخزون متقدمة مع تنبيهات", "مساعد الذكاء الاصطناعي غير محدود", "دعم العملات المتعددة", "واجهة API للتكامل", "لوحة تحكم إدارية متقدمة", "دعم أولويات 24/7"]',
   true, false, 5)

on conflict do nothing;

-- فئات المصروفات الافتراضية
insert into public.expense_categories (company_id, name, name_ar, color, icon)
select
  c.id,
  'المكتب والإداري', 'المكتب والإداري', '#3b82f6', 'Briefcase'
from public.companies c
on conflict do nothing;

insert into public.expense_categories (company_id, name, name_ar, color, icon)
select
  c.id,
  'التسويق والإعلان', 'التسويق والإعلان', '#a855f7', 'Megaphone'
from public.companies c
on conflict do nothing;

insert into public.expense_categories (company_id, name, name_ar, color, icon)
select
  c.id,
  'النقل والمواصلات', 'النقل والمواصلات', '#10b981', 'Truck'
from public.companies c
on conflict do nothing;

insert into public.expense_categories (company_id, name, name_ar, color, icon)
select
  c.id,
  'الفواتير والمرافق', 'الفواتير والمرافق', '#f59e0b', 'Zap'
from public.companies c
on conflict do nothing;

insert into public.expense_categories (company_id, name, name_ar, color, icon)
select
  c.id,
  'رواتب وموظفين', 'رواتب وموظفين', '#ef4444', 'User'
from public.companies c
on conflict do nothing;

-- ملاحظة: كلمة مرور الإدارة الفائق تُضبط عبر متغير البيئة ADMIN_PASSWORD_HASH
-- (هاش bcrypt) ولا تُخزن في هذه القاعدة كنص عادي.
-- ملاحظة: جداول الشركات والمنتجات والمصروفات والذكاء الاصطناعي تضاف للتوسع المستقبلي.