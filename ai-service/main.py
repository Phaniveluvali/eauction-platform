from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging

from config import settings
from database import db
from services.marketing_service import marketing_service
from services.finance_service import finance_service
from services.concierge_service import concierge_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ai_service")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing eauction-ai-service microservice...")
    await db.connect()
    yield
    logger.info("Shutting down eauction-ai-service microservice...")
    await db.disconnect()

app = FastAPI(
    title=settings.SERVICE_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request / Response Schemas
class PromoGenerateRequest(BaseModel):
    raw_intent: str
    category: Optional[str] = "ALL"
    discount_pct: Optional[int] = 50
    duration_hours: Optional[int] = 2

class PromoBroadcastRequest(BaseModel):
    campaign_id: Optional[str] = None
    title_en: str
    title_ar: str
    hook_en: str
    hook_ar: str
    badge_en: str
    badge_ar: str
    cta_label_en: str
    cta_label_ar: str
    discount_code: str
    discount_pct: int
    duration_hours: int

class ConciergeChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    user_context: Optional[Dict[str, Any]] = None

# 1. Health & Readiness Probe
@app.get("/health")
@app.get("/api/v1/ai/health")
async def health_check():
    db_connected = db.pool is not None
    return {
        "status": "HEALTHY",
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "database_read_replica": "CONNECTED" if db_connected else "DISCONNECTED",
        "ollama_cluster": settings.OLLAMA_HOST,
        "models": {
            "reasoning": settings.MODEL_REASONING,
            "vision": settings.MODEL_VISION,
            "chat": settings.MODEL_CHAT
        }
    }

# 2. Marketing & Live Broadcast Endpoints
@app.post("/api/v1/ai/marketing/generate-promo")
async def generate_promo(req: PromoGenerateRequest):
    variants = await marketing_service.generate_campaign_variants(
        raw_intent=req.raw_intent,
        category=req.category or "ALL",
        discount_pct=req.discount_pct or 50,
        duration_hours=req.duration_hours or 2
    )
    return {"variants": variants}

@app.post("/api/v1/ai/marketing/broadcast")
async def broadcast_promo(req: PromoBroadcastRequest):
    result = await marketing_service.broadcast_campaign(req.model_dump())
    return result

@app.get("/api/v1/ai/marketing/active-promo")
async def get_active_promo():
    active = await marketing_service.get_active_campaign()
    return {"active_promotion": active}

@app.post("/api/v1/ai/marketing/dismiss")
async def dismiss_promo():
    result = await marketing_service.dismiss_campaign()
    return result

# 3. Financial Ecosystem & Failed Transaction Endpoints
@app.get("/api/v1/ai/finance/overview")
async def get_finance_overview(fiscal_year: int = 2026):
    data = await finance_service.get_financial_ecosystem_overview(fiscal_year=fiscal_year)
    return data

@app.get("/api/v1/ai/finance/failed-transactions")
async def get_failed_transactions():
    data = await finance_service.get_failed_transactions_intelligence()
    return data

@app.post("/api/v1/ai/finance/generate-boardroom-report")
async def generate_boardroom_report():
    report = await finance_service.generate_boardroom_report()
    return report

# 4. Universal Homepage AI Assistant
@app.post("/api/v1/ai/concierge/chat")
async def concierge_chat(req: ConciergeChatRequest):
    result = await concierge_service.chat(messages=req.messages, user_context=req.user_context)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=False)
