import json
import logging
from typing import Dict, Any, List, Optional
from config import settings
from database import db
from services.ollama_client import ollama_client

logger = logging.getLogger(__name__)

CONCIERGE_SYSTEM_PROMPT = """
You are the Al Wataneya Auctions AI Concierge (المساعد الذكي لمزاد الوطنية), the official 24/7 bilingual assistant for the premier UAE automotive auction house.

You serve both BUYERS and SELLERS with accuracy, courtesy, and local UAE automotive expertise.

PLATFORM FINANCIAL & OPERATIONAL RULES:
1. Bidding Power: Every AED 1 deposited unlocks AED 200 in live bidding limit (e.g., AED 5,000 deposit = AED 1,000,000 limit). Deposits are 100% refundable upon request.
2. Buyer Fees: 4% Buyer Premium (minimum AED 500, maximum AED 3,500) + 5% UAE VAT on commission only (not on hammer price) + AED 350 RTA ownership transfer document fee.
3. Seller Fees: Listing fee AED 450 + 2% success fee on cleared sale above reserve. Net proceeds paid within 48 hours via direct UAE bank wire.
4. Physical Branches: Sharjah Headquarters Yard, Dubai Al Aweer Terminal, Abu Dhabi Musaffah, and Ajman.
5. GCC Export: Full support for export to Saudi Arabia, Oman, Qatar, Bahrain, Kuwait with RTA export plates and customs clearing documentation.

GUIDELINES:
- Greet buyers warmly.
- If user writes in Arabic, respond in fluent, professional Arabic. If English, respond in English.
- If user asks for cost calculations, provide the exact itemized breakdown clearly.
- If user is a seller asking for valuation, give an estimated range and guide them to 'Sell Your Car'.
- Keep answers concise, actionable, and formatted with bullet points.
"""

class ConciergeService:
    async def chat(self, messages: List[Dict[str, str]], user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Conversational chat endpoint for homepage and marketplace visitors."""
        last_user_msg = messages[-1]["content"] if messages else ""

        # Check if buyer is asking for car recommendations
        embedded_cars = []
        lower_msg = last_user_msg.lower()
        if any(w in lower_msg for w in ["recommend", "find", "looking for", "suv", "sedan", "car", "buy", "under", "budget", "سيارة", "ابحث", "شراء"]):
            # Pull active matching vehicles from read replica
            embedded_cars = await db.fetch_matching_vehicles_for_concierge(limit=4)

        # Context injection
        user_info_str = ""
        if user_context:
            user_info_str = (
                f"\nCURRENT USER CONTEXT: Name: {user_context.get('fullName', 'Guest')}, "
                f"Role: {user_context.get('role', 'GUEST')}, "
                f"Security Deposit: AED {user_context.get('securityDeposit', 0)}, "
                f"Bidding Limit: AED {user_context.get('biddingLimit', 0)}"
            )

        system_with_context = CONCIERGE_SYSTEM_PROMPT + user_info_str

        # Format conversation for Ollama
        ollama_messages = [{"role": "system", "content": system_with_context}]
        for m in messages[-6:]: # Keep last 6 turns for context
            ollama_messages.append({"role": m.get("role", "user"), "content": m.get("content", "")})

        try:
            res = await ollama_client.chat(
                model=settings.MODEL_CHAT,
                messages=ollama_messages,
                timeout=45.0
            )
            response_content = res.get("message", {}).get("content", "").strip()
            return {
                "reply": response_content,
                "suggested_actions": self._generate_quick_actions(lower_msg),
                "embedded_vehicles": embedded_cars[:3] if embedded_cars else []
            }
        except Exception as e:
            logger.error(f"Concierge chat error with Ollama: {e}")
            # Fallback smart response
            return {
                "reply": self._rule_based_fallback(lower_msg),
                "suggested_actions": ["Calculate Bidding Power", "Browse Online Auctions", "Sell My Car - Free Valuation"],
                "embedded_vehicles": embedded_cars[:3] if embedded_cars else []
            }

    def _generate_quick_actions(self, msg: str) -> List[str]:
        if "sell" in msg or "بيع" in msg:
            return ["Book Yard Inspection", "Calculate Seller Net Proceeds", "Submit Car Details"]
        if "deposit" in msg or "limit" in msg or "تأمين" in msg:
            return ["Top-up Security Deposit", "View Active Bids", "Calculate Total Purchase Cost"]
        if "export" in msg or "تصدير" in msg:
            return ["Oman Customs Rules", "Saudi Arabia Export Guide", "RTA Transfer Fees"]
        return [
            "Calculate Total Out-of-Pocket Cost",
            "Check My Bidding Power (200x)",
            "Find Luxury SUVs under AED 100k",
            "Sell My Car - Free Valuation"
        ]

    def _rule_based_fallback(self, msg: str) -> str:
        if "deposit" in msg or "limit" in msg or "تأمين" in msg:
            return (
                "**Bidding Power & Deposit Rules:**\n"
                "• Every AED 1 deposited gives you **AED 200 in live bidding limit**.\n"
                "• Example: An AED 5,000 security deposit unlocks **AED 1,000,000 in bidding power**.\n"
                "• Deposits are 100% refundable to your bank account upon request."
            )
        elif "cost" in msg or "fee" in msg or "رسوم" in msg:
            return (
                "**Itemized Purchase Cost Breakdown:**\n"
                "• **Hammer Price**: Winning bid amount\n"
                "• **Buyer Premium**: 4% of hammer price (min AED 500, max AED 3,500)\n"
                "• **VAT**: 5% on the buyer premium only (not on the vehicle value)\n"
                "• **RTA Ownership Transfer**: AED 350 standard document fee\n"
                "• **Vehicle Inspection Report**: Included free with every won auction!"
            )
        elif "sell" in msg or "بيع" in msg:
            return (
                "**Sell Your Vehicle with Al Wataneya:**\n"
                "1. Submit basic details or upload your Mulkiya card.\n"
                "2. Our AI generates an instant market valuation and recommended reserve price.\n"
                "3. Drop off vehicle at Sharjah or Dubai yard for 10-minute mechanical inspection.\n"
                "4. Receive proceeds directly to your UAE bank account within 48 hours of sale!"
            )
        else:
            return (
                "Welcome to **Al Wataneya Auctions**! I can assist you with:\n"
                "• Finding specific vehicles matching your budget and specs\n"
                "• Calculating exact drive-away purchase costs\n"
                "• Checking your bidding power and security deposit status\n"
                "• Instant vehicle valuation for sellers\n"
                "• GCC export & cross-border transfer documentation"
            )

concierge_service = ConciergeService()
