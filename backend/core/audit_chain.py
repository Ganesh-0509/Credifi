from __future__ import annotations

import hashlib
import json
from sqlalchemy.orm import Session
from models.db import AuditLog

def compute_hash(record_data: dict) -> str:
    """Computes SHA-256 hash for a record dictionary with consistent serialization."""
    # sort_keys=True is critical for consistent hashing
    encoded_data = json.dumps(record_data, sort_keys=True).encode()
    return hashlib.sha256(encoded_data).hexdigest()

def get_last_hash(db: Session) -> str:
    """Fetches the current_hash of the most recent audit record."""
    last_record = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
    return last_record.current_hash if last_record else "GENESIS_HASH"

def append_audit_log(
    db: Session,
    user_id: int,
    application_id: str,
    decision: str,
    probability: float,
    input_data: dict,
    shap_values: dict,
    bank_name: str | None = None
) -> AuditLog:
    """Creates a new audit record and links it to the previous hash."""
    prev_hash = get_last_hash(db)
    
    # Define the immutable state for this entry
    payload = {
        "application_id": application_id,
        "user_id": user_id,
        "decision": decision,
        "probability": probability,
        "input_data": input_data,
        "shap_values": shap_values,
        "previous_hash": prev_hash,
    }
    if bank_name:
        payload["bank_name"] = bank_name
    
    # Link the current record to the previous one via hash
    curr_hash = compute_hash(payload)
    
    new_entry = AuditLog(
        application_id=application_id,
        user_id=user_id,
        decision=decision,
        probability=probability,
        input_data=input_data,
        shap_values=shap_values,
        previous_hash=prev_hash,
        current_hash=curr_hash,
        bank_name=bank_name
    )
    
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

def verify_chain(db: Session) -> dict:
    """Scans the entire audit log to detect any tampering or deletion."""
    records = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
    
    expected_prev_hash = "GENESIS_HASH"
    
    for record in records:
        # 1. Verify the link to the previous record
        if record.previous_hash != expected_prev_hash:
            return {
                "valid": False, 
                "error_at": record.id, 
                "reason": f"Chain link broken. Expected prev_hash {expected_prev_hash}, found {record.previous_hash}"
            }
        
        # 2. Re-verify the data integrity of the current record
        payload = {
            "application_id": record.application_id,
            "user_id": record.user_id,
            "decision": record.decision,
            "probability": record.probability,
            "input_data": record.input_data,
            "shap_values": record.shap_values,
            "previous_hash": record.previous_hash
        }
        if record.bank_name:
            payload["bank_name"] = record.bank_name
            
        recomputed_hash = compute_hash(payload)
        
        if record.current_hash != recomputed_hash:
            return {
                "valid": False, 
                "error_at": record.id, 
                "reason": "Content tampering detected. Hash mismatch."
            }
        
        # Advance the chain pointer
        expected_prev_hash = record.current_hash
        
    return {
        "valid": True, 
        "record_count": len(records),
        "integrity_status": "Secure"
    }
