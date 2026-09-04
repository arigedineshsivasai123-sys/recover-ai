import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    total_purchases = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    transactions = relationship("Transaction", back_populates="customer")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)
    txn_code = Column(String, unique=True, index=True, nullable=False) # e.g. TXN_1024
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    amount = Column(Float, nullable=False) # e.g. 2999.0
    currency = Column(String, default="INR")
    status = Column(String, default="PAYMENT_FAILED") # PAYMENT_FAILED, AI_ANALYZED, RECOVERY_PENDING, RECOVERY_APPROVED, RETRY_PAYMENT, PAYMENT_SUCCESS, RECOVERED, RECOVERY_REJECTED, MAX_ATTEMPTS_REACHED, EXPIRED
    failure_reason = Column(String, nullable=False) # Card Declined, Insufficient Funds, Abandoned Checkout, Network Error
    item_name = Column(String, default="Premium Plan / Goods")
    razorpay_order_id = Column(String, nullable=True)
    razorpay_payment_id = Column(String, nullable=True)
    attempt_count = Column(Integer, default=1)
    max_attempts = Column(Integer, default=2)
    ai_analyzed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="transactions")
    attempts = relationship("RecoveryAttempt", back_populates="transaction", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="transaction", cascade="all, delete-orphan")


class RecoveryAttempt(Base):
    __tablename__ = "recovery_attempts"

    id = Column(String, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("transactions.id"), nullable=False)
    action = Column(String, nullable=False) # PAYMENT_RETRY, REMINDER, ALTERNATIVE_PAYMENT, MERCHANT_APPROVAL, NO_ACTION
    ai_probability = Column(Integer, nullable=False) # e.g. 82
    reason = Column(Text, nullable=False)
    customer_message = Column(Text, nullable=True)
    risk_level = Column(String, default="LOW") # LOW, MEDIUM, HIGH
    status = Column(String, default="PENDING") # PENDING, APPROVED, EXECUTED, FAILED, CANCELLED
    attempt_number = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    transaction = relationship("Transaction", back_populates="attempts")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("transactions.id"), nullable=True)
    actor = Column(String, nullable=False) # AI, Customer, Merchant, System
    event_type = Column(String, nullable=False) # PAYMENT_FAILED, AI_ANALYSIS, AI_DECISION, SAFETY_CHECK, CUSTOMER_CONFIRMATION, RAZORPAY_ORDER_CREATED, PAYMENT_SUCCESS, REVENUE_RECOVERED, PAYMENT_RETRY_FAILED
    description = Column(Text, nullable=False)
    amount = Column(Float, nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    transaction = relationship("Transaction", back_populates="audit_logs")


class MerchantSettings(Base):
    __tablename__ = "merchant_settings"

    id = Column(String, primary_key=True, default="default")
    auto_recovery_enabled = Column(Boolean, default=True)
    max_auto_amount = Column(Float, default=5000.0) # Maximum auto recovery amount (₹5,000)
    max_attempts = Column(Integer, default=2) # Max retry attempts
    max_discount = Column(Float, default=10.0) # Max discount percent (10%)
    approval_threshold = Column(Float, default=5000.0) # Threshold above which merchant approval is required
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
