import sqlite3
import json

db_path = r"d:\Credifi\backend\credifi.db"

def dump_samples():
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("--- TABLE: audit_log ---")
    cursor.execute("SELECT * FROM audit_log LIMIT 2")
    for row in cursor.fetchall():
        d = dict(row)
        # Truncate long strings for readability
        if 'input_data' in d: d['input_data'] = str(d['input_data'])[:50] + "..."
        if 'shap_values' in d: d['shap_values'] = str(d['shap_values'])[:50] + "..."
        if 'current_hash' in d: d['current_hash'] = d['current_hash'][:16] + "..."
        print(json.dumps(d, indent=2))
        
    print("\n--- TABLE: remediation_requests ---")
    cursor.execute("SELECT * FROM remediation_requests LIMIT 2")
    for row in cursor.fetchall():
        print(json.dumps(dict(row), indent=2))
        
    conn.close()

if __name__ == "__main__":
    dump_samples()
