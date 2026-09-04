from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AuditLog
from app.schemas import AuditLogSchema

router = APIRouter(prefix="/api/audit", tags=["Audit Trail"])

@router.get("", response_model=List[AuditLogSchema])
def get_audit_trail(
    transaction_id: Optional[str] = Query(None),
    actor: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if transaction_id:
        query = query.filter(AuditLog.transaction_id == transaction_id)
    if actor and actor != "ALL":
        query = query.filter(AuditLog.actor == actor)
    if event_type and event_type != "ALL":
        query = query.filter(AuditLog.event_type == event_type)
        
    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()
