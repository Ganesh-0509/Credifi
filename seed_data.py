import httpx
import json
import time

BASE_URL = "http://127.0.0.1:8005"

def seed_system():
    print("Seeding Credifi System...")
    
    # 1. Register Users
    users = [
        {"username": "applicant_test", "email": "app@test.com", "password": "password123", "role": "applicant"},
        {"username": "compliance_test", "email": "comp@test.com", "password": "password123", "role": "compliance"},
        {"username": "regulator_test", "email": "reg@test.com", "password": "password123", "role": "regulator"}
    ]
    
    for user in users:
        try:
            headers = {"X-Admin-Key": "CREDIFI_MASTER_KEY_2026"}
            r = httpx.post(f"{BASE_URL}/auth/register", json=user, headers=headers)
            print(f"Registered {user['username']}: {r.status_code}")
        except Exception as e:
            print(f"Failed to register {user['username']}: {e}")

    # 2. Login as Applicant to get token
    try:
        r = httpx.post(f"{BASE_URL}/auth/login", data={"username": "applicant_test", "password": "password123"})
        token = r.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 3. Submit 5 Applications
        apps = [
            {"income": 60000, "age": 35, "loan_amount": 20000, "debt_to_income_ratio": 0.25, "credit_score": 720, "missed_payments": 0, "employment_years": 8},
            {"income": 30000, "age": 22, "loan_amount": 15000, "debt_to_income_ratio": 0.45, "credit_score": 580, "missed_payments": 1, "employment_years": 1},
            {"income": 120000, "age": 45, "loan_amount": 50000, "debt_to_income_ratio": 0.15, "credit_score": 810, "missed_payments": 0, "employment_years": 15},
            {"income": 45000, "age": 30, "loan_amount": 10000, "debt_to_income_ratio": 0.35, "credit_score": 650, "missed_payments": 0, "employment_years": 4},
            {"income": 25000, "age": 28, "loan_amount": 5000, "debt_to_income_ratio": 0.55, "credit_score": 520, "missed_payments": 2, "employment_years": 2}
        ]
        
        for app in apps:
            r = httpx.post(f"{BASE_URL}/decisions/apply", json=app, headers=headers)
            print(f"Submitted app: {r.status_code} - Result: {r.json().get('decision')}")
            time.sleep(0.5) # ensure different timestamps
            
    except Exception as e:
        print(f"Failed to submit applications: {e}")

if __name__ == "__main__":
    seed_system()
