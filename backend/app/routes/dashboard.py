from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Transaction, RecoveryAttempt
from app.schemas import DashboardKPISchema

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardKPISchema)
def get_dashboard_kpis(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).all()
    
    total_at_risk = sum(t.amount for t in transactions if t.status not in ["RECOVERED"])
    total_recovered = sum(t.amount for t in transactions if t.status == "RECOVERED")
    
    total_failed = len([t for t in transactions if "FAILED" in t.status or t.status in ["AI_ANALYZED", "RECOVERY_APPROVED", "RECOVERED"]])
    abandoned_count = len([t for t in transactions if "Abandoned" in t.failure_reason])
    attempts_count = db.query(RecoveryAttempt).count()
    successful_count = len([t for t in transactions if t.status == "RECOVERED"])
    
    denominator = (total_recovered + total_at_risk) if (total_recovered + total_at_risk) > 0 else 1
    recovery_rate = round((total_recovered / denominator) * 100, 1)

    return DashboardKPISchema(
        revenue_at_risk=total_at_risk,
        recovered_revenue=total_recovered,
        recovery_rate=recovery_rate,
        failed_payments_count=total_failed,
        abandoned_checkouts_count=abandoned_count,
        recovery_attempts_count=attempts_count,
        successful_recoveries_count=successful_count,
        tagline_message=f"₹{total_recovered:,.0f} recovered by RecoverAI"
    )
