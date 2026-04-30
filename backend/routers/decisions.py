from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import uuid

from models.db import User, get_db
from routers.auth import require_role, get_current_user
from core.model import predict_default
from core.audit_chain import append_audit_log
from schemas.decisions import CreditApplication, DecisionResult

router = APIRouter()

def format_decision_result(prediction: dict, app_id: str, bank_name: str | None = None, input_data: dict | None = None) -> dict:
    feature_meta = {
        "income": {"name": "annual income", "is_currency": True},
        "age": {"name": "age", "is_currency": False},
        "loan_amount": {"name": "loan amount", "is_currency": True},
        "debt_to_income_ratio": {"name": "debt ratio", "is_currency": False},
        "credit_score": {"name": "credit score", "is_currency": False},
        "missed_payments": {"name": "missed payments", "is_currency": False},
        "employment_years": {"name": "employment duration", "is_currency": False}
    }

    explanations = []
    top_factors = prediction.get("top_factors", [])
    shap_vals = prediction.get("explanations", {})
    decision = prediction["decision"]

    for factor in top_factors:
        val = shap_vals.get(factor, 0)
        input_val = input_data.get(factor, "N/A") if input_data else "N/A"
        
        # Format input value
        meta = feature_meta.get(factor, {"name": factor, "is_currency": False})
        if meta["is_currency"] and isinstance(input_val, (int, float)):
            formatted_val = f"${input_val:,.0f}"
        else:
            formatted_val = str(input_val)
            
        direction = "approval" if val < 0 else "rejection"
        magnitude = abs(val)
        
        if val < 0:
            qualifier = "this bolstered your profile" if magnitude > 0.5 else "this is well within the safe range"
        else:
            qualifier = "this was a primary driver for risk" if magnitude > 0.5 else "this was a minor risk factor"
            
        explanations.append(
            f"Your {meta['name']} of {formatted_val} contributed +{magnitude:.2f} toward {direction} — {qualifier}."
        )

    suggestions = []
    if decision == 'reject':
        if "debt_to_income_ratio" in top_factors and shap_vals.get("debt_to_income_ratio", 0) > 0:
            suggestions.append("Your debt ratio is high relative to the requested amount. Lowering existing debt could help.")
        if "credit_score" in top_factors and shap_vals.get("credit_score", 0) > 0:
            suggestions.append("Your credit score is below the threshold for this institution. Consider a credit-builder program.")
        if "missed_payments" in top_factors and shap_vals.get("missed_payments", 0) > 0:
            suggestions.append("Recent missed payments are impacting your reliability score. Maintain on-time payments for 6 months.")
        if "employment_years" in top_factors and shap_vals.get("employment_years", 0) > 0:
            suggestions.append("Institutional policy favors longer employment stability. Re-apply after reaching 2+ years.")
        
        if not suggestions:
            suggestions.append("Review your financial profile for any inaccuracies before your next attempt.")
    else:
        suggestions.append("Maintain your current financial habits to ensure continued eligibility.")
        suggestions.append("Consider setting up auto-pay to preserve your excellent payment history.")

    return {
        "decision": decision,
        "probability": round(prediction["probability"], 4),
        "application_id": app_id,
        "top_factors": top_factors,
        "explanation": explanations[:3],
        "suggestions": suggestions[:3],
        "bank_name": bank_name or "Global Trust Bank",
        "input_data": input_data,
        "shap_values": shap_vals
    }

@router.post("/apply", response_model=DecisionResult, dependencies=[Depends(require_role(["applicant"]))])
async def apply_for_credit(
    application: CreditApplication, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict[str, Any]:
    # 1. Run inference
    prediction = predict_default(application.dict())
    app_id = str(uuid.uuid4())[:18]

    # 2. Append to audit log
    append_audit_log(
        db=db,
        user_id=current_user.id,
        application_id=app_id,
        decision=prediction["decision"],
        probability=prediction["probability"],
        input_data=application.dict(),
        shap_values=prediction.get("explanations", {}),
        bank_name=application.bank_name
    )

    return format_decision_result(prediction, app_id, application.bank_name, application.dict())

@router.get("/history", dependencies=[Depends(require_role(["applicant"]))])
async def get_application_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from models.db import AuditLog
    records = db.query(AuditLog).filter(AuditLog.user_id == current_user.id).order_by(AuditLog.timestamp.desc()).all()
    return records

@router.get("/history/{application_id}", response_model=DecisionResult, dependencies=[Depends(require_role(["applicant"]))])
async def get_history_detail(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from models.db import AuditLog
    record = db.query(AuditLog).filter(
        AuditLog.application_id == application_id,
        AuditLog.user_id == current_user.id
    ).first()
    
    if not record:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Reconstruct prediction-like dict for formatter
    # Sort SHAP values to identify top factors
    sorted_factors = sorted(
        record.shap_values.items(), 
        key=lambda x: abs(x[1]), 
        reverse=True
    )
    
    prediction = {
        "decision": record.decision,
        "probability": record.probability,
        "top_factors": [f[0] for f in sorted_factors[:5]],
        "explanations": record.shap_values
    }
    
    return format_decision_result(prediction, record.application_id, record.bank_name, record.input_data)

@router.get("/context/{application_id}", dependencies=[Depends(require_role(["applicant"]))])
async def get_risk_context(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from models.db import AuditLog
    # 1. Fetch current application
    current_record = db.query(AuditLog).filter(
        AuditLog.application_id == application_id,
        AuditLog.user_id == current_user.id
    ).first()
    
    if not current_record:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Application not found")
    
    # 2. Fetch all historical probabilities for comparison
    all_probs = [r[0] for r in db.query(AuditLog.probability).all()]
    
    if not all_probs:
        return {"percentile": 0, "total_comparison": 0}
        
    # 3. Calculate percentile (how many have HIGHER risk than me?)
    # Risk is higher when probability is higher.
    # "Better than X%" means X% of people have higher risk (higher probability).
    better_than = [p for p in all_probs if p > current_record.probability]
    percentile = (len(better_than) / len(all_probs)) * 100
    
    return {
        "percentile": round(percentile, 1),
        "total_comparison": len(all_probs),
        "risk_score": round(current_record.probability * 100, 1),
        "status": "Elite" if percentile > 90 else ("Strong" if percentile > 70 else "Developing")
    }
