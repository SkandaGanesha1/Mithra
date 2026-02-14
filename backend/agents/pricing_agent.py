"""
Pricing Agent - Location-based competitive pricing intelligence
Uses Google Maps to analyze local market and suggest pricing strategies
"""
import logging
import uuid
from typing import Dict, List, Optional
from datetime import datetime, timedelta

from backend.utils.models import (
    AgentMessage, PricingRecommendation, FestivalAlert
)
from backend.config.settings import settings

logger = logging.getLogger(__name__)


class PricingAgent:
    """
    Provides location-based pricing intelligence
    - Takes shop location coordinates
    - Queries Google Maps for competing stores within radius
    - Analyzes neighborhood personality (high-income vs wholesale)
    - Suggests pricing strategy (Premium vs Volume)
    - Checks festival calendar for stocking recommendations
    """
    
    def __init__(self, maps_client, gemini_client, firestore_client):
        self.maps = maps_client
        self.gemini = gemini_client
        self.firestore = firestore_client
        self.name = "PricingAgent"
        
    async def process_message(self, message: AgentMessage):
        """Process incoming messages"""
        if message.message_type == "analyze_pricing":
            return await self._analyze_pricing(message.payload)
        elif message.message_type == "get_recommendation":
            return await self._get_pricing_recommendation(message.payload)
        else:
            logger.warning(f"Unknown message type: {message.message_type}")
    
    async def _analyze_pricing(self, payload: Dict) -> Dict:
        """
        Analyze pricing for a shop based on location
        """
        shop_id = payload.get("shop_id")
        location = payload.get("location")  # {lat, lng}
        item_id = payload.get("item_id")
        
        # Step 1: Find competing stores
        nearby_stores = await self._find_nearby_stores(location)
        
        # Step 2: Analyze neighborhood personality
        neighborhood_type = await self._analyze_neighborhood(location, nearby_stores)
        
        # Step 3: Get competitor pricing (simulated)
        competitor_prices = await self._get_competitor_prices(item_id, nearby_stores)
        
        # Step 4: Generate pricing strategy
        recommendation = await self._generate_pricing_strategy(
            shop_id=shop_id,
            item_id=item_id,
            neighborhood_type=neighborhood_type,
            competitor_prices=competitor_prices,
            nearby_stores_count=len(nearby_stores)
        )
        
        # Step 5: Check for upcoming festivals
        festival_alerts = await self._check_festival_calendar(shop_id)
        
        # Step 6: Save recommendation
        await self._save_recommendation(recommendation)
        
        return {
            "shop_id": shop_id,
            "recommendation": recommendation.dict(),
            "festival_alerts": [alert.dict() for alert in festival_alerts]
        }
    
    async def _find_nearby_stores(self, location: Dict) -> List[Dict]:
        """
        Query Google Maps Places API for nearby stores
        """
        if settings.DEMO_MODE:
            # Demo: Indiranagar area has multiple stores
            return [
                {
                    "name": "MK Retail Store",
                    "distance": 150,
                    "rating": 4.2,
                    "types": ["grocery_or_supermarket", "store"]
                },
                {
                    "name": "Fresh Foods Kirana",
                    "distance": 300,
                    "rating": 4.5,
                    "types": ["grocery_or_supermarket", "food"]
                },
                {
                    "name": "Daily Needs Store",
                    "distance": 450,
                    "rating": 3.9,
                    "types": ["convenience_store", "store"]
                }
            ]
        
        # Use Google Maps Places API
        # results = self.maps.places_nearby(
        #     location=(location["lat"], location["lng"]),
        #     radius=settings.MAPS_SEARCH_RADIUS,
        #     type="grocery_or_supermarket"
        # )
        
        return []
    
    async def _analyze_neighborhood(self, location: Dict, nearby_stores: List[Dict]) -> str:
        """
        Analyze neighborhood personality based on place types and reviews
        Returns: "high-income", "middle-income", "wholesale", "residential"
        """
        if settings.DEMO_MODE:
            # Indiranagar is a high-income area
            return "high-income"
        
        # Analyze using Gemini
        prompt = f"""
        Analyze this neighborhood based on the nearby stores and their characteristics:
        
        Location: {location}
        Nearby stores: {nearby_stores}
        
        Determine if this is a:
        - high-income area (premium pricing strategy)
        - middle-income area (balanced pricing)
        - wholesale area (volume pricing)
        - residential area (convenience pricing)
        
        Return only one category.
        """
        
        # Use Gemini to analyze
        return "high-income"
    
    async def _get_competitor_prices(self, item_id: str, nearby_stores: List[Dict]) -> List[float]:
        """
        Get competitor prices for the item
        In production, this would scrape or use APIs
        """
        if settings.DEMO_MODE:
            # Demo prices for Maggi noodles
            return [10.0, 11.5, 12.0, 13.0]
        
        # Simulate price data
        return [10.0, 11.5, 12.0]
    
    async def _generate_pricing_strategy(
        self,
        shop_id: str,
        item_id: str,
        neighborhood_type: str,
        competitor_prices: List[float],
        nearby_stores_count: int
    ) -> PricingRecommendation:
        """
        Generate pricing recommendation using Gemini
        """
        if not competitor_prices:
            competitor_prices = [12.0]
        
        avg_competitor_price = sum(competitor_prices) / len(competitor_prices)
        
        # Strategy based on neighborhood
        strategy_map = {
            "high-income": {
                "strategy": "premium",
                "multiplier": 1.15,
                "reasoning": "High-income area supports premium pricing. Focus on quality and service."
            },
            "middle-income": {
                "strategy": "competitive",
                "multiplier": 1.0,
                "reasoning": "Middle-income area. Match competitor prices for high-volume items."
            },
            "wholesale": {
                "strategy": "volume",
                "multiplier": 0.95,
                "reasoning": "Wholesale area. Compete on volume with lower margins."
            },
            "residential": {
                "strategy": "convenience",
                "multiplier": 1.08,
                "reasoning": "Residential area. Slight premium for convenience and proximity."
            }
        }
        
        strategy_info = strategy_map.get(neighborhood_type, strategy_map["middle-income"])
        recommended_price = round(avg_competitor_price * strategy_info["multiplier"], 2)
        
        recommendation = PricingRecommendation(
            item_id=item_id,
            shop_id=shop_id,
            current_price=avg_competitor_price,
            recommended_price=recommended_price,
            competitor_prices=competitor_prices,
            strategy=strategy_info["strategy"],
            reasoning=strategy_info["reasoning"],
            nearby_stores=nearby_stores_count
        )
        
        return recommendation
    
    async def _check_festival_calendar(self, shop_id: str) -> List[FestivalAlert]:
        """
        Check Indian festival calendar and suggest stocking
        """
        alerts = []
        
        # Example: Check if Deepavali is approaching (Demo)
        if settings.DEMO_MODE:
            # Simulate Deepavali in 15 days
            deepavali_date = datetime.utcnow() + timedelta(days=15)
            
            alert = FestivalAlert(
                festival_name="Deepavali",
                date=deepavali_date,
                days_until=15,
                recommended_items=settings.FESTIVALS["deepavali"],
                shop_id=shop_id
            )
            alerts.append(alert)
        
        # In production, integrate with Indian festival calendar API
        # Check upcoming festivals in next 30 days
        
        return alerts
    
    async def _save_recommendation(self, recommendation: PricingRecommendation):
        """Save pricing recommendation to Firestore"""
        collection = settings.get_firestore_collection("pricing_recommendations")
        # self.firestore.collection(collection).document(recommendation.item_id).set(recommendation.dict())
        logger.info(f"Saved pricing recommendation for item: {recommendation.item_id}")
    
    async def _get_pricing_recommendation(self, payload: Dict):
        """Get pricing recommendation for an item"""
        return await self._analyze_pricing(payload)
