from __future__ import annotations

from typing import Any
import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fairlearn.metrics import demographic_parity_difference, equalized_odds_difference

from models.db import AuditLog, get_db
from .auth import require_role

router = APIRouter(tags=["regulator"])

@router.get("/fairness", dependencies=[Depends(require_role(["regulator"]))])
async def get_fairness_metrics(db: Session = Depends(get_db)):
    """Calculates Demographic Parity and Equalized Odds across income-based groups."""
    records = db.query(AuditLog).all()
    if not records:
        return {"message": "Insufficient data for fairness analysis"}
    
    data = []
    for r in records:
        row = r.input_data.copy()
        # The decision reached by the model
        row["y_pred"] = 1 if r.decision == "approve" else 0
        # For demonstration, we assume a "true" creditworthiness based on lower probability
        # In a real system, this would be actual repayment status
        row["y_true"] = 1 if r.probability < 0.4 else 0
        
        # Segment by income brackets as sensitive features
        income = row.get("income", 50000)
        if income < 40000:
            row["income_group"] = "Low Income (<40k)"
        elif income < 90000:
            row["income_group"] = "Middle Income (40k-90k)"
        else:
            row["income_group"] = "High Income (>90k)"
        
        data.append(row)
    
    df = pd.DataFrame(data)
    
    # Calculate fairness metrics
    dp_diff = demographic_parity_difference(
        y_true=df["y_true"], 
        y_pred=df["y_pred"], 
        sensitive_features=df["income_group"]
    )
    
    eo_diff = equalized_odds_difference(
        y_true=df["y_true"], 
        y_pred=df["y_pred"], 
        sensitive_features=df["income_group"]
    )
    
    # Approval rates per group
    group_approval = df.groupby("income_group")["y_pred"].mean().to_dict()
    
    return {
        "metrics": {
            "demographic_parity_difference": round(float(dp_diff), 4),
            "equalized_odds_difference": round(float(eo_diff), 4)
        },
        "group_breakdown": {k: f"{round(v*100, 2)}%" for k, v in group_approval.items()},
        "status": "Success"
    }

@router.get("/summary", dependencies=[Depends(require_role(["regulator"]))])
async def regulator_summary(db: Session = Depends(get_db)):
    """Provides a high-level summary of the decisioning system's performance."""
    records = db.query(AuditLog).all()
    if not records:
        return {"total_applications": 0, "status": "Empty"}
    
    total = len(records)
    approvals = sum(1 for r in records if r.decision == "approve")
    avg_prob = np.mean([r.probability for r in records])
    
    return {
        "total_applications": total,
        "approval_rate": round(approvals / total, 4),
        "rejection_rate": round((total - approvals) / total, 4),
        "average_risk_score": round(float(avg_prob), 4)
    }

@router.get("/drift", dependencies=[Depends(require_role(["regulator"]))])
async def detect_model_drift(db: Session = Depends(get_db)):
    """Compares recent decisions against historical baselines to detect drift."""
    all_records = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
    if len(all_records) < 50:
        return {"status": "Inconclusive", "reason": "Insufficient historical data (need 50+ records)"}
    
    # Split into baseline (first 70%) and current (last 30%)
    split_idx = int(len(all_records) * 0.7)
    baseline_probs = [r.probability for r in all_records[:split_idx]]
    current_probs = [r.probability for r in all_records[split_idx:]]
    
    baseline_mean = np.mean(baseline_probs)
    current_mean = np.mean(current_probs)
    
    drift_score = abs(current_mean - baseline_mean)
    drift_detected = drift_score > 0.05 # Threshold for significant drift
    
    return {
        "drift_detected": bool(drift_detected),
        "drift_score": round(float(drift_score), 4),
        "details": {
            "baseline_avg_risk": round(float(baseline_mean), 4),
            "current_avg_risk": round(float(current_mean), 4),
            "sample_sizes": {"baseline": len(baseline_probs), "current": len(current_probs)}
        }
    }

@router.get("/logs", dependencies=[Depends(require_role(["regulator"]))])
async def get_forensic_logs(db: Session = Depends(get_db)):
    """Returns the most recent 100 audit records for forensic analysis."""
    return db.query(AuditLog).order_by(AuditLog.id.desc()).limit(100).all()

@router.get("/report", dependencies=[Depends(require_role(["regulator"]))])
async def generate_compliance_report(db: Session = Depends(get_db)):
    """Generates an exportable JSON compliance report."""
    fairness = await get_fairness_metrics(db)
    summary = await regulator_summary(db)
    drift = await detect_model_drift(db)
    
    report = {
        "report_id": "REG-CR-" + pd.Timestamp.now().strftime("%Y%m%d%H%M"),
        "timestamp": pd.Timestamp.now().isoformat(),
        "summary": summary,
        "fairness_assessment": fairness,
        "model_integrity": drift,
        "regulator_scope": "Full Financial Audit"
    }
    
    return report
