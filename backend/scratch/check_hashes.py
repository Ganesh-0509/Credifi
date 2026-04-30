import sys
sys.path.append('.')
from models.db import AuditLog, SessionLocal
from core.audit_chain import compute_hash

db = SessionLocal()
records = db.query(AuditLog).order_by(AuditLog.id.asc()).all()

print(f"Total records: {len(records)}")
expected_prev = "GENESIS_HASH"
for r in records:
    payload = {
        "application_id": r.application_id,
        "user_id": r.user_id,
        "decision": r.decision,
        "probability": r.probability,
        "input_data": r.input_data,
        "shap_values": r.shap_values,
        "previous_hash": r.previous_hash
    }
    if r.bank_name: payload["bank_name"] = r.bank_name
    recomputed = compute_hash(payload)
    
    print(f"ID: {r.application_id}")
    print(f"  Prev: {r.previous_hash[:12]} (Expected: {expected_prev[:12]})")
    print(f"  Curr: {r.current_hash[:12]} (Recomputed: {recomputed[:12]})")
    
    if r.previous_hash != expected_prev or r.current_hash != recomputed:
        print("  !!! COMPROMISED !!!")
    
    expected_prev = r.current_hash
