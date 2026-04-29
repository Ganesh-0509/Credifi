from __future__ import annotations

import os
import joblib
import numpy as np
import pandas as pd
import shap
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split

# Path to persist the model
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "xgb_model.pkl")

# Feature set for the credit model
FEATURES = [
    "income", 
    "age", 
    "loan_amount", 
    "debt_to_income_ratio", 
    "credit_score", 
    "missed_payments", 
    "employment_years"
]

def generate_synthetic_data(n_samples: int = 5000) -> pd.DataFrame:
    """Generates a synthetic dataset for training the credit model."""
    np.random.seed(42)
    
    income = np.random.normal(55000, 18000, n_samples).clip(20000, 250000)
    age = np.random.randint(18, 75, n_samples)
    loan_amount = np.random.normal(18000, 12000, n_samples).clip(500, 150000)
    debt_to_income_ratio = np.random.uniform(0.05, 0.7, n_samples)
    credit_score = np.random.randint(300, 850, n_samples)
    missed_payments = np.random.choice([0, 1], n_samples, p=[0.85, 0.15])
    employment_years = np.random.randint(0, 45, n_samples)
    
    # Heuristic-based target generation (default probability)
    # Higher risk: low credit score, high DTI, missed payments, low employment years
    logit = (
        -0.006 * credit_score + 
        6.0 * debt_to_income_ratio + 
        2.5 * missed_payments - 
        0.08 * employment_years + 
        0.00002 * loan_amount - 
        0.00001 * income + 
        1.5
    )
    prob = 1 / (1 + np.exp(-logit))
    default = (np.random.rand(n_samples) < prob).astype(int)
    
    return pd.DataFrame({
        "income": income,
        "age": age,
        "loan_amount": loan_amount,
        "debt_to_income_ratio": debt_to_income_ratio,
        "credit_score": credit_score,
        "missed_payments": missed_payments,
        "employment_years": employment_years,
        "default": default
    })

# Global model and explainer instances
_model: XGBClassifier | None = None
_explainer: shap.TreeExplainer | None = None

def get_model() -> XGBClassifier:
    """Loads the model from disk or trains a new one if not found."""
    global _model, _explainer
    if _model is not None:
        return _model
    
    if os.path.exists(MODEL_PATH):
        print(f"Loading existing XGBoost model from {MODEL_PATH}")
        _model = joblib.load(MODEL_PATH)
    else:
        print("XGBoost model not found. Training new model...")
        df = generate_synthetic_data()
        X = df[FEATURES]
        y = df["default"]
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Initialize and train XGBoost
        _model = XGBClassifier(
            n_estimators=150,
            max_depth=6,
            learning_rate=0.05,
            objective="binary:logistic",
            random_state=42
        )
        _model.fit(X_train, y_train)
        
        # Save model
        os.makedirs(MODEL_DIR, exist_ok=True)
        joblib.dump(_model, MODEL_PATH)
        print(f"New XGBoost model trained and saved to {MODEL_PATH}")
    
    # Initialize SHAP explainer
    _explainer = shap.TreeExplainer(_model)
    return _model

def get_shap_explanations(input_data: dict) -> dict:
    """Calculates SHAP values for the given input."""
    global _explainer
    if _explainer is None:
        get_model()
    
    row = [float(input_data[f]) for f in FEATURES]
    X = np.array([row])
    
    # Generate SHAP values
    shap_values = _explainer.shap_values(X)
    
    # Handle possible multi-class list output from older SHAP/XGBoost versions
    if isinstance(shap_values, list):
        shap_values = shap_values[1]
        
    contributions = dict(zip(FEATURES, shap_values[0].tolist()))
    
    # Identify top factors
    sorted_factors = sorted(
        contributions.items(), 
        key=lambda x: abs(x[1]), 
        reverse=True
    )
    
    return {
        "contributions": contributions,
        "top_factors": [f[0] for f in sorted_factors[:3]]
    }

def predict_default(input_data: dict) -> dict:
    """Predicts default probability and returns a decision."""
    model = get_model()
    
    # Prepare input vector in correct order
    try:
        row = [float(input_data[f]) for f in FEATURES]
        X = np.array([row])
        
        # Predict probability of class 1 (default)
        prob = float(model.predict_proba(X)[0][1])
        decision = "reject" if prob > 0.5 else "approve"
        
        # Get SHAP explanations
        explanations = get_shap_explanations(input_data)
        
        print(f"DEBUG: Prediction probability = {prob:.4f} | Decision = {decision}")
        print(f"DEBUG: SHAP Contributions = {explanations['contributions']}")
        
        return {
            "probability": prob,
            "decision": decision,
            "risk_level": "High" if prob > 0.7 else "Medium" if prob > 0.3 else "Low",
            "explanations": explanations["contributions"],
            "top_factors": explanations["top_factors"]
        }
    except Exception as e:
        print(f"ERROR in prediction: {e}")
        return {
            "error": str(e),
            "decision": "error"
        }

# Pre-load/train model on initialization
get_model()
