import {
  DashboardKPIs,
  Transaction,
  AIAnalysisResult,
  AuditLog,
  AnalyticsOverview,
  MerchantSettings,
  RazorpayOrderResponse,
  PaymentVerifyResponse
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: 'API Error' }));
    throw new Error(errorBody.detail || `HTTP Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  getDashboardKPIs: () => fetchJSON<DashboardKPIs>('/dashboard'),

  getOpportunities: (status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    return fetchJSON<Transaction[]>(`/opportunities?${params.toString()}`);
  },

  getOpportunityDetail: (id: string) => fetchJSON<Transaction>(`/opportunities/${id}`),

  analyzeTransaction: (id: string) =>
    fetchJSON<AIAnalysisResult>(`/ai/analyze/${id}`, { method: 'POST' }),

  approveRecovery: (id: string) =>
    fetchJSON<Transaction>(`/recovery/${id}/approve`, { method: 'POST' }),

  rejectRecovery: (id: string) =>
    fetchJSON<Transaction>(`/recovery/${id}/reject`, { method: 'POST' }),

  createRazorpayOrder: (transaction_id: string) =>
    fetchJSON<RazorpayOrderResponse>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ transaction_id }),
    }),

  verifyRazorpayPayment: (payload: {
    transaction_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    simulate_failure?: boolean;
  }) =>
    fetchJSON<PaymentVerifyResponse>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAuditTrail: (filters?: { transaction_id?: string; actor?: string; event_type?: string }) => {
    const params = new URLSearchParams();
    if (filters?.transaction_id) params.append('transaction_id', filters.transaction_id);
    if (filters?.actor) params.append('actor', filters.actor);
    if (filters?.event_type) params.append('event_type', filters.event_type);
    return fetchJSON<AuditLog[]>(`/audit?${params.toString()}`);
  },

  getAnalytics: () => fetchJSON<AnalyticsOverview>('/analytics'),

  getSettings: () => fetchJSON<MerchantSettings>('/settings'),

  updateSettings: (settings: Partial<MerchantSettings>) =>
    fetchJSON<MerchantSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  simulateFailedPayment: () =>
    fetchJSON<Transaction>('/demo/fail-payment', { method: 'POST' }),

  resetDemoDatabase: () =>
    fetchJSON<{ message: string }>('/demo/reset', { method: 'POST' }),
};
