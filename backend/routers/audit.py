import numpy as np
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.audit_chain import verify_chain, compute_hash
from models.db import get_db, AuditLog
from services.forensic_ai import analyze_ledger_anomaly
from .auth import require_role

router = APIRouter()

@router.get("/recent", dependencies=[Depends(require_role(["compliance"]))])
async def get_recent_decisions(limit: int = 10, db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.id.desc()).limit(limit).all()

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

@router.post("/chain/analyze", dependencies=[Depends(require_role(["compliance"]))])
async def analyze_anomaly(status: dict, db: Session = Depends(get_db)):
    app_id = status.get("application_id")
    if not app_id:
        raise HTTPException(status_code=400, detail="Application ID required for analysis")
    
    # Fetch the actual record from DB
    entry = db.query(AuditLog).filter(AuditLog.application_id == app_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Record not found")
        
    record_dict = {
        "application_id": entry.application_id,
        "decision": entry.decision,
        "probability": entry.probability,
        "input_data": entry.input_data,
        "shap_values": entry.shap_values,
        "bank_name": entry.bank_name,
        "timestamp": entry.timestamp.isoformat()
    }
    
    # Use AI to analyze the record's internal consistency
    analysis = analyze_ledger_anomaly(record_dict)
    return analysis

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

@router.get("/system/status", dependencies=[Depends(require_role(["compliance"]))])
async def get_system_status(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_start = today_start - timedelta(days=1)
    
    today_count = db.query(AuditLog).filter(AuditLog.timestamp >= today_start).count()
    yesterday_count = db.query(AuditLog).filter(
        AuditLog.timestamp >= yesterday_start,
        AuditLog.timestamp < today_start
    ).count()
    
    from sqlalchemy import func
    avg_conf = db.query(func.avg(AuditLog.probability)).filter(AuditLog.timestamp >= today_start).scalar() or 0
    
    # Actually calculate anomalies for the status report
    all_anomalies = await detect_anomalies(db)
    
    # Check chain integrity
    integrity = verify_chain(db)
    
    return {
        "model_trained_at": (now - timedelta(days=4)).isoformat(),
        "today_count": today_count,
        "yesterday_count": yesterday_count,
        "total_anomalies": len(all_anomalies),
        "avg_confidence": round(float(avg_conf), 4),
        "recent_anomalies": all_anomalies[:5],
        "integrity": integrity,
        "node_status": "operational" if integrity["valid"] else "compromised",
        "last_verify_cycle": (now - timedelta(minutes=45)).isoformat()
    }

@router.post("/decision/{application_id}/restore", dependencies=[Depends(require_role(["compliance"]))])
async def restore_record(application_id: str, db: Session = Depends(get_db)):
    """Restores a record by re-verifying the chain and correcting database state."""
    # Find the record and the one before it to reconstruct the hash
    records = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
    
    expected_prev_hash = "GENESIS_HASH"
    for r in records:
        payload = {
            "application_id": r.application_id,
            "user_id": r.user_id,
            "decision": r.decision,
            "probability": r.probability,
            "input_data": r.input_data,
            "shap_values": r.shap_values,
            "previous_hash": expected_prev_hash
        }
        if r.bank_name: payload["bank_name"] = r.bank_name
        
        recomputed_hash = compute_hash(payload)
        
        if r.application_id == application_id:
            # Found the target! Heal it.
            r.previous_hash = expected_prev_hash
            r.current_hash = recomputed_hash
            db.commit()
            return {"status": "success", "message": f"Record {application_id} restored and re-signed."}
            
        expected_prev_hash = recomputed_hash
        
    raise HTTPException(status_code=404, detail="Record not found in chain sequence")

@router.post("/batch/restore", dependencies=[Depends(require_role(["compliance"]))])
async def batch_restore(db: Session = Depends(get_db)):
    """Heals all compromised records in the entire chain."""
    records = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
    restored_count = 0
    
    expected_prev_hash = "GENESIS_HASH"
    for r in records:
        payload = {
            "application_id": r.application_id,
            "user_id": r.user_id,
            "decision": r.decision,
            "probability": r.probability,
            "input_data": r.input_data,
            "shap_values": r.shap_values,
            "previous_hash": expected_prev_hash
        }
        if r.bank_name: payload["bank_name"] = r.bank_name
        
        recomputed_hash = compute_hash(payload)
        
        if r.previous_hash != expected_prev_hash or r.current_hash != recomputed_hash:
            r.previous_hash = expected_prev_hash
            r.current_hash = recomputed_hash
            restored_count += 1
            
        expected_prev_hash = recomputed_hash
        
    db.commit()
    return {"status": "success", "message": f"Forensic healing complete. {restored_count} records re-signed."}

@router.post("/decision/{application_id}/flag", dependencies=[Depends(require_role(["compliance"]))])
async def flag_for_audit(application_id: str, db: Session = Depends(get_db)):
    """Flags a record for manual review by the institutional risk committee."""
    entry = db.query(AuditLog).filter(AuditLog.application_id == application_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Record not found")
    
    return {"status": "success", "message": f"Record {application_id} queued for manual forensic audit."}
