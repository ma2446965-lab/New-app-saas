export type UserRole = "user" | "admin";
export type SubscriptionStatus = "trial" | "active" | "expired" | "canceled" | "past_due";
export type PlanInterval = "monthly" | "yearly";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export type RequestStatus = "pending" | "approved" | "rejected";

export interface Plan {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  price_monthly_egp: number;
  price_yearly_egp: number;
  interval: PlanInterval;
  max_invoices: number | null;
  max_clients: number | null;
  features: string[];
  features_ar?: string[];
  is_active: boolean;
  is_popular?: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  account_id: string | null;
  phone: string | null;
  role: UserRole;
  subscription_status: SubscriptionStatus;
  subscription_plan: string | null;
  trial_ends_at: string | null;
  subscription_starts_at: string | null;
  subscription_ends_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_tax_number: string | null;
  items: any;
  subtotal: number;
  tax_amount: number;
  total: number;
  status: InvoiceStatus;
  due_date: string | null;
  issued_at: string;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  tax_number: string | null;
  address: string | null;
  created_at: string;
}

export interface SubscriptionRequest {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  account_id: string;
  plan_name: string;
  plan_name_ar: string;
  price_egp: number;
  duration: string;
  requested_at: string;
  status: RequestStatus;
  admin_notes: string | null;
  activated_by: string | null;
  activated_at: string | null;
}

export interface DashboardStats {
  total_users: number;
  active_users: number;
  trial_users: number;
  paid_users: number;
  expired_users: number;
  total_revenue: number;
  monthly_revenue: number;
  yearly_revenue: number;
  conversion_rate: number;
  churn_rate: number;
  arpu: number;
  top_plans: { plan: string; count: number; revenue: number }[];
}
