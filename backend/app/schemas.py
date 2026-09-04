from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class CustomerSchema(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    total_purchases: int
    created_at: datetime

    class Config:
        from_attributes = True

class RecoveryAttemptSchema(BaseModel):
    id: str
    transaction_id: str
    action: str
    ai_probability: int
    reason: str
    customer_message: Optional[str] = None
    risk_level: str
    status: str
    attempt_number: int
    created_at: datetime

    class Config:
        from_attributes = True

class AuditLogSchema(BaseModel):
    id: str
    transaction_id: Optional[str] = None
    actor: str
    event_type: str
    description: str
    amount: Optional[float] = None
    metadata_json: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TransactionSchema(BaseModel):
    id: str
    txn_code: str
    customer_id: str
    customer: Optional[CustomerSchema] = None
    amount: float
    currency: str
    status: str
    failure_reason: str
    item_name: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    attempt_count: int
    max_attempts: int
    ai_analyzed: bool
    created_at: datetime
    updated_at: datetime
    attempts: List[RecoveryAttemptSchema] = []

    class Config:
        from_attributes = True

class MerchantSettingsSchema(BaseModel):
    id: str
    auto_recovery_enabled: bool
    max_auto_amount: float
    max_attempts: int
    max_discount: float
    approval_threshold: float
    updated_at: datetime

    class Config:
        from_attributes = True

class SettingsUpdateSchema(BaseModel):
    auto_recovery_enabled: Optional[bool] = None
    max_auto_amount: Optional[float] = None
    max_attempts: Optional[int] = None
    max_discount: Optional[float] = None
    approval_threshold: Optional[float] = None

class AIAnalysisResultSchema(BaseModel):
    transaction_id: str
    recovery_probability: int
    recommended_action: str
    reason: str
    risk_level: str
    customer_message: str
    requires_approval: bool
    safety_passed: bool
    safety_message: str
    demo_mode: bool

class RazorpayOrderCreateRequest(BaseModel):
    transaction_id: str

class RazorpayOrderCreateResponse(BaseModel):
    order_id: str
    amount: float
    currency: str
    key_id: str
    transaction_id: str
    customer_name: str
    customer_email: str
    customer_phone: str

class RazorpayPaymentVerifyRequest(BaseModel):
    transaction_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    simulate_failure: Optional[bool] = False

class RazorpayPaymentVerifyResponse(BaseModel):
    success: bool
    message: str
    status: str
    transaction_id: str
    recovered_amount: float

class DashboardKPISchema(BaseModel):
    revenue_at_risk: float
    recovered_revenue: float
    recovery_rate: float
    failed_payments_count: int
    abandoned_checkouts_count: int
    recovery_attempts_count: int
    successful_recoveries_count: int
    tagline_message: str = "₹31,200 recovered by RecoverAI"

class AnalyticsOverviewSchema(BaseModel):
    revenue_at_risk: float
    recovered_revenue: float
    recovery_rate: float
    average_recovery_amount: float
    traditional_baseline_rate: float = 38.0
    recover_ai_rate: float = 59.5
    rate_improvement: float = 21.5
    action_breakdown: List[dict]
    failure_reason_breakdown: List[dict]
    recovery_trend: List[dict]
