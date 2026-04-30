from pydantic import BaseModel

class CreditApplication(BaseModel):
    income: float
    age: int
    loan_amount: float
    debt_to_income_ratio: float
    credit_score: int
    missed_payments: int
    employment_years: int
    bank_name: str | None = None
    gender: str | None = "Not Specified"
    geography: str | None = "Global"

class DecisionResult(BaseModel):
    decision: str
    probability: float
    application_id: str
    top_factors: list[str]
    explanation: list[str]
    suggestions: list[str]
    bank_name: str | None = None
    input_data: dict | None = None
    shap_values: dict | None = None
    ai_narrative: str | None = None
