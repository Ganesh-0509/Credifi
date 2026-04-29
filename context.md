# Project Context: Credifi Decision Platform

Last updated: 2026-04-29

## 1) Project Overview & Objective

The **Credifi Decision Platform** is a specialized Enterprise SaaS ecosystem designed for financial institutions. Its primary goal is to provide a **secure, explainable, and auditable** framework for AI-driven credit decisions. It transforms the original general-purpose fairness toolkit into a domain-specific platform for banks and fintechs to manage credit risk while maintaining regulatory compliance.

**Core Mission:**
- **Financial Fairness**: Ensuring credit algorithms do not discriminate based on protected income groups or demographic proxies.
- **Explainable Decisions**: Providing applicants with human-readable reasons for credit outcomes using SHAP-based feature attribution.
- **Tamper-Evident Auditing**: Utilizing cryptographic hash chaining (SHA-256) to ensure every credit decision is immutable and verifiable.
- **Regulatory Transparency**: Giving national regulators real-time tools to monitor bias (Fairlearn), model drift, and system-level anomalies.

## 2) System Architecture & Security

The platform follows a modern FastAPI (Backend) and React 18 (Frontend) architecture, secured with JWT-based authentication and Role-Based Access Control (RBAC).

### Role-Based Access Control (RBAC)
- **Applicant**: Can apply for credit and view personalized explanations for their specific decision.
- **Compliance Officer**: Can inspect any decision, view raw SHAP values, and verify the integrity of the audit chain.
- **Regulator**: Can access system-wide fairness metrics, detect model drift, and generate compliance reports.

### Security Implementation
- **Authentication**: JWT tokens issued via `/auth/login`. Passwords hashed using `passlib` (bcrypt).
- **Authorization**: Granular route protection using FastAPI dependencies (`Depends(require_role([...]))`).

## 3) Database Schema (`backend/models/db.py`)

The platform utilizes an SQLite database (`credifi.db`) with an expanded schema to support security and auditing.

1. **`User`**: Manages platform identities.
   - `id`, `username`, `email`, `hashed_password`, `role`.
2. **`AuditLog`**: The tamper-evident ledger of all credit decisions.
   - `application_id`, `user_id`, `decision`, `probability`.
   - `input_data` (JSON): The raw features used for the prediction.
   - `shap_values` (JSON): The mathematical feature contributions.
   - `previous_hash`, `current_hash`: SHA-256 links establishing the audit chain.
3. **`Project` & `AuditRun`**: Legacy structures used for the initial batch fairness forensic sweeps.

## 4) Machine Learning & Explainability (`backend/core/`)

### Decision Engine (`backend/core/model.py`)
- **Model Type**: XGBoost (`XGBClassifier`) trained on a synthetic 5,000-sample credit dataset.
- **Persistence**: The model is persisted as `xgb_model.pkl`. On startup, the system automatically trains and saves a new model if the file is missing.
- **Inference**: Processes features (income, credit score, DTI, etc.) to produce a default probability and a binary decision (Approve/Reject).

### Explainability (SHAP)
- **Technique**: Model-agnostic explanations using `shap.TreeExplainer`.
- **Transparency**: For every decision, the system identifies the **top 3 factors** influencing the outcome.
- **Translation**: Technical SHAP values are translated into human-readable sentences (e.g., *"High debt-to-income ratio negatively impacted your score"*) for the end-user.

## 5) Forensic & Regulatory Tools

### Tamper-Evident Audit Chain (`backend/core/audit_chain.py`)
- **Hash Chaining**: Each new decision entry contains the hash of the preceding entry.
- **Integrity Verification**: Regulators and compliance officers can run a full scan (`GET /audit/chain/verify`) to ensure no records have been deleted or modified.

### Regulatory Monitoring (`backend/routers/regulator.py`)
- **Fairness Metrics**: Uses `fairlearn` to compute **Demographic Parity Difference** and **Equalized Odds Difference** across income brackets.
- **Drift Detection**: Compares the average probability of recent decisions against historical baselines to identify shifts in model behavior.
- **Anomaly Detection**: Flags decisions with probabilities more than 2 standard deviations away from the mean.

## 6) Data Flow (Production Path)

1. **Submission**: An **Applicant** submits a `CreditApplication` JSON to `POST /decisions/apply`.
2. **Prediction**: The backend runs the XGBoost model to get a default probability.
3. **Explanation**: The backend generates SHAP values and identifies the top 3 drivers.
4. **Auditing**: The system calculates the next hash in the chain and appends the full record to the `AuditLog`.
5. **Response**: The applicant receives their decision, a human-readable explanation, and actionable financial suggestions.

## 7) Technical Runbook

### Dependencies
The project requires several specialized Python and Node libraries:
- **Backend**: `fastapi`, `sqlalchemy`, `xgboost`, `shap`, `fairlearn`, `python-jose`, `passlib`.
- **Frontend**: `react`, `framer-motion`, `lucide-react`, `recharts`, `react-router-dom`.

### Local Execution
1. **Database Initialization**: Run `backend/migrate_db.py` or simply start the backend; SQLAlchemy will create the tables automatically.
2. **Backend**: `uvicorn main:app --reload` from the `backend/` directory.
3. **Frontend**: `npm run dev` from the `frontend/` directory.

## 8) Roadmap & Next Steps
1. **Dynamic Re-training**: Implement an automated feedback loop where actual loan outcomes (repaid/defaulted) are used to periodically re-train the XGBoost model.
2. **Blockchain Integration**: Move the audit chain's current hash from a local database to a public/private blockchain for immutable proof-of-existence.
3. **Regulatory Dashboard**: Expand the `Regulator` UI to visualize the drift and fairness metrics in real-time graphs.
