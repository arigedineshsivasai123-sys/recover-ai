from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import MerchantSettings
from app.schemas import MerchantSettingsSchema, SettingsUpdateSchema

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("", response_model=MerchantSettingsSchema)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(MerchantSettings).filter_by(id="default").first()
    if not settings:
        settings = MerchantSettings(id="default")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("", response_model=MerchantSettingsSchema)
def update_settings(update_data: SettingsUpdateSchema, db: Session = Depends(get_db)):
    settings = db.query(MerchantSettings).filter_by(id="default").first()
    if not settings:
        settings = MerchantSettings(id="default")
        db.add(settings)

    if update_data.auto_recovery_enabled is not None:
        settings.auto_recovery_enabled = update_data.auto_recovery_enabled
    if update_data.max_auto_amount is not None:
        settings.max_auto_amount = update_data.max_auto_amount
        settings.approval_threshold = update_data.max_auto_amount
    if update_data.max_attempts is not None:
        settings.max_attempts = update_data.max_attempts
    if update_data.max_discount is not None:
        settings.max_discount = update_data.max_discount
    if update_data.approval_threshold is not None:
        settings.approval_threshold = update_data.approval_threshold

    db.commit()
    db.refresh(settings)
    return settings
