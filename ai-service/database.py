import asyncpg
import logging
from typing import Optional, Dict, Any, List
from config import settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        targets = [settings.POSTGRES_REPLICA_HOST, settings.POSTGRES_MASTER_HOST]
        for host in targets:
            try:
                logger.info(f"Connecting to PostgreSQL node: {host}:{settings.POSTGRES_PORT} (read-only mode)")
                self.pool = await asyncpg.create_pool(
                    host=host,
                    port=settings.POSTGRES_PORT,
                    database=settings.POSTGRES_DB,
                    user=settings.POSTGRES_USER,
                    password=settings.POSTGRES_PASSWORD,
                    min_size=2,
                    max_size=10,
                    command_timeout=10,
                    server_settings={
                        'statement_timeout': '5000', # 5 second maximum query duration
                        'default_transaction_read_only': 'on' # Enforce zero writes
                    }
                )
                logger.info(f"Successfully established read-replica pool to {host}")
                return
            except Exception as e:
                logger.warning(f"Failed to connect to node {host}: {e}. Trying fallback if available...")
        
        logger.error("Could not establish PostgreSQL connection pool to any node.")

    async def disconnect(self):
        if self.pool:
            await self.pool.close()
            logger.info("Closed PostgreSQL connection pool.")

    async def fetch_financial_aggregates(self) -> Dict[str, Any]:
        """Queries read-replica for auction clearance, bids, and vehicle category distribution."""
        if not self.pool:
            return {}
        try:
            async with self.pool.acquire() as conn:
                # 1. Total Cleared & Active Auctions
                auctions_stats = await conn.fetchrow("""
                    SELECT 
                        COUNT(*) as total_auctions,
                        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_auctions,
                        COUNT(CASE WHEN status = 'ENDED' OR status = 'CLOSED' THEN 1 END) as cleared_auctions,
                        COALESCE(SUM(current_highest_bid), 0) as total_volume_aed,
                        COALESCE(AVG(current_highest_bid), 0) as avg_hammer_aed
                    FROM auctions
                """)

                # 2. Total Bids Placed
                bids_stats = await conn.fetchrow("""
                    SELECT 
                        COUNT(*) as total_bids,
                        COALESCE(MAX(amount), 0) as highest_bid_aed,
                        COUNT(DISTINCT bidder_id) as unique_active_bidders
                    FROM bids
                """)

                # 3. Category Distribution
                category_rows = await conn.fetch("""
                    SELECT 
                        COALESCE(v.category, 'SEDAN') as category,
                        COUNT(a.id) as vehicle_count,
                        COALESCE(SUM(a.current_highest_bid), 0) as gmv_aed,
                        COALESCE(AVG(a.current_highest_bid), 0) as avg_price_aed
                    FROM vehicles v
                    LEFT JOIN auctions a ON a.vehicle_id = v.id
                    GROUP BY v.category
                    ORDER BY gmv_aed DESC
                """)

                # 4. Total Registered Users
                user_stats = await conn.fetchrow("""
                    SELECT 
                        COUNT(*) as total_users,
                        COUNT(CASE WHEN role = 'BUYER' THEN 1 END) as total_buyers,
                        COUNT(CASE WHEN role = 'SELLER' THEN 1 END) as total_sellers,
                        COALESCE(SUM(security_deposit), 0) as total_deposits_held_aed
                    FROM users
                """)

                return {
                    "auctions": dict(auctions_stats) if auctions_stats else {},
                    "bids": dict(bids_stats) if bids_stats else {},
                    "categories": [dict(r) for r in category_rows],
                    "users": dict(user_stats) if user_stats else {},
                }
        except Exception as e:
            logger.error(f"Error fetching financial aggregates from replica: {e}")
            return {}

    async def fetch_failed_payments(self) -> List[Dict[str, Any]]:
        """Queries read-replica for payment transactions that encountered failure or decline."""
        if not self.pool:
            return []
        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT 
                        p.id,
                        p.auction_id,
                        p.payer_id,
                        p.gateway,
                        p.gateway_order_id,
                        p.amount,
                        p.currency,
                        p.status,
                        p.reconciliation_payload,
                        p.created_at,
                        u.full_name as buyer_name,
                        u.email as buyer_email,
                        u.phone as buyer_phone
                    FROM payments p
                    LEFT JOIN users u ON p.payer_id = u.id
                    WHERE p.status = 'FAILED'
                    ORDER BY p.created_at DESC
                    LIMIT 50
                """)
                return [dict(r) for r in rows]
        except Exception as e:
            logger.error(f"Error fetching failed payments from replica: {e}")
            return []

    async def fetch_matching_vehicles_for_concierge(self, search_text: str = "", max_price: float = 0, limit: int = 6) -> List[Dict[str, Any]]:
        """Queries read-replica for vehicles matching buyer criteria."""
        if not self.pool:
            return []
        try:
            async with self.pool.acquire() as conn:
                query = """
                    SELECT 
                        v.id, v.make, v.model, v.year, v.mileage, v.specs, v.fuel_type, v.branch,
                        v.image_url, a.id as auction_id, a.current_highest_bid, a.start_bid, a.status as auction_status
                    FROM vehicles v
                    LEFT JOIN auctions a ON a.vehicle_id = v.id
                    WHERE a.status = 'ACTIVE'
                """
                params = []
                if max_price > 0:
                    params.append(max_price)
                    query += f" AND (a.current_highest_bid <= ${len(params)} OR a.start_bid <= ${len(params)})"
                
                query += " ORDER BY a.current_highest_bid DESC LIMIT 6"
                rows = await conn.fetch(query, *params)
                return [dict(r) for r in rows]
        except Exception as e:
            logger.error(f"Error querying vehicles for concierge: {e}")
            return []

db = DatabaseManager()
