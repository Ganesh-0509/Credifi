from __future__ import annotations

import hmac
import hashlib
import json
import os
from sqlalchemy.orm import Session
from models.db import AuditLog

# In production, this should be a robust environment variable
AUDIT_SECRET = os.getenv("AUDIT_SECRET", "credifi_forensic_master_key_2026").encode()

def compute_hash(record_data: dict) -> str:
    """Computes HMAC-SHA256 hash for a record dictionary with consistent serialization."""
    # sort_keys=True is critical for consistent hashing
    encoded_data = json.dumps(record_data, sort_keys=True).encode()
    return hmac.new(AUDIT_SECRET, encoded_data, hashlib.sha256).hexdigest()

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

class MerkleTree:
    """Implementation of a Merkle Tree for efficient partial proofs of audit log batches."""
    def __init__(self, data_list: list[str]):
        self.leaves = [hashlib.sha256(d.encode()).hexdigest() for d in data_list]
        self.tree = self._build_tree(self.leaves)

    def _build_tree(self, nodes: list[str]) -> list[list[str]]:
        tree = [nodes]
        while len(nodes) > 1:
            if len(nodes) % 2 != 0:
                nodes.append(nodes[-1])
            nodes = [hashlib.sha256((nodes[i] + nodes[i+1]).encode()).hexdigest() 
                     for i in range(0, len(nodes), 2)]
            tree.append(nodes)
        return tree

    def get_root(self) -> str:
        return self.tree[-1][0] if self.tree else ""

    def get_proof(self, index: int) -> list[dict]:
        proof = []
        for level in range(len(self.tree) - 1):
            is_right_child = index % 2
            sibling_index = index - 1 if is_right_child else index + 1
            if sibling_index < len(self.tree[level]):
                proof.append({
                    "position": "left" if is_right_child else "right",
                    "hash": self.tree[level][sibling_index]
                })
            index //= 2
        return proof

def verify_merkle_proof(leaf_hash: str, proof: list[dict], root: str) -> bool:
    """Verifies a Merkle proof against a known root hash."""
    current_hash = leaf_hash
    for p in proof:
        if p["position"] == "left":
            current_hash = hashlib.sha256((p["hash"] + current_hash).encode()).hexdigest()
        else:
            current_hash = hashlib.sha256((current_hash + p["hash"]).encode()).hexdigest()
    return current_hash == root

def verify_chain(db: Session) -> dict:
    """Scans the entire audit log to detect any tampering or deletion."""
    records = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
    
    if not records:
        return {"valid": True, "record_count": 0, "integrity_status": "Empty"}

    expected_prev_hash = "GENESIS_HASH"
    
    for record in records:
        # 1. Verify the link to the previous record
        if record.previous_hash != expected_prev_hash:
            return {
                "valid": False, 
                "error_at": record.id, 
                "application_id": record.application_id,
                "stored_hash": record.previous_hash,
                "expected_hash": expected_prev_hash,
                "timestamp": record.timestamp.isoformat(),
                "reason": f"Chain link broken. Expected prev_hash {expected_prev_hash[:12]}..., found {record.previous_hash[:12]}..."
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
                "application_id": record.application_id,
                "stored_hash": record.current_hash,
                "recomputed_hash": recomputed_hash,
                "timestamp": record.timestamp.isoformat(),
                "reason": "Content tampering detected. Payload hash mismatch."
            }
        
        # Advance the chain pointer
        expected_prev_hash = record.current_hash
        
    return {
        "valid": True, 
        "record_count": len(records),
        "integrity_status": "Secure",
        "merkle_root": MerkleTree([r.current_hash for r in records]).get_root()
    }
