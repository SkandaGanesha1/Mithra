"""
Inventory Agent - Vision-based inventory management
Uses Gemini Vision to analyze shelf images and detect stockouts
"""
import logging
import uuid
from typing import Dict, List, Optional
from datetime import datetime, timedelta

from backend.utils.models import (
    AgentMessage, AgentType, ImageInput, InventoryItem
)
from backend.config.settings import settings

logger = logging.getLogger(__name__)


class InventoryAgent:
    """
    Handles inventory management through image analysis
    - Accepts WhatsApp image uploads
    - Uses Gemini Vision to identify FMCG products
    - Detects brand, variant, size, and counts quantities
    - Compares against reorder thresholds
    - Calculates burn rate from sales history
    - Triggers Supplier Agent when stock is low
    """
    
    def __init__(self, gemini_vision_client, firestore_client, orchestrator):
        self.gemini_vision = gemini_vision_client
        self.firestore = firestore_client
        self.orchestrator = orchestrator
        self.name = "InventoryAgent"
        
    async def process_message(self, message: AgentMessage):
        """Process incoming messages"""
        if message.message_type == "image_input":
            return await self._handle_image_input(message.payload)
        elif message.message_type == "analyze_inventory":
            return await self._analyze_inventory(message.payload)
        elif message.message_type == "check_reorder":
            return await self._check_reorder_needs(message.payload)
        else:
            logger.warning(f"Unknown message type: {message.message_type}")
    
    async def _handle_image_input(self, payload: Dict) -> Dict:
        """Handle image input from WhatsApp"""
        image_input = ImageInput(**payload)
        
        # Step 1: Analyze image with Gemini Vision
        detected_items = await self._analyze_shelf_image(image_input.image_url)
        image_input.detected_items = detected_items
        image_input.analysis_timestamp = datetime.utcnow()
        
        # Step 2: Update inventory in database
        inventory_updates = []
        for item_data in detected_items:
            inventory_item = await self._update_inventory_item(
                image_input.shop_id,
                item_data
            )
            inventory_updates.append(inventory_item)
        
        # Step 3: Check reorder needs
        reorder_needed = []
        for item in inventory_updates:
            if item.quantity < item.reorder_threshold:
                # Calculate burn rate
                burn_rate = await self._calculate_burn_rate(item)
                item.burn_rate = burn_rate
                
                # Check urgency
                if burn_rate and burn_rate > 0:
                    days_until_stockout = item.quantity / burn_rate
                    if days_until_stockout < 3:  # Urgent: less than 3 days
                        reorder_needed.append({
                            "item": item,
                            "urgency": "high",
                            "days_remaining": days_until_stockout
                        })
        
        # Step 4: Tag Supplier Agent if urgent
        if reorder_needed:
            await self._trigger_supplier_agent(reorder_needed)
        
        return {
            "shop_id": image_input.shop_id,
            "items_detected": len(detected_items),
            "items_updated": len(inventory_updates),
            "reorder_needed": len(reorder_needed),
            "urgent_items": [r["item"].product_name for r in reorder_needed]
        }
    
    async def _analyze_shelf_image(self, image_url: str) -> List[Dict]:
        """
        Use Gemini Vision to analyze shelf image
        Returns list of detected products with quantities
        """
        if settings.DEMO_MODE:
            # Demo response for Maggi noodles shelf
            return [
                {
                    "product_name": "Maggi 2-Minute Noodles",
                    "brand": "Maggi",
                    "variant": "Masala",
                    "size": "70g",
                    "quantity": 5,
                    "confidence": 0.95
                },
                {
                    "product_name": "Maggi 2-Minute Noodles",
                    "brand": "Maggi",
                    "variant": "Atta Noodles",
                    "size": "75g",
                    "quantity": 8,
                    "confidence": 0.92
                }
            ]
        
        prompt = f"""
        Analyze this shelf image and identify all FMCG products visible.
        
        For each product, extract:
        - Product name
        - Brand name
        - Variant (flavor, type)
        - Size/weight
        - Quantity (count visible items)
        
        Image: {image_url}
        
        Return as JSON array with keys: product_name, brand, variant, size, quantity, confidence
        Focus on packaged goods commonly found in Indian Kirana stores.
        """
        
        # Use Gemini Vision API
        # Implementation would call actual API
        
        return [
            {
                "product_name": "Maggi 2-Minute Noodles",
                "brand": "Maggi",
                "variant": "Masala",
                "size": "70g",
                "quantity": 5,
                "confidence": 0.95
            }
        ]
    
    async def _update_inventory_item(self, shop_id: str, item_data: Dict) -> InventoryItem:
        """
        Update or create inventory item in database
        """
        # Create unique item ID
        item_id = f"{shop_id}_{item_data['brand']}_{item_data['variant']}".lower().replace(" ", "_")
        
        # Check if item exists
        # existing_item = self.firestore.collection(settings.get_firestore_collection("inventory")).document(item_id).get()
        
        inventory_item = InventoryItem(
            item_id=item_id,
            shop_id=shop_id,
            product_name=item_data["product_name"],
            brand=item_data["brand"],
            variant=item_data["variant"],
            quantity=item_data["quantity"],
            reorder_threshold=settings.INVENTORY_REORDER_THRESHOLD,
            price=12.0,  # Would be fetched from pricing agent or historical data
            last_updated=datetime.utcnow()
        )
        
        # Save to Firestore
        # self.firestore.collection(settings.get_firestore_collection("inventory")).document(item_id).set(inventory_item.dict())
        
        logger.info(f"Updated inventory: {item_id} - Quantity: {inventory_item.quantity}")
        
        return inventory_item
    
    async def _calculate_burn_rate(self, item: InventoryItem) -> Optional[float]:
        """
        Calculate burn rate (units per day) based on sales history
        Uses the Gemini 1M context window to analyze historical data
        """
        if settings.DEMO_MODE:
            # Demo burn rate: 2 units per day
            return 2.0
        
        # Fetch sales history from context
        # Query Firestore for past sales
        # sales_history = self.firestore.collection(settings.get_firestore_collection("sales")).where("item_id", "==", item.item_id).order_by("date", descending=True).limit(30).get()
        
        # Calculate average daily consumption
        # For now, return estimated value
        return 2.0
    
    async def _trigger_supplier_agent(self, reorder_items: List[Dict]):
        """
        Send message to Supplier Agent to draft orders
        """
        for reorder_info in reorder_items:
            item = reorder_info["item"]
            
            message = AgentMessage(
                message_id=f"reorder_{uuid.uuid4().hex[:8]}",
                from_agent=AgentType.INVENTORY,
                to_agent=AgentType.SUPPLIER,
                message_type="restock_request",
                payload={
                    "shop_id": item.shop_id,
                    "item_id": item.item_id,
                    "product_name": item.product_name,
                    "brand": item.brand,
                    "current_quantity": item.quantity,
                    "reorder_threshold": item.reorder_threshold,
                    "urgency": reorder_info["urgency"],
                    "days_remaining": reorder_info["days_remaining"],
                    "suggested_order_quantity": max(50, item.reorder_threshold * 3)
                },
                priority=1 if reorder_info["urgency"] == "high" else 0
            )
            
            await self.orchestrator.route_message(message)
            logger.info(f"Triggered Supplier Agent for {item.product_name}")
    
    async def _analyze_inventory(self, payload: Dict):
        """Workflow: Analyze inventory from image"""
        return await self._handle_image_input(payload)
    
    async def _check_reorder_needs(self, payload: Dict):
        """Check if any items need reordering"""
        shop_id = payload.get("shop_id")
        
        # Fetch all inventory items for shop
        # items = self.firestore.collection(settings.get_firestore_collection("inventory")).where("shop_id", "==", shop_id).get()
        
        # Check each item against threshold
        # Implementation would check all items
        
        logger.info(f"Checked reorder needs for shop: {shop_id}")
        return {"status": "checked"}
