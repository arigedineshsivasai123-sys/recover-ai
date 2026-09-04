import uuid
import datetime
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Transaction, Customer, AuditLog
from app.schemas import (
    RazorpayOrderCreateRequest,
    RazorpayOrderCreateResponse,
    RazorpayPaymentVerifyRequest,
    RazorpayPaymentVerifyResponse
)
from app.razorpay_service import razorpay_service
from app.state_machine import validate_state_transition

router = APIRouter(prefix="/api/payments", tags=["Payments"])

@router.post("/create-order", response_model=RazorpayOrderCreateResponse)
def create_payment_order(req: RazorpayOrderCreateRequest, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(
        (Transaction.id == req.transaction_id) | (Transaction.txn_code == req.transaction_id)
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if tx.status == "RECOVERED":
        raise HTTPException(status_code=400, detail="Transaction has already been successfully recovered!")

    if tx.attempt_count > tx.max_attempts:
        tx.status = "MAX_ATTEMPTS_REACHED"
        db.commit()
        raise HTTPException(
            status_code=400,
            detail=f"Maximum recovery attempts ({tx.max_attempts}) reached for this transaction."
        )

    customer = db.query(Customer).filter_by(id=tx.customer_id).first()
    now = datetime.datetime.utcnow()

    # Step 1: Duplicate-Order Protection - Check if active Razorpay order already exists
    if tx.razorpay_order_id:
        valid, msg = validate_state_transition(tx.status, "RETRY_PAYMENT")
        if valid:
            tx.status = "RETRY_PAYMENT"
        tx.updated_at = now

        # Log audit event for reusing existing order
        audit_reuse = AuditLog(
            id=str(uuid.uuid4()),
            transaction_id=tx.id,
            actor="System",
            event_type="RAZORPAY_ORDER_REUSED",
            description=f"Reused existing active Razorpay order '{tx.razorpay_order_id}' for {tx.txn_code} (₹{tx.amount:,.2f})",
            amount=tx.amount,
            metadata_json=json.dumps({
                "order_id": tx.razorpay_order_id,
                "reused": True,
                "transaction_id": tx.id
            }),
            created_at=now
        )
        db.add(audit_reuse)
        db.commit()

        phone_clean = customer.phone.replace(" ", "") if customer and customer.phone else "+919876543210"
        return RazorpayOrderCreateResponse(
            order_id=tx.razorpay_order_id,
            amount=tx.amount,
            currency=tx.currency,
            key_id=razorpay_service.key_id,
            transaction_id=tx.id,
            customer_name=customer.name if customer else "Valued Customer",
            customer_email=customer.email if customer else "customer@example.com",
            customer_phone=phone_clean
        )

    # Step 2: No active order exists - Create new Razorpay Order
    order_data = razorpay_service.create_order(
        amount=tx.amount,
        currency=tx.currency,
        receipt=tx.txn_code
    )

    tx.razorpay_order_id = order_data["order_id"]
    valid, msg = validate_state_transition(tx.status, "RETRY_PAYMENT")
    if valid:
        tx.status = "RETRY_PAYMENT"
    tx.updated_at = now

    audit_entry = AuditLog(
        id=str(uuid.uuid4()),
        transaction_id=tx.id,
        actor="System",
        event_type="RAZORPAY_ORDER_CREATED",
        description=f"Created Razorpay order '{order_data['order_id']}' for {tx.txn_code} (₹{tx.amount:,.2f})",
        amount=tx.amount,
        metadata_json=json.dumps(order_data),
        created_at=now
    )
    db.add(audit_entry)
    db.commit()

    phone_clean = customer.phone.replace(" ", "") if customer and customer.phone else "+919876543210"
    return RazorpayOrderCreateResponse(
        order_id=order_data["order_id"],
        amount=tx.amount,
        currency=tx.currency,
        key_id=order_data["key_id"],
        transaction_id=tx.id,
        customer_name=customer.name if customer else "Valued Customer",
        customer_email=customer.email if customer else "customer@example.com",
        customer_phone=phone_clean
    )


@router.post("/verify", response_model=RazorpayPaymentVerifyResponse)
def verify_payment(req: RazorpayPaymentVerifyRequest, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(
        (Transaction.id == req.transaction_id) | (Transaction.txn_code == req.transaction_id)
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    now = datetime.datetime.utcnow()

    # Edge Case Simulation: Customer retry payment fails
    if req.simulate_failure:
        tx.attempt_count += 1
        if tx.attempt_count > tx.max_attempts:
            tx.status = "MAX_ATTEMPTS_REACHED"
        else:
            tx.status = "PAYMENT_FAILED"
        tx.updated_at = now

        audit_fail = AuditLog(
            id=str(uuid.uuid4()),
            transaction_id=tx.id,
            actor="System",
            event_type="PAYMENT_RETRY_FAILED",
            description=f"Payment retry failed for {tx.txn_code}. Attempt {tx.attempt_count}/{tx.max_attempts}. No duplicate order created.",
            amount=tx.amount,
            metadata_json=json.dumps({"error": "Payment declined by issuing bank", "simulated": True}),
            created_at=now
        )
        db.add(audit_fail)
        db.commit()

        return RazorpayPaymentVerifyResponse(
            success=False,
            message="Payment could not be completed. You have not been charged. Your recovery session has been saved and you can try again.",
            status=tx.status,
            transaction_id=tx.id,
            recovered_amount=0.0
        )

    # Step 1: Signature Verification via Razorpay Engine
    is_valid = razorpay_service.verify_payment_signature(
        razorpay_order_id=req.razorpay_order_id,
        razorpay_payment_id=req.razorpay_payment_id,
        razorpay_signature=req.razorpay_signature
    )

    if not is_valid:
        tx.attempt_count += 1
        tx.status = "PAYMENT_FAILED"
        tx.updated_at = now
        
        audit_invalid = AuditLog(
            id=str(uuid.uuid4()),
            transaction_id=tx.id,
            actor="System",
            event_type="PAYMENT_RETRY_FAILED",
            description=f"Razorpay payment signature verification failed for {tx.txn_code}",
            amount=tx.amount,
            metadata_json=json.dumps({"razorpay_payment_id": req.razorpay_payment_id}),
            created_at=now
        )
        db.add(audit_invalid)
        db.commit()

        return RazorpayPaymentVerifyResponse(
            success=False,
            message="Invalid payment signature. Payment could not be verified.",
            status="PAYMENT_FAILED",
            transaction_id=tx.id,
            recovered_amount=0.0
        )

    # Step 2: Payment Success - Transition State Machine to RECOVERED
    tx.razorpay_payment_id = req.razorpay_payment_id
    tx.status = "RECOVERED"
    tx.updated_at = now

    audit_success = AuditLog(
        id=str(uuid.uuid4()),
        transaction_id=tx.id,
        actor="Customer",
        event_type="PAYMENT_SUCCESS",
        description=f"Razorpay Test Payment verified for {tx.txn_code} (Payment ID: {req.razorpay_payment_id})",
        amount=tx.amount,
        metadata_json=json.dumps({"razorpay_payment_id": req.razorpay_payment_id}),
        created_at=now
    )
    db.add(audit_success)

    audit_recovered = AuditLog(
        id=str(uuid.uuid4()),
        transaction_id=tx.id,
        actor="System",
        event_type="REVENUE_RECOVERED",
        description=f"Revenue of ₹{tx.amount:,.2f} successfully recovered by RecoverAI!",
        amount=tx.amount,
        metadata_json=json.dumps({"recovered_revenue": tx.amount, "status": "RECOVERED"}),
        created_at=now + datetime.timedelta(seconds=1)
    )
    db.add(audit_recovered)
    db.commit()

    return RazorpayPaymentVerifyResponse(
        success=True,
        message=f"Success! ₹{tx.amount:,.2f} has been successfully recovered.",
        status="RECOVERED",
        transaction_id=tx.id,
        recovered_amount=tx.amount
    )
