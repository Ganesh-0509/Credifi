import sqlite3

def tamper():
    conn = sqlite3.connect('credifi.db')
    cursor = conn.cursor()
    
    # Find the most recent record
    cursor.execute("SELECT id, application_id, current_hash FROM audit_log ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    
    if row:
        record_id, app_id, old_hash = row
        new_hash = "TAMPERED_" + old_hash[8:] # Modify the hash to cause a mismatch
        
        cursor.execute("UPDATE audit_log SET current_hash = ? WHERE id = ?", (new_hash, record_id))
        conn.commit()
        print(f"Forensic Tampering Successful: Application {app_id} (ID: {record_id}) hash modified.")
        print(f"Old Hash: {old_hash[:16]}...")
        print(f"New Hash: {new_hash[:16]}...")
    else:
        print("No records found to tamper.")
        
    conn.close()

if __name__ == "__main__":
    tamper()
