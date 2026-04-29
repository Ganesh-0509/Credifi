import sqlite3
import os

db_path = r"d:\Credifi\backend\credifi.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE audit_log ADD COLUMN bank_name VARCHAR(100);")
        conn.commit()
        print("Column bank_name added successfully.")
    except sqlite3.OperationalError as e:
        print(f"Error or already exists: {e}")
    finally:
        conn.close()
else:
    print(f"Database not found at {db_path}")
