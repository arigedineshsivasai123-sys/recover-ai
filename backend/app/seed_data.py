import uuid
import datetime
from sqlalchemy.orm import Session
from app.models import Customer, Transaction, RecoveryAttempt, AuditLog, MerchantSettings

def seed_initial_data(db: Session):
    # Check if settings already exist
    existing_settings = db.query(MerchantSettings).filter_by(id="default").first()
    if not existing_settings:
        settings = MerchantSettings(
            id="default",
            auto_recovery_enabled=True,
            max_auto_amount=5000.0,
            max_attempts=2,
            max_discount=10.0,
            approval_threshold=5000.0
        )
        db.add(settings)
        db.commit()

    if db.query(Customer).count() > 0:
        return # Data already seeded

    now = datetime.datetime.utcnow()

    # Seed Customers
    customers_data = [
        {"id": "cust_1", "name": "Rahul Sharma", "email": "rahul.sharma@example.com", "phone": "+91 98765 43210", "total_purchases": 4},
        {"id": "cust_2", "name": "Ananya Verma", "email": "ananya.verma@example.com", "phone": "+91 98765 43211", "total_purchases": 12},
        {"id": "cust_3", "name": "Vikram Patel", "email": "vikram.patel@example.com", "phone": "+91 98765 43212", "total_purchases": 8},
        {"id": "cust_4", "name": "Priya Singh", "email": "priya.singh@example.com", "phone": "+91 98765 43213", "total_purchases": 2},
        {"id": "cust_5", "name": "Amit Kumar", "email": "amit.kumar@example.com", "phone": "+91 98765 43214", "total_purchases": 15},
        {"id": "cust_6", "name": "Sneha Roy", "email": "sneha.roy@example.com", "phone": "+91 98765 43215", "total_purchases": 1},
        {"id": "cust_7", "name": "Rajesh Gupta", "email": "rajesh.gupta@example.com", "phone": "+91 98765 43216", "total_purchases": 6},
        {"id": "cust_8", "name": "Meera Iyer", "email": "meera.iyer@example.com", "phone": "+91 98765 43217", "total_purchases": 5},
        {"id": "cust_9", "name": "Arjun Nair", "email": "arjun.nair@example.com", "phone": "+91 98765 43218", "total_purchases": 20},
        {"id": "cust_10", "name": "Rohan Mehta", "email": "rohan.mehta@example.com", "phone": "+91 98765 43219", "total_purchases": 1},
    ]

    for c in customers_data:
        db.add(Customer(
            id=c["id"],
            name=c["name"],
            email=c["email"],
            phone=c["phone"],
            total_purchases=c["total_purchases"],
            created_at=now - datetime.timedelta(days=15)
        ))
    db.commit()

    # Seed Transactions
    transactions_data = [
        {
            "id": "txn_1024", "txn_code": "TXN_1024", "customer_id": "cust_1", "amount": 2999.0,
            "status": "PAYMENT_FAILED", "failure_reason": "Payment failed (3DS Verification)",
            "item_name": "Running Shoes Pro 2.0", "attempt_count": 1, "ai_analyzed": False,
            "created_time": now - datetime.timedelta(minutes=45)
        },
        {
            "id": "txn_1025", "txn_code": "TXN_1025", "customer_id": "cust_2", "amount": 8499.0,
            "status": "PAYMENT_FAILED", "failure_reason": "Bank Timeout / High Value Transaction",
            "item_name": "Noise Cancelling Headphones", "attempt_count": 1, "ai_analyzed": True,
            "created_time": now - datetime.timedelta(hours=2)
        },
        {
            "id": "txn_1026", "txn_code": "TXN_1026", "customer_id": "cust_3", "amount": 1499.0,
            "status": "RECOVERED", "failure_reason": "Card Declined (Insufficient Funds)",
            "item_name": "Ergonomic Desk Mat", "attempt_count": 2, "ai_analyzed": True,
            "created_time": now - datetime.timedelta(hours=5)
        },
        {
            "id": "txn_1027", "txn_code": "TXN_1027", "customer_id": "cust_4", "amount": 4200.0,
            "status": "RECOVERY_APPROVED", "failure_reason": "Checkout Abandoned",
            "item_name": "Smart Fitness Band", "attempt_count": 1, "ai_analyzed": True,
            "created_time": now - datetime.timedelta(hours=8)
        },
        {
            "id": "txn_1028", "txn_code": "TXN_1028", "customer_id": "cust_5", "amount": 12999.0,
            "status": "PAYMENT_FAILED", "failure_reason": "Network Error at Gateway",
            "item_name": "4K Ultra Monitor", "attempt_count": 1, "ai_analyzed": False,
            "created_time": now - datetime.timedelta(hours=12)
        },
        {
            "id": "txn_1029", "txn_code": "TXN_1029", "customer_id": "cust_6", "amount": 3499.0,
            "status": "PAYMENT_FAILED", "failure_reason": "OTP Timeout",
            "item_name": "Mechanical Gaming Keyboard", "attempt_count": 1, "ai_analyzed": False,
            "created_time": now - datetime.timedelta(hours=18)
        },
        {
            "id": "txn_1030", "txn_code": "TXN_1030", "customer_id": "cust_7", "amount": 6999.0,
            "status": "RECOVERED", "failure_reason": "Card Expired",
            "item_name": "Smart Watch Series 5", "attempt_count": 2, "ai_analyzed": True,
            "created_time": now - datetime.timedelta(days=1)
        },
        {
            "id": "txn_1031", "txn_code": "TXN_1031", "customer_id": "cust_8", "amount": 2199.0,
            "status": "RECOVERED", "failure_reason": "OTP Verification Failed",
            "item_name": "Wireless Charging Dock", "attempt_count": 2, "ai_analyzed": True,
            "created_time": now - datetime.timedelta(days=1, hours=4)
        },
        {
            "id": "txn_1032", "txn_code": "TXN_1032", "customer_id": "cust_9", "amount": 18500.0,
            "status": "RECOVERED", "failure_reason": "Payment Gateway Error",
            "item_name": "Standing Desk Converter", "attempt_count": 2, "ai_analyzed": True,
            "created_time": now - datetime.timedelta(days=2)
        },
        {
            "id": "txn_1033", "txn_code": "TXN_1033", "customer_id": "cust_10", "amount": 1999.0,
            "status": "MAX_ATTEMPTS_REACHED", "failure_reason": "Repeated Authentication Failure",
            "item_name": "Leather Travel Duffel", "attempt_count": 3, "ai_analyzed": True,
            "created_time": now - datetime.timedelta(days=2, hours=6)
        },
    ]

    for t in transactions_data:
        db.add(Transaction(
            id=t["id"],
            txn_code=t["txn_code"],
            customer_id=t["customer_id"],
            amount=t["amount"],
            currency="INR",
            status=t["status"],
            failure_reason=t["failure_reason"],
            item_name=t["item_name"],
            attempt_count=t["attempt_count"],
            ai_analyzed=t["ai_analyzed"],
            created_at=t["created_time"],
            updated_at=t["created_time"]
        ))

    db.commit()

    # Seed Initial Recovery Attempts for analyzed transactions
    attempts_data = [
        {
            "id": "att_1025", "transaction_id": "txn_1025", "action": "MERCHANT_APPROVAL",
            "ai_probability": 65, "risk_level": "HIGH", "status": "PENDING", "attempt_number": 1,
            "reason": "Transaction amount (₹8,499) exceeds automatic threshold (₹5,000). High purchase intent detected.",
            "customer_message": "Hello Ananya, we saved your items! Complete your checkout safely."
        },
        {
            "id": "att_1026", "transaction_id": "txn_1026", "action": "PAYMENT_RETRY",
            "ai_probability": 91, "risk_level": "LOW", "status": "EXECUTED", "attempt_number": 2,
            "reason": "Customer attempted twice and has 8 previous successful orders. Insufficient funds resolved.",
            "customer_message": "Hi Vikram, click here to retry your ₹1,499 payment via UPI or Card."
        },
        {
            "id": "att_1027", "transaction_id": "txn_1027", "action": "REMINDER",
            "ai_probability": 74, "risk_level": "LOW", "status": "APPROVED", "attempt_number": 1,
            "reason": "Cart abandoned within 8 hours. Customer has high historical engagement.",
            "customer_message": "Hi Priya! Your Smart Fitness Band is still reserved for you."
        },
        {
            "id": "att_1030", "transaction_id": "txn_1030", "action": "PAYMENT_RETRY",
            "ai_probability": 88, "risk_level": "LOW", "status": "EXECUTED", "attempt_number": 2,
            "reason": "Card expired during checkout; customer updated card details.",
            "customer_message": "Hi Rajesh, please retry your ₹6,999 order with your new card."
        },
        {
            "id": "att_1031", "transaction_id": "txn_1031", "action": "PAYMENT_RETRY",
            "ai_probability": 85, "risk_level": "LOW", "status": "EXECUTED", "attempt_number": 2,
            "reason": "OTP timeout occurred. Instant retry link delivered.",
            "customer_message": "Hi Meera, your ₹2,199 payment retry link is ready."
        },
        {
            "id": "att_1032", "transaction_id": "txn_1032", "action": "MERCHANT_APPROVAL",
            "ai_probability": 70, "risk_level": "HIGH", "status": "EXECUTED", "attempt_number": 2,
            "reason": "High value order (₹18,500) approved manually by merchant after verification.",
            "customer_message": "Hi Arjun, your order link has been authorized by the merchant."
        },
        {
            "id": "att_1033", "transaction_id": "txn_1033", "action": "NO_ACTION",
            "ai_probability": 20, "risk_level": "HIGH", "status": "FAILED", "attempt_number": 3,
            "reason": "Maximum automated retry attempts (2) reached. Safety engine blocked further retries.",
            "customer_message": "Payment failed multiple times. Please contact support."
        },
    ]

    for a in attempts_data:
        db.add(RecoveryAttempt(
            id=a["id"],
            transaction_id=a["transaction_id"],
            action=a["action"],
            ai_probability=a["ai_probability"],
            reason=a["reason"],
            customer_message=a["customer_message"],
            risk_level=a["risk_level"],
            status=a["status"],
            attempt_number=a["attempt_number"],
            created_at=now - datetime.timedelta(hours=3)
        ))

    db.commit()

    # Seed Initial Audit Logs
    audit_logs_data = [
        {
            "id": str(uuid.uuid4()), "transaction_id": "txn_1024", "actor": "System",
            "event_type": "PAYMENT_FAILED", "description": "Transaction TXN_1024 failed for Rahul Sharma: Payment failed (3DS Verification)",
            "amount": 2999.0, "metadata_json": '{"failure_code": "BAD_3DS", "amount": 2999}'
        },
        {
            "id": str(uuid.uuid4()), "transaction_id": "txn_1026", "actor": "AI",
            "event_type": "AI_ANALYSIS", "description": "AI calculated recovery probability of 91% for TXN_1026",
            "amount": 1499.0, "metadata_json": '{"probability": 91, "recommended_action": "PAYMENT_RETRY"}'
        },
        {
            "id": str(uuid.uuid4()), "transaction_id": "txn_1026", "actor": "System",
            "event_type": "SAFETY_CHECK", "description": "Deterministic safety check passed: Amount ₹1,499 <= ₹5,000 limit, attempt 1 <= 2",
            "amount": 1499.0, "metadata_json": '{"passed": true, "max_auto_amount": 5000}'
        },
        {
            "id": str(uuid.uuid4()), "transaction_id": "txn_1026", "actor": "Customer",
            "event_type": "CUSTOMER_CONFIRMATION", "description": "Vikram Patel confirmed recovery checkout for ₹1,499",
            "amount": 1499.0, "metadata_json": '{"action": "CONFIRM_PAYMENT"}'
        },
        {
            "id": str(uuid.uuid4()), "transaction_id": "txn_1026", "actor": "System",
            "event_type": "RAZORPAY_ORDER_CREATED", "description": "Razorpay order order_Rzp1026 Created for ₹1,499",
            "amount": 1499.0, "metadata_json": '{"razorpay_order_id": "order_Rzp1026"}'
        },
        {
            "id": str(uuid.uuid4()), "transaction_id": "txn_1026", "actor": "System",
            "event_type": "PAYMENT_SUCCESS", "description": "Razorpay Test Payment verified with valid HMAC signature",
            "amount": 1499.0, "metadata_json": '{"razorpay_payment_id": "pay_Rzp1026_test"}'
        },
        {
            "id": str(uuid.uuid4()), "transaction_id": "txn_1026", "actor": "System",
            "event_type": "REVENUE_RECOVERED", "description": "Revenue of ₹1,499 successfully recovered by RecoverAI!",
            "amount": 1499.0, "metadata_json": '{"status": "RECOVERED"}'
        },
        {
            "id": str(uuid.uuid4()), "transaction_id": "txn_1030", "actor": "System",
            "event_type": "REVENUE_RECOVERED", "description": "Revenue of ₹6,999 successfully recovered by RecoverAI!",
            "amount": 6999.0, "metadata_json": '{"status": "RECOVERED"}'
        },
        {
            "id": str(uuid.uuid4()), "transaction_id": "txn_1031", "actor": "System",
            "event_type": "REVENUE_RECOVERED", "description": "Revenue of ₹2,199 successfully recovered by RecoverAI!",
            "amount": 2199.0, "metadata_json": '{"status": "RECOVERED"}'
        },
        {
            "id": str(uuid.uuid4()), "transaction_id": "txn_1032", "actor": "Merchant",
            "event_type": "MERCHANT_APPROVAL", "description": "Merchant approved recovery action for high-value transaction TXN_1032 (₹18,500)",
            "amount": 18500.0, "metadata_json": '{"approved_by": "Merchant Admin"}'
        },
        {
            "id": str(uuid.uuid4()), "transaction_id": "txn_1032", "actor": "System",
            "event_type": "REVENUE_RECOVERED", "description": "Revenue of ₹18,500 successfully recovered by RecoverAI!",
            "amount": 18500.0, "metadata_json": '{"status": "RECOVERED"}'
        },
    ]

    for log in audit_logs_data:
        db.add(AuditLog(
            id=log["id"],
            transaction_id=log["transaction_id"],
            actor=log["actor"],
            event_type=log["event_type"],
            description=log["description"],
            amount=log["amount"],
            metadata_json=log["metadata_json"],
            created_at=now - datetime.timedelta(hours=2)
        ))

    db.commit()
