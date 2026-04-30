from __future__ import annotations
from datetime import datetime, timedelta

from typing import Any
import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fairlearn.metrics import (
    demographic_parity_difference, 
    equalized_odds_difference,
    false_positive_rate_difference,
    true_positive_rate_difference
)

from models.db import AuditLog, get_db
from .auth import require_role

router = APIRouter(tags=["regulator"])

@router.get("/compliance/summary", dependencies=[Depends(require_role(["regulator"]))])
async def get_compliance_summary(db: Session = Depends(get_db)):
    """Provides a consolidated 4/5ths rule compliance report for all attributes."""
    dimensions = ["income", "gender", "age", "geography"]
    records = db.query(AuditLog).all()
    if not records:
        return []
    
    summary = []
    for dim in dimensions:
        data = []
        for r in records:
            row = r.input_data.copy()
            row["y_pred"] = 1 if r.decision == "approve" else 0
            
            if dim == "income":
                income = row.get("income", 50000)
                row["sensitive_group"] = "Low (<40k)" if income < 40000 else ("Mid (40-90k)" if income < 90000 else "High (>90k)")
            elif dim == "gender":
                row["sensitive_group"] = row.get("gender", "Not Specified")
            elif dim == "age":
                age = row.get("age", 35)
                row["sensitive_group"] = "Under 25" if age < 25 else ("25-45" if age < 45 else ("45-65" if age < 65 else "Over 65"))
            elif dim == "geography":
                row["sensitive_group"] = row.get("geography", "Global")
            else:
                row["sensitive_group"] = "General"
            data.append(row)
        
        df = pd.DataFrame(data)
        group_approval = df.groupby("sensitive_group")["y_pred"].mean().to_dict()
        if not group_approval: continue
        
        max_group = max(group_approval, key=group_approval.get)
        min_group = min(group_approval, key=group_approval.get)
        max_rate = group_approval[max_group]
        min_rate = group_approval[min_group]
        ratio = min_rate / max_rate if max_rate > 0 else 1
        
        summary.append({
            "attribute": dim.capitalize(),
            "highest_group": max_group,
            "highest_rate": round(max_rate, 4),
            "lowest_group": min_group,
            "lowest_rate": round(min_rate, 4),
            "ratio": round(ratio, 4),
            "status": "PASS" if ratio >= 0.8 else "VIOLATION"
        })
    return summary

@router.get("/fairness", dependencies=[Depends(require_role(["regulator"]))])
async def get_fairness_metrics(dimension: str = "income", db: Session = Depends(get_db)):
    """Calculates Demographic Parity and Equalized Odds across multiple dimensions."""
    records = db.query(AuditLog).all()
    if not records:
        return {"message": "Insufficient data for fairness analysis"}
    
    data = []
    for r in records:
        row = r.input_data.copy()
        row["y_pred"] = 1 if r.decision == "approve" else 0
        row["y_true"] = 1 if r.probability < 0.4 else 0
        
        # Mapping dimension to sensitive features
        if dimension == "income":
            income = row.get("income", 50000)
            if income < 40000:
                row["sensitive_group"] = "Low (<40k)"
            elif income < 90000:
                row["sensitive_group"] = "Mid (40-90k)"
            else:
                row["sensitive_group"] = "High (>90k)"
        elif dimension == "gender":
            row["sensitive_group"] = row.get("gender", "Not Specified")
        elif dimension == "age":
            age = row.get("age", 35)
            if age < 25:
                row["sensitive_group"] = "Under 25"
            elif age < 45:
                row["sensitive_group"] = "25-45"
            elif age < 65:
                row["sensitive_group"] = "45-65"
            else:
                row["sensitive_group"] = "Over 65"
        elif dimension == "geography":
            row["sensitive_group"] = row.get("geography", "Global")
        else:
            row["sensitive_group"] = "General"
            
        data.append(row)
    
    df = pd.DataFrame(data)
    
    # Calculate fairness metrics
    dp_diff = demographic_parity_difference(
        y_true=df["y_true"], 
        y_pred=df["y_pred"], 
        sensitive_features=df["sensitive_group"]
    )
    
    eo_diff = equalized_odds_difference(
        y_true=df["y_true"], 
        y_pred=df["y_pred"], 
        sensitive_features=df["sensitive_group"]
    )

    fpr_diff = false_positive_rate_difference(
        y_true=df["y_true"], 
        y_pred=df["y_pred"], 
        sensitive_features=df["sensitive_group"]
    )

    tpr_diff = true_positive_rate_difference(
        y_true=df["y_true"], 
        y_pred=df["y_pred"], 
        sensitive_features=df["sensitive_group"]
    )
    
    # Approval rates per group
    group_approval = df.groupby("sensitive_group")["y_pred"].mean().to_dict()
    
    # Calculate Disparate Impact (4/5ths rule)
    max_rate = max(group_approval.values()) if group_approval else 1
    impact_ratios = {k: (v / max_rate if max_rate > 0 else 0) for k, v in group_approval.items()}
    failed_45ths = any(v < 0.8 for v in impact_ratios.values())

    return {
        "metrics": {
            "demographic_parity_difference": round(float(dp_diff), 4),
            "equalized_odds_difference": round(float(eo_diff), 4),
            "false_positive_rate_difference": round(float(fpr_diff), 4),
            "true_positive_rate_difference": round(float(tpr_diff), 4),
            "disparate_impact_failed": failed_45ths,
            "impact_ratios": {k: round(v, 4) for k, v in impact_ratios.items()}
        },
        "group_breakdown": {k: f"{round(v*100, 2)}%" for k, v in group_approval.items()},
        "dimension": dimension,
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

def calculate_psi(expected: list, actual: list, bins: int = 10):
    """Calculates the Population Stability Index between two distributions."""
    try:
        e_arr = np.array(expected)
        a_arr = np.array(actual)
        
        # Define shared bins across both distributions
        min_val = min(e_arr.min(), a_arr.min())
        max_val = max(e_arr.max(), a_arr.max())
        if min_val == max_val: return 0
        
        e_hist, _ = np.histogram(e_arr, bins=bins, range=(min_val, max_val))
        a_hist, _ = np.histogram(a_arr, bins=bins, range=(min_val, max_val))
        
        e_percents = e_hist / len(e_arr)
        a_percents = a_hist / len(a_arr)
        
        # Laplace smoothing to avoid division by zero or log(0)
        e_percents = np.clip(e_percents, 1e-4, None)
        a_percents = np.clip(a_percents, 1e-4, None)
        
        psi = np.sum((a_percents - e_percents) * np.log(a_percents / e_percents))
        return psi
    except Exception:
        return 0

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
    
    # Feature Drift Analysis (PSI)
    feature_psi = {}
    baseline_inputs = [r.input_data for r in all_records[:split_idx]]
    current_inputs = [r.input_data for r in all_records[split_idx:]]
    
    if baseline_inputs and current_inputs:
        features = list(baseline_inputs[0].keys())
        for f in features:
            b_vals = [i.get(f) for i in baseline_inputs if isinstance(i.get(f), (int, float))]
            c_vals = [i.get(f) for i in current_inputs if isinstance(i.get(f), (int, float))]
            
            if len(b_vals) > 10 and len(c_vals) > 10:
                psi_val = calculate_psi(b_vals, c_vals)
                feature_psi[f] = round(float(psi_val), 4)

    return {
        "drift_detected": bool(drift_detected),
        "drift_score": round(float(drift_score), 4),
        "detected_at": datetime.utcnow().isoformat(),
        "details": {
            "baseline_avg_risk": round(float(baseline_mean), 4),
            "current_avg_risk": round(float(current_mean), 4),
            "approval_delta": round(float(current_mean - baseline_mean), 4),
            "feature_psi": feature_psi,
            "sample_sizes": {"baseline": len(baseline_probs), "current": len(current_probs)}
        },
        "recommended_action": "Recommend immediate retraining of the neural nodes" if drift_detected else "Maintain current model cycle"
    }

@router.get("/fairness/trend", dependencies=[Depends(require_role(["regulator"]))])
async def get_fairness_trend(dimension: str = "income", db: Session = Depends(get_db)):
    """Calculates rolling 7-day demographic parity gap trend."""
    records = db.query(AuditLog).order_by(AuditLog.timestamp.asc()).all()
    if not records:
        return []
    
    data = []
    for r in records:
        row = r.input_data.copy()
        row["y_pred"] = 1 if r.decision == "approve" else 0
        row["timestamp"] = r.timestamp
        
        if dimension == "income":
            income = row.get("income", 50000)
            row["group"] = "Low" if income < 40000 else ("Mid" if income < 90000 else "High")
        elif dimension == "gender":
            row["group"] = row.get("gender", "Not Specified")
        elif dimension == "age":
            age = row.get("age", 35)
            row["group"] = "Young" if age < 30 else ("Old" if age > 50 else "Mid")
        elif dimension == "geography":
            row["group"] = row.get("geography", "Global")
        else:
            row["group"] = "General"
        data.append(row)
    
    df = pd.DataFrame(data)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df.set_index("timestamp", inplace=True)
    
    days = df.index.normalize().unique()
    trend = []
    
    for day in days:
        start_date = day - timedelta(days=7)
        window_df = df[(df.index >= start_date) & (df.index <= day)]
        if window_df.empty: continue
        
        group_rates = window_df.groupby("group")["y_pred"].mean()
        gap = group_rates.max() - group_rates.min() if len(group_rates) >= 2 else 0
            
        trend.append({
            "date": day.strftime("%Y-%m-%d"),
            "gap": round(float(gap), 4)
        })
        
    return trend

@router.get("/logs", dependencies=[Depends(require_role(["regulator"]))])
async def get_forensic_logs(db: Session = Depends(get_db)):
    """Returns the most recent 100 audit records for forensic analysis."""
    return db.query(AuditLog).order_by(AuditLog.id.desc()).limit(100).all()

from fastapi.responses import StreamingResponse
from services.pdf_report import generate_regulator_pdf

@router.get("/report", dependencies=[Depends(require_role(["regulator"]))])
async def generate_compliance_report(db: Session = Depends(get_db)):
    """Generates an exportable PDF compliance report."""
    fairness = await get_fairness_metrics(db=db)
    summary = await regulator_summary(db=db)
    drift = await detect_model_drift(db=db)
    compliance = await get_compliance_summary(db=db)
    
    pdf_buffer = generate_regulator_pdf(fairness, summary, drift, compliance)
    
    filename = f"Credifi_Audit_Report_{datetime.now().strftime('%Y%m%d')}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/remediation/lodge", dependencies=[Depends(require_role(["regulator"]))])
async def lodge_remediation(attribute: str, description: str, db: Session = Depends(get_db)):
    """Lodges an official remediation order for the compliance team."""
    from models.db import RemediationRequest
    req = RemediationRequest(
        attribute=attribute,
        description=description,
        status="pending"
    )
    db.add(req)
    db.commit()
    return {"status": "success", "message": f"Remediation order for {attribute} lodged successfully."}
