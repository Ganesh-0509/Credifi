from __future__ import annotations
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.db import Base, engine
from routers import auth, decisions, audit, regulator

from contextlib import asynccontextmanager
from core.tasks import start_background_tasks

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background tasks
    start_background_tasks()
    yield

app = FastAPI(
    title="Credifi AI Engine",
    version="2.0.0",
    lifespan=lifespan
)

_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
]

_allow_all = os.getenv("CORS_ALLOW_ALL", "0") == "1"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _allow_all else _CORS_ORIGINS,
    allow_credentials=not _allow_all,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(decisions.router, prefix="/decisions", tags=["Decisions"])
app.include_router(audit.router, prefix="/audit", tags=["Compliance"])
app.include_router(regulator.router, prefix="/regulator", tags=["Regulatory"])

@app.on_event("startup")
def startup_db() -> None:
    Base.metadata.create_all(bind=engine)

@app.get("/health/integrity")
async def get_integrity_status():
    from core.tasks import SYSTEM_INTEGRITY_STATUS
    return SYSTEM_INTEGRITY_STATUS

@app.get("/health")
async def health_check():
    return {"status": "ok", "system": "Credifi AI"}
