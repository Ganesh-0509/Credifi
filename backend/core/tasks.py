import asyncio
import logging
from sqlalchemy.orm import Session
from models.db import SessionLocal
from core.audit_chain import verify_chain

logger = logging.getLogger("credifi.tasks")

# In-memory status for demonstration
# In production, this would be stored in Redis or a dedicated alerts table
SYSTEM_INTEGRITY_STATUS = {
    "last_check": None,
    "is_secure": True,
    "error_message": None
}

async def run_integrity_check():
    """Background task to periodically verify the cryptographic audit chain."""
    while True:
        try:
            logger.info("Starting scheduled integrity verification...")
            db = SessionLocal()
            try:
                result = verify_chain(db)
                SYSTEM_INTEGRITY_STATUS["last_check"] = asyncio.get_event_loop().time()
                SYSTEM_INTEGRITY_STATUS["is_secure"] = result["valid"]
                
                if not result["valid"]:
                    SYSTEM_INTEGRITY_STATUS["error_message"] = result.get("reason")
                    logger.error(f"INTEGRITY BREACH DETECTED: {result.get('reason')}")
                else:
                    SYSTEM_INTEGRITY_STATUS["error_message"] = None
                    logger.info("Integrity check passed. Audit chain is secure.")
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Integrity check failed to run: {e}")
            
        # Run every hour (3600 seconds)
        await asyncio.sleep(3600)

def start_background_tasks():
    """Initializes all background maintenance tasks."""
    loop = asyncio.get_event_loop()
    loop.create_task(run_integrity_check())
