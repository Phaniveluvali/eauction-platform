from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging
import uuid

from config import settings
from database import db
from services.marketing_service import marketing_service, MarketingService
from services.finance_service import finance_service, FinanceService
from services.concierge_service import concierge_service, ConciergeService

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ai_service")

# =========================================================================
# DEPENDENCY INVERSION PROVIDERS (FastAPI Depends)
# =========================================================================
def get_marketing_service() -> MarketingService:
    return marketing_service

def get_finance_service() -> FinanceService:
    return finance_service

def get_concierge_service() -> ConciergeService:
    return concierge_service

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
    title_en: Optional[str] = "Special Exclusive Promotion"
    title_ar: Optional[str] = "عرض حصري خاص"
    hook_en: Optional[str] = None
    hook_ar: Optional[str] = None
    body_en: Optional[str] = None
    body_ar: Optional[str] = None
    badge_en: Optional[str] = "⚡ LIMITED OFFER"
    badge_ar: Optional[str] = "⚡ عرض محدود"
    cta_label_en: Optional[str] = None
    cta_label_ar: Optional[str] = None
    cta_en: Optional[str] = None
    cta_ar: Optional[str] = None
    discount_code: Optional[str] = None
    discount_pct: Optional[int] = 50
    duration_hours: Optional[int] = 2
    duration_minutes: Optional[int] = None
    target_audience: Optional[str] = "ALL_ACTIVE_BUYERS"

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

# 2. Marketing & Live Broadcast Endpoints (DIP via Depends)
@app.post("/api/v1/ai/marketing/generate-promo")
async def generate_promo(
    req: PromoGenerateRequest,
    marketing: MarketingService = Depends(get_marketing_service)
):
    variants = await marketing.generate_campaign_variants(
        raw_intent=req.raw_intent,
        category=req.category or "ALL",
        discount_pct=req.discount_pct or 50,
        duration_hours=req.duration_hours or 2
    )
    return {"variants": variants}

@app.post("/api/v1/ai/marketing/broadcast")
async def broadcast_promo(
    req: PromoBroadcastRequest,
    marketing: MarketingService = Depends(get_marketing_service)
):
    data = req.model_dump()
    title_en = data.get("title_en") or "Special Exclusive Promotion"
    title_ar = data.get("title_ar") or "عرض حصري خاص"
    hook_en = data.get("hook_en") or data.get("body_en") or "Exclusive platform fee discount for active buyers."
    hook_ar = data.get("hook_ar") or data.get("body_ar") or "تخفيض حصري على الرسوم لجميع المشترين النشطين."
    badge_en = data.get("badge_en") or "⚡ LIMITED OFFER"
    badge_ar = data.get("badge_ar") or "⚡ عرض محدود"
    cta_label_en = data.get("cta_label_en") or data.get("cta_en") or "Bid Now"
    cta_label_ar = data.get("cta_label_ar") or data.get("cta_ar") or "زايد الآن"
    discount_pct = int(data.get("discount_pct") or 50)
    discount_code = data.get("discount_code") or f"FLASH{discount_pct}"
    duration_hours = int(data.get("duration_hours") or ((data.get("duration_minutes") or 120) // 60))
    campaign_id = data.get("campaign_id") or f"camp-{uuid.uuid4().hex[:8]}"

    normalized_campaign = {
        "campaign_id": campaign_id,
        "title_en": title_en,
        "title_ar": title_ar,
        "hook_en": hook_en,
        "hook_ar": hook_ar,
        "body_en": hook_en,
        "body_ar": hook_ar,
        "badge_en": badge_en,
        "badge_ar": badge_ar,
        "cta_label_en": cta_label_en,
        "cta_label_ar": cta_label_ar,
        "cta_en": cta_label_en,
        "cta_ar": cta_label_ar,
        "discount_code": discount_code,
        "discount_pct": discount_pct,
        "duration_hours": duration_hours,
        "target_audience": data.get("target_audience") or "ALL_ACTIVE_BUYERS"
    }
    result = await marketing.broadcast_campaign(normalized_campaign)
    return result

@app.get("/api/v1/ai/marketing/active-promo")
async def get_active_promo(
    marketing: MarketingService = Depends(get_marketing_service)
):
    active = await marketing.get_active_campaign()
    return {"active_promotion": active}

@app.post("/api/v1/ai/marketing/dismiss")
async def dismiss_promo(
    marketing: MarketingService = Depends(get_marketing_service)
):
    result = await marketing.dismiss_campaign()
    return result

# 3. Financial Ecosystem & Failed Transaction Endpoints (DIP via Depends)
@app.get("/api/v1/ai/finance/overview")
async def get_finance_overview(
    fiscal_year: int = 2026,
    finance: FinanceService = Depends(get_finance_service)
):
    data = await finance.get_financial_ecosystem_overview(fiscal_year=fiscal_year)
    return data

@app.get("/api/v1/ai/finance/failed-transactions")
async def get_failed_transactions(
    finance: FinanceService = Depends(get_finance_service)
):
    data = await finance.get_failed_transactions_intelligence()
    return data

@app.post("/api/v1/ai/finance/generate-boardroom-report")
async def generate_boardroom_report(
    finance: FinanceService = Depends(get_finance_service)
):
    report = await finance.generate_boardroom_report()
    return report

# 4. Universal Homepage AI Assistant (DIP via Depends)
@app.post("/api/v1/ai/concierge/chat")
async def concierge_chat(
    req: ConciergeChatRequest,
    concierge: ConciergeService = Depends(get_concierge_service)
):
    result = await concierge.chat(messages=req.messages, user_context=req.user_context)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=False)
