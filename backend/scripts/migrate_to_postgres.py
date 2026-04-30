import os
import sys
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

# Add parent dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models.db import Base, User, AuditLog

def migrate():
    sqlite_url = "sqlite:///./credifi.db"
    postgres_url = os.getenv("DATABASE_URL")
    
    if not postgres_url or "postgres" not in postgres_url:
        print("Error: DATABASE_URL environment variable must be set to a valid PostgreSQL connection string.")
        print("Example: export DATABASE_URL=postgresql://user:password@localhost:5432/credifi")
        return

    print(f"Starting migration from SQLite to PostgreSQL...")
    
    # 1. Setup engines and sessions
    sqlite_engine = create_engine(sqlite_url)
    SqliteSession = sessionmaker(bind=sqlite_engine)
    
    pg_engine = create_engine(postgres_url)
    PgSession = sessionmaker(bind=pg_engine)
    
    # 2. Create schema in PostgreSQL
    print("Creating schema in PostgreSQL...")
    Base.metadata.create_all(pg_engine)
    
    sqlite_session = SqliteSession()
    pg_session = PgSession()
    
    try:
        # 3. Migrate Users
        print("Migrating Users...")
        users = sqlite_session.query(User).all()
        for user in users:
            # Create a new instance to avoid state conflicts
            new_user = User(
                id=user.id,
                username=user.username,
                email=user.email,
                hashed_password=user.hashed_password,
                role=user.role
            )
            pg_session.merge(new_user)
        pg_session.commit()
        print(f"Successfully migrated {len(users)} users.")
        
        # 4. Migrate Audit Logs
        print("Migrating Audit Logs...")
        logs = sqlite_session.query(AuditLog).all()
        for log in logs:
            new_log = AuditLog(
                id=log.id,
                application_id=log.application_id,
                user_id=log.user_id,
                decision=log.decision,
                probability=log.probability,
                input_data=log.input_data,
                shap_values=log.shap_values,
                timestamp=log.timestamp,
                previous_hash=log.previous_hash,
                current_hash=log.current_hash,
                bank_name=log.bank_name
            )
            pg_session.merge(new_log)
        pg_session.commit()
        print(f"Successfully migrated {len(logs)} audit records.")
        
        print("\nMigration Complete! You can now switch to PostgreSQL by keeping DATABASE_URL set.")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        pg_session.rollback()
    finally:
        sqlite_session.close()
        pg_session.close()

if __name__ == "__main__":
    migrate()
