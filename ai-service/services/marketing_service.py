import json
import logging
import uuid
import redis.asyncio as aioredis
from typing import Dict, Any, List, Optional
from config import settings
from services.ollama_client import ollama_client

logger = logging.getLogger(__name__)

class MarketingService:
    def __init__(self):
        self._redis_client = None

    async def get_redis(self):
        if not self._redis_client:
            self._redis_client = aioredis.from_url(
                f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}",
                decode_responses=True
            )
        return self._redis_client

    async def generate_campaign_variants(self, raw_intent: str, category: str = "ALL", discount_pct: int = 50, duration_hours: int = 2) -> List[Dict[str, Any]]:
        """Uses qwen2.5:7b-instruct to craft 3 bilingual (Arabic + English) marketing campaign variants."""
        system_prompt = (
            "You are an expert Chief Marketing Officer and Arabic/English copywriter for Al Wataneya Auctions, "
            "the premier automotive auction house in the UAE. "
            "Generate exactly 3 distinct promotional campaign variants (Urgent, VIP Exclusive, and Value Deal) based on the admin's intent. "
            "Respond ONLY with a valid JSON array of 3 objects without markdown backticks."
        )

        user_prompt = f"""
Admin Intent: "{raw_intent}"
Vehicle Category: {category}
Discount/Incentive: {discount_pct}%
Duration: {duration_hours} hours

Return a JSON array containing exactly 3 objects with the following schema:
[
  {{
    "variant_id": "urgent",
    "theme": "Urgent Flash Sale",
    "title_en": "...",
    "title_ar": "...",
    "hook_en": "...",
    "hook_ar": "...",
    "badge_en": "⚡ FLASH SALE",
    "badge_ar": "⚡ عرض خاطف",
    "cta_label_en": "Claim Discount & Bid",
    "cta_label_ar": "احصل على الخصم وشارك في المزاد",
    "discount_code": "FLASH{discount_pct}",
    "discount_pct": {discount_pct},
    "duration_hours": {duration_hours}
  }}
]
"""
        try:
            res = await ollama_client.generate(
                model=settings.MODEL_REASONING,
                prompt=user_prompt,
                system=system_prompt,
                format_json=True,
                timeout=35.0
            )
            raw_text = res.get("response", "[]").strip()
            # Clean possible markdown wrap
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            variants = json.loads(raw_text)
            if isinstance(variants, dict) and "variants" in variants:
                variants = variants["variants"]
            return variants
        except Exception as e:
            logger.warning(f"Ollama variant generation encountered an error: {e}. Falling back to rule-based bilingual templates.")
            return [
                {
                    "variant_id": "urgent",
                    "theme": "Urgent Flash Deal",
                    "title_en": f"⚡ Limited Time: {discount_pct}% Off Buyer Commission!",
                    "title_ar": f"⚡ لوقت محدود: خصم {discount_pct}% على عمولة المشتري!",
                    "hook_en": f"Place your winning bids today and save {discount_pct}% on platform fees before the clock runs out.",
                    "hook_ar": f"قدّم عروضك الفائزة اليوم ووفّر {discount_pct}% من الرسوم الإدارية قبل انتهاء الوقت.",
                    "badge_en": f"🔥 {discount_pct}% OFF",
                    "badge_ar": f"🔥 خصم {discount_pct}%",
                    "cta_label_en": "View Eligible Auctions",
                    "cta_label_ar": "تصفح المزادات المشمولة",
                    "discount_code": f"SAVE{discount_pct}",
                    "discount_pct": discount_pct,
                    "duration_hours": duration_hours
                },
                {
                    "variant_id": "vip",
                    "theme": "VIP Luxury Showcase",
                    "title_en": f"👑 Premium Deal: {discount_pct}% Buyer Fee Privilege",
                    "title_ar": f"👑 عرض النخبة: ميزة خصم {discount_pct}% على رسوم الشراء",
                    "hook_en": "Exclusive fee reduction on top-tier vehicle collections. Bid with maximum confidence.",
                    "hook_ar": "تخفيض حصري على الرسوم لمجموعات المركبات المتميزة. شارك بثقة تامة.",
                    "badge_en": "👑 VIP REWARD",
                    "badge_ar": "👑 امتياز النخبة",
                    "cta_label_en": "Explore VIP Fleet",
                    "cta_label_ar": "استكشف أسطول النخبة",
                    "discount_code": f"VIP{discount_pct}",
                    "discount_pct": discount_pct,
                    "duration_hours": duration_hours
                },
                {
                    "variant_id": "value",
                    "theme": "Value & Family Boost",
                    "title_en": f"🎉 Weekend Special: Save {discount_pct}% on Bidding Fees!",
                    "title_ar": f"🎉 عرض نهاية الأسبوع: وفّر {discount_pct}% من رسوم المزايدة!",
                    "hook_en": "Expand your garage with huge savings on commission across all active catalog lots.",
                    "hook_ar": "امتلك سيارتك القادمة مع توفير ضخم على الرسوم لجميع السيارات المتاحة.",
                    "badge_en": "🌟 SPECIAL OFFER",
                    "badge_ar": "🌟 عرض مميز",
                    "cta_label_en": "Start Bidding Now",
                    "cta_label_ar": "ابدأ المزايدة الآن",
                    "discount_code": f"AWA{discount_pct}",
                    "discount_pct": discount_pct,
                    "duration_hours": duration_hours
                }
            ]

    async def broadcast_campaign(self, campaign_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Broadcasts campaign live via Redis Pub/Sub and stores in active cache with TTL."""
        r = await self.get_redis()
        campaign_id = campaign_payload.get("campaign_id") or str(uuid.uuid4())
        campaign_payload["campaign_id"] = campaign_id
        campaign_payload["broadcast_at"] = str(uuid.uuid4())

        duration_hours = int(campaign_payload.get("duration_hours", 2))
        ttl_seconds = max(300, duration_hours * 3600)

        # 1. Save in active key with TTL
        await r.setex(
            "active_flash_promotion",
            ttl_seconds,
            json.dumps(campaign_payload)
        )

        # 2. Publish to Redis Pub/Sub channel
        await r.publish("broadcast:promotions", json.dumps(campaign_payload))
        logger.info(f"Broadcasted promotional campaign {campaign_id} via Redis Pub/Sub (TTL: {ttl_seconds}s)")

        return {
            "status": "SUCCESS",
            "campaign_id": campaign_id,
            "message": "Promotion successfully published to all active buyer screens",
            "ttl_seconds": ttl_seconds,
            "payload": campaign_payload
        }

    async def get_active_campaign(self) -> Optional[Dict[str, Any]]:
        """Retrieves currently active promotion from Redis cache."""
        try:
            r = await self.get_redis()
            data = await r.get("active_flash_promotion")
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.error(f"Error fetching active promotion from Redis: {e}")
            return None

    async def dismiss_campaign(self) -> Dict[str, Any]:
        """Admin can stop an active promotion early."""
        r = await self.get_redis()
        await r.delete("active_flash_promotion")
        await r.publish("broadcast:promotions", json.dumps({"action": "DISMISSED"}))
        return {"status": "DISMISSED"}

marketing_service = MarketingService()
