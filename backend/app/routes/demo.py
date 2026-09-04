import uuid
import datetime
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db, engine, Base
from app.models import Transaction, Customer, AuditLog
from app.seed_data import seed_initial_data
from app.schemas import TransactionSchema

router = APIRouter(prefix="/api/demo", tags=["Hackathon Demo"])

@router.post("/fail-payment", response_model=TransactionSchema)
def simulate_failed_payment(db: Session = Depends(get_db)):
    now = datetime.datetime.utcnow()
    
    # Pick or create a demo customer
    customer = db.query(Customer).first()
    if not customer:
        customer = Customer(
            id="cust_demo",
            name="Rahul Sharma",
            email="rahul.sharma@example.com",
            phone="+91 98765 43210",
            total_purchases=4
        )
        db.add(customer)
        db.commit()

    random_id = uuid.uuid4().hex[:6]
    txn_code = f"TXN_{random_id.upper()}"

    new_tx = Transaction(
        id=f"tx_{random_id}",
        txn_code=txn_code,
        customer_id=customer.id,
        amount=2999.0,
        currency="INR",
        status="PAYMENT_FAILED",
        failure_reason="DEMO SIMULATION: 3DS Authentication Failure",
        item_name="Running Shoes Pro 2.0",
        attempt_count=1,
        max_attempts=2,
        ai_analyzed=False,
        created_at=now,
        updated_at=now
    )
    db.add(new_tx)

    audit_entry = AuditLog(
        id=str(uuid.uuid4()),
        transaction_id=new_tx.id,
        actor="System",
        event_type="PAYMENT_FAILED",
        description=f"DEMO SIMULATION: Transaction {txn_code} failed (₹2,999.00)",
        amount=2999.0,
        metadata_json=json.dumps({"demo": True, "event": "SIMULATED_FAILURE"}),
        created_at=now
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(new_tx)

    return new_tx

@router.post("/reset")
def reset_demo_database(db: Session = Depends(get_db)):
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_initial_data(db)
    return {"message": "Demo database successfully reset to clean seed state."}
