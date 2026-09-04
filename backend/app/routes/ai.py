import uuid
import datetime
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Transaction, Customer, MerchantSettings, RecoveryAttempt, AuditLog
from app.schemas import AIAnalysisResultSchema
from app.ai_agent import ai_agent
from app.safety_engine import safety_engine
from app.state_machine import validate_state_transition

router = APIRouter(prefix="/api/ai", tags=["AI Agent"])

@router.post("/analyze/{transaction_id}", response_model=AIAnalysisResultSchema)
def analyze_transaction(transaction_id: str, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(
        (Transaction.id == transaction_id) | (Transaction.txn_code == transaction_id)
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    customer = db.query(Customer).filter_by(id=tx.customer_id).first()
    settings = db.query(MerchantSettings).filter_by(id="default").first()
    if not settings:
        settings = MerchantSettings(id="default")
        db.add(settings)
        db.commit()

    # Step 1: Contextual AI Analysis
    ai_raw = ai_agent.analyze_recovery_opportunity(tx, customer, settings)

    rec_action = ai_raw["recommended_action"]
    prob = ai_raw["recovery_probability"]

    # Step 2: Server-side Safety Engine Evaluation
    passed, final_action, safety_reason = safety_engine.evaluate_transaction_safety(
        transaction=tx,
        recommended_action=rec_action,
        ai_probability=prob,
        settings=settings
    )

    requires_approval = (final_action == "MERCHANT_APPROVAL" or not passed)

    # Step 3: Log AI Analysis and Decision to Audit Trail
    now = datetime.datetime.utcnow()
    
    audit_ai = AuditLog(
        id=str(uuid.uuid4()),
        transaction_id=tx.id,
        actor="AI",
        event_type="AI_ANALYSIS",
        description=f"AI Agent analyzed {tx.txn_code}: {prob}% probability, recommended '{rec_action}'. Reason: {ai_raw['reason']}",
        amount=tx.amount,
        metadata_json=json.dumps(ai_raw),
        created_at=now
    )
    db.add(audit_ai)

    audit_safety = AuditLog(
        id=str(uuid.uuid4()),
        transaction_id=tx.id,
        actor="System",
        event_type="SAFETY_CHECK",
        description=safety_reason,
        amount=tx.amount,
        metadata_json=json.dumps({"passed": passed, "final_action": final_action}),
        created_at=now + datetime.timedelta(seconds=1)
    )
    db.add(audit_safety)

    # Step 4: Record Recovery Attempt
    attempt = RecoveryAttempt(
        id=f"att_{uuid.uuid4().hex[:8]}",
        transaction_id=tx.id,
        action=final_action,
        ai_probability=prob,
        reason=ai_raw["reason"],
        customer_message=ai_raw.get("customer_message"),
        risk_level=ai_raw.get("risk_level", "LOW"),
        status="APPROVED" if (passed and not requires_approval) else "PENDING",
        attempt_number=tx.attempt_count,
        created_at=now
    )
    db.add(attempt)

    # Step 5: Update Transaction Status via State Machine
    target_status = "RECOVERY_APPROVED" if (passed and not requires_approval) else "AI_ANALYZED"
    valid, msg = validate_state_transition(tx.status, target_status)
    if valid:
        tx.status = target_status
    tx.ai_analyzed = True
    tx.updated_at = now

    db.commit()
    db.refresh(tx)

    return AIAnalysisResultSchema(
        transaction_id=tx.id,
        recovery_probability=prob,
        recommended_action=final_action,
        reason=ai_raw["reason"],
        risk_level=ai_raw.get("risk_level", "LOW"),
        customer_message=ai_raw.get("customer_message", ""),
        requires_approval=requires_approval,
        safety_passed=passed,
        safety_message=safety_reason,
        demo_mode=ai_raw.get("demo_mode", True)
    )
