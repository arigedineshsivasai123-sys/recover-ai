export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_purchases: number;
  created_at: string;
}

export interface RecoveryAttempt {
  id: string;
  transaction_id: string;
  action: string;
  ai_probability: number;
  reason: string;
  customer_message?: string;
  risk_level: string;
  status: string;
  attempt_number: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  transaction_id?: string;
  actor: 'AI' | 'Customer' | 'Merchant' | 'System';
  event_type: string;
  description: string;
  amount?: number;
  metadata_json?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  txn_code: string;
  customer_id: string;
  customer?: Customer;
  amount: number;
  currency: string;
  status: 'PAYMENT_FAILED' | 'AI_ANALYZED' | 'RECOVERY_PENDING' | 'RECOVERY_APPROVED' | 'RETRY_PAYMENT' | 'PAYMENT_SUCCESS' | 'RECOVERED' | 'RECOVERY_REJECTED' | 'MAX_ATTEMPTS_REACHED' | 'EXPIRED';
  failure_reason: string;
  item_name: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  attempt_count: number;
  max_attempts: number;
  ai_analyzed: boolean;
  created_at: string;
  updated_at: string;
  attempts?: RecoveryAttempt[];
}

export interface DashboardKPIs {
  revenue_at_risk: number;
  recovered_revenue: number;
  recovery_rate: number;
  failed_payments_count: number;
  abandoned_checkouts_count: number;
  recovery_attempts_count: number;
  successful_recoveries_count: number;
  tagline_message: string;
}

export interface AIAnalysisResult {
  transaction_id: string;
  recovery_probability: number;
  recommended_action: string;
  reason: string;
  risk_level: string;
  customer_message: string;
  requires_approval: boolean;
  safety_passed: boolean;
  safety_message: string;
  demo_mode: boolean;
}

export interface MerchantSettings {
  id: string;
  auto_recovery_enabled: boolean;
  max_auto_amount: number;
  max_attempts: number;
  max_discount: number;
  approval_threshold: number;
  updated_at: string;
}

export interface AnalyticsOverview {
  revenue_at_risk: number;
  recovered_revenue: number;
  recovery_rate: number;
  average_recovery_amount: number;
  traditional_baseline_rate: number;
  recover_ai_rate: number;
  rate_improvement: number;
  action_breakdown: Array<{ action: string; recovered_amount: number; count: number; color: string }>;
  failure_reason_breakdown: Array<{ reason: string; count: number }>;
  recovery_trend: Array<{ day: string; at_risk: number; recovered: number }>;
}

export interface RazorpayOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  transaction_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  message: string;
  status: string;
  transaction_id: string;
  recovered_amount: number;
}
