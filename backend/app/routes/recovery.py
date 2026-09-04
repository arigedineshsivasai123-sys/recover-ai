import uuid
import datetime
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Transaction, RecoveryAttempt, AuditLog
from app.schemas import TransactionSchema
from app.state_machine import validate_state_transition

router = APIRouter(prefix="/api/recovery", tags=["Recovery Actions"])

@router.post("/{transaction_id}/approve", response_model=TransactionSchema)
def approve_recovery(transaction_id: str, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(
        (Transaction.id == transaction_id) | (Transaction.txn_code == transaction_id)
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    target_status = "RECOVERY_APPROVED"
    valid, msg = validate_state_transition(tx.status, target_status)
    if not valid and tx.status != "AI_ANALYZED" and tx.status != "PAYMENT_FAILED":
        raise HTTPException(status_code=400, detail=msg)

    now = datetime.datetime.utcnow()
    tx.status = target_status
    tx.updated_at = now

    latest_attempt = db.query(RecoveryAttempt).filter_by(transaction_id=tx.id).order_by(RecoveryAttempt.created_at.desc()).first()
    if latest_attempt:
        latest_attempt.status = "APPROVED"

    audit_entry = AuditLog(
        id=str(uuid.uuid4()),
        transaction_id=tx.id,
        actor="Merchant",
        event_type="MERCHANT_APPROVAL",
        description=f"Merchant manually approved recovery action for {tx.txn_code} (₹{tx.amount:,.2f})",
        amount=tx.amount,
        metadata_json=json.dumps({"action": "APPROVE"}),
        created_at=now
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(tx)
    return tx

@router.post("/{transaction_id}/reject", response_model=TransactionSchema)
def reject_recovery(transaction_id: str, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(
        (Transaction.id == transaction_id) | (Transaction.txn_code == transaction_id)
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    now = datetime.datetime.utcnow()
    tx.status = "RECOVERY_REJECTED"
    tx.updated_at = now

    audit_entry = AuditLog(
        id=str(uuid.uuid4()),
        transaction_id=tx.id,
        actor="Merchant",
        event_type="RECOVERY_REJECTED",
        description=f"Merchant rejected recovery action for {tx.txn_code}",
        amount=tx.amount,
        metadata_json=json.dumps({"action": "REJECT"}),
        created_at=now
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(tx)
    return tx
