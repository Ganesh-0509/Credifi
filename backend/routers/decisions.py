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

def format_decision_result(prediction: dict, app_id: str, bank_name: str | None = None) -> dict:
    explanation_map = {
        "income": "Annual income",
        "age": "Age",
        "loan_amount": "Loan amount",
        "debt_to_income_ratio": "Debt ratio",
        "credit_score": "Credit score",
        "missed_payments": "Payment history",
        "employment_years": "Employment duration"
    }

    explanations = []
    top_factors = prediction.get("top_factors", [])
    shap_vals = prediction.get("explanations", {})
    decision = prediction["decision"]

    for factor in top_factors:
        val = shap_vals.get(factor, 0)
        # If decision is approve, positive SHAP helps. If reject, negative SHAP hurts.
        # Actually, SHAP usually means: positive = increases probability of default (bad), negative = decreases probability (good).
        # Our model: decision is based on probability.
        is_positive_influence = val < 0 # Decreases risk
        
        if decision == 'approve':
            if is_positive_influence:
                explanations.append(f"Strong {explanation_map.get(factor, factor)} significantly bolstered your profile.")
            else:
                explanations.append(f"{explanation_map.get(factor, factor)} was a minor risk factor but within limits.")
        else:
            if not is_positive_influence:
                explanations.append(f"Elevated {explanation_map.get(factor, factor)} was a primary driver for rejection.")
            else:
                explanations.append(f"Despite healthy {explanation_map.get(factor, factor)}, other factors outweighed it.")

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
        "bank_name": bank_name or "Global Trust Bank" # Standard fallback if missing
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

    return format_decision_result(prediction, app_id, application.bank_name)

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
    
    return format_decision_result(prediction, record.application_id, record.bank_name)
