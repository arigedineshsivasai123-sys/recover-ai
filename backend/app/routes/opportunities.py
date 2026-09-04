from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Transaction
from app.schemas import TransactionSchema

router = APIRouter(prefix="/api/opportunities", tags=["Opportunities"])

@router.get("", response_model=List[TransactionSchema])
def list_opportunities(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    
    if status and status != "ALL":
        query = query.filter(Transaction.status == status)
        
    if search:
        search_pattern = f"%{search}%"
        query = query.join(Transaction.customer).filter(
            (Transaction.txn_code.ilike(search_pattern)) |
            (Transaction.item_name.ilike(search_pattern)) |
            (Transaction.failure_reason.ilike(search_pattern))
        )
        
    return query.order_by(Transaction.created_at.desc()).all()

@router.get("/{transaction_id}", response_model=TransactionSchema)
def get_opportunity_detail(transaction_id: str, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(
        (Transaction.id == transaction_id) | (Transaction.txn_code == transaction_id)
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx
