from __future__ import annotations
from typing import Any
import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.audit_chain import verify_chain
from models.db import get_db, AuditLog
from .auth import require_role

router = APIRouter()

@router.get("/decision/{application_id}", dependencies=[Depends(require_role(["compliance"]))])
async def get_decision_detail(application_id: str, db: Session = Depends(get_db)):
    entry = db.query(AuditLog).filter(AuditLog.application_id == application_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Decision record not found")
    
    # Identify top factors from SHAP values
    sorted_factors = sorted(
        entry.shap_values.items(), 
        key=lambda x: abs(x[1]), 
        reverse=True
    )
    
    return {
        "application_id": entry.application_id,
        "user_id": entry.user_id,
        "decision": entry.decision,
        "probability": entry.probability,
        "input_data": entry.input_data,
        "shap_values": entry.shap_values,
        "top_factors": [f[0] for f in sorted_factors[:5]],
        "timestamp": entry.timestamp,
        "previous_hash": entry.previous_hash,
        "current_hash": entry.current_hash
    }

@router.get("/chain/verify", dependencies=[Depends(require_role(["compliance"]))])
async def verify_audit_chain(db: Session = Depends(get_db)):
    return verify_chain(db)

@router.get("/anomalies", dependencies=[Depends(require_role(["compliance"]))])
async def detect_anomalies(db: Session = Depends(get_db)):
    # Fetch last 100 decisions to establish a baseline
    records = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(100).all()
    if not records:
        return []
    
    probs = [r.probability for r in records]
    mean = np.mean(probs)
    std = np.std(probs)
    
    anomalies = []
    for r in records:
        if abs(r.probability - mean) > 2 * std:
            anomalies.append({
                "application_id": r.application_id,
                "probability": round(r.probability, 4),
                "flag": "statistical_outlier",
                "deviation_score": round(abs(r.probability - mean) / std, 2) if std > 0 else 0,
                "timestamp": r.timestamp
            })
            
    return anomalies

@router.get("/recent", dependencies=[Depends(require_role(["compliance"]))])
async def get_recent_decisions(db: Session = Depends(get_db)):
    """Returns the last 20 audit entries for dashboard views."""
    records = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(20).all()
    return records
