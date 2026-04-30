import os
import google.generativeai as genai
import json

# Initialize Gemini
# The API key should be provided in the environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Using 'gemini-2.0-flash' as requested.
    # Fallback to gemini-pro if flash is not available in the current region/account
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
    except:
        model = genai.GenerativeModel('gemini-pro')
else:
    model = None

def analyze_ledger_anomaly(record: dict) -> dict:
    """Uses Gemini AI to perform forensic analysis on a tampered audit record."""
    if not model:
        return {
            "suspected_field": "unknown",
            "suggested_steps": [
                "API key missing. Manual audit required.",
                "Verify input_data integrity via bank shadow logs.",
                "Check for unauthorized database write operations in transaction history.",
                "Validate decision probability against the last known model weights."
            ],
            "ai_logic": "AI analysis skipped due to missing configuration."
        }

    prompt = f"""
    You are a high-level Forensic Audit AI for Credifi, a blockchain-backed credit scoring system.
    A record in the audit ledger has failed its cryptographic integrity check, indicating manual tampering in the database.
    
    CRITICAL RECORD DATA:
    {json.dumps(record, indent=2)}
    
    TASK:
    1. Analyze the internal consistency of the neural profile. (e.g. Does the DTI match the income/loan amount? Does the decision 'approve' make sense given the risk probability and SHAP values?)
    2. Identify the ONE field most likely to have been modified by a malicious actor.
    3. Provide 4 specific, actionable 'Suggested Steps' for a compliance officer to remediate this breach.
    
    RESPONSE FORMAT (JSON ONLY):
    {{
        "suspected_field": "name_of_field",
        "analysis_rationale": "short explanation of why this field looks tampered",
        "suggested_steps": ["Step 1", "Step 2", "Step 3", "Step 4"]
    }}
    """

    try:
        response = model.generate_content(prompt)
        # Extract JSON from the response text
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        return json.loads(text)
    except Exception as e:
        print(f"Gemini Analysis Error: {e}")
        return {
            "suspected_field": "undetermined",
            "suggested_steps": [
                "System error during AI scan. Refer to manual forensic protocols.",
                "Quarantine record ID " + record.get('application_id', 'Unknown'),
                "Check system logs for direct SQL injection or unauthorized access.",
                "Review audit chain genesis to identify the exact point of divergence."
            ]
        }

def generate_credit_narrative(record: dict) -> str:
    """Uses Gemini AI to generate a human-friendly narrative explaining the credit decision."""
    if not model:
        return "AI analysis unavailable. Please review the numerical factors below."

    prompt = f"""
    You are a professional financial advisor at Credifi. 
    Explain this credit decision to the applicant in a transparent, encouraging, and clear way.
    
    DECISION DATA:
    {json.dumps(record, indent=2)}
    
    GUIDELINES:
    1. Translate the SHAP values (feature contributions) into plain English (e.g. 'Your high income helped offset your debt ratio').
    2. Be honest about why they were approved or rejected.
    3. Provide exactly two sentences of encouragement or specific financial advice based on their data.
    4. Keep the total response under 100 words.
    5. Avoid technical jargon like 'SHAP' or 'Neural Node'. Use 'Forensic Scoring' instead.
    """

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini Narrative Error: {e}")
        return "Your profile was evaluated using our forensic scoring engine. Review your key factors for more details."
