from __future__ import annotations
from datetime import datetime
from sqlalchemy import JSON, Float, ForeignKey, Integer, String, DateTime, create_engine, Index, event
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
import os

# Support PostgreSQL migration via environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./credifi.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    future=True,
    pool_pre_ping=True # Robustness for long-running connections
)

# Optimization: Enable WAL mode for SQLite to improve concurrency
if "sqlite" in DATABASE_URL:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False) # applicant, compliance, regulator

class AuditLog(Base):
    __tablename__ = "audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    application_id: Mapped[str] = mapped_column(String(50), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    decision: Mapped[str] = mapped_column(String(20), nullable=False)
    probability: Mapped[float] = mapped_column(Float, nullable=False)
    input_data: Mapped[dict] = mapped_column(JSON, nullable=False)
    shap_values: Mapped[dict] = mapped_column(JSON, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    previous_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    current_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    bank_name: Mapped[str] = mapped_column(String(100), nullable=True)

class RemediationRequest(Base):
    __tablename__ = "remediation_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    attribute: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. income, gender
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending") # pending, approved, applied
    lodged_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    resolved_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    compliance_notes: Mapped[str] = mapped_column(String(500), nullable=True)

# High-performance composite indexes for forensic retrieval
Index('idx_user_audit_time', AuditLog.user_id, AuditLog.timestamp)
Index('idx_app_id_lookup', AuditLog.application_id)
Index('idx_timestamp_desc', AuditLog.timestamp.desc())

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
