import sys
import os
import uuid
import random
from datetime import datetime, timedelta

# Add parent dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models.db import SessionLocal, User, AuditLog
from auth.security import hash_password
from core.audit_chain import compute_hash

def seed_data():
    db = SessionLocal()
    try:
        # 1. Create Users if they don't exist
        roles = ['applicant', 'compliance', 'regulator']
        for role in roles:
            username = f"{role}_test"
            existing = db.query(User).filter(User.username == username).first()
            if not existing:
                user = User(
                    username=username,
                    email=f"{role}@credifi.ai",
                    hashed_password=hash_password("password123"),
                    role=role
                )
                db.add(user)
        db.commit()

        # 2. Add Audit Logs (Mock Decisions)
        applicant = db.query(User).filter(User.role == 'applicant').first()
        if not applicant: return

        banks = ["Global Trust Bank", "Vanguard Finance", "Zenith Credit", "Alpine Capital"]
        
        prev_hash = "0" * 64
        
        for i in range(100):
            app_id = str(uuid.uuid4())[:18]
            decision = random.choice(['approve', 'reject'])
            # Probability: approve usually < 0.5, reject usually > 0.5
            prob = random.uniform(0.1, 0.45) if decision == 'approve' else random.uniform(0.55, 0.9)
            
            # Simulated bias: Higher risk for lower income (demonstration)
            income = random.randint(20000, 150000)
            if income < 40000:
                prob += 0.1 # Increase risk
                if prob > 0.5: decision = 'reject'
            
            input_data = {
                "income": income,
                "age": random.randint(22, 65),
                "loan_amount": random.randint(5000, 50000),
                "debt_to_income_ratio": random.uniform(0.1, 0.6),
                "credit_score": random.randint(600, 850),
                "missed_payments": random.randint(0, 5),
                "employment_years": random.randint(1, 20),
                "bank_name": random.choice(banks)
            }
            
            shap_values = {
                "income": random.uniform(-0.1, 0.1),
                "credit_score": random.uniform(-0.2, 0.2),
                "loan_amount": random.uniform(-0.05, 0.05),
                "debt_to_income_ratio": random.uniform(-0.1, 0.1)
            }

            # Create entry
            entry_data = {
                "user_id": applicant.id,
                "application_id": app_id,
                "decision": decision,
                "probability": prob,
                "input_data": input_data,
                "shap_values": shap_values,
                "bank_name": input_data["bank_name"],
                "timestamp": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
                "previous_hash": prev_hash
            }
            
            curr_hash = compute_hash(entry_data)
            
            log = AuditLog(
                user_id=applicant.id,
                application_id=app_id,
                decision=decision,
                probability=prob,
                input_data=input_data,
                shap_values=shap_values,
                bank_name=input_data["bank_name"],
                previous_hash=prev_hash,
                current_hash=curr_hash
            )
            db.add(log)
            db.commit()
            prev_hash = curr_hash

        print("Seeding complete: Created test users and 100 audit records.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
