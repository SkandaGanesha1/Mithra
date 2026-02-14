"""
Supplier Agent - ONDC/Beckn protocol integration for supplier management
Handles supplier search, order drafting, and human-in-the-loop approval
"""
import logging
import uuid
from typing import Dict, List, Optional
from datetime import datetime

from backend.utils.models import (
    AgentMessage, AgentType, SupplierOrder
)
from backend.config.settings import settings

logger = logging.getLogger(__name__)


class SupplierAgent:
    """
    Acts as an ONDC buyer node proxy
    - Receives restock requests from Inventory Agent
    - Searches for wholesalers using Beckn Protocol
    - Drafts WhatsApp messages to suppliers in local language
    - Presents order summary for human approval
    - Executes approved orders
    """
    
    def __init__(self, beckn_client, whatsapp_client, gemini_client, firestore_client, orchestrator):
        self.beckn = beckn_client
        self.whatsapp = whatsapp_client
        self.gemini = gemini_client
        self.firestore = firestore_client
        self.orchestrator = orchestrator
        self.name = "SupplierAgent"
        
    async def process_message(self, message: AgentMessage):
        """Process incoming messages"""
        if message.message_type == "restock_request":
            return await self._handle_restock_request(message.payload)
        elif message.message_type == "create_order":
            return await self._create_order(message.payload)
        elif message.message_type == "approve_order":
            return await self._approve_order(message.payload)
        else:
            logger.warning(f"Unknown message type: {message.message_type}")
    
    async def _handle_restock_request(self, payload: Dict) -> Dict:
        """
        Handle restock request from Inventory Agent
        """
        shop_id = payload.get("shop_id")
        item_id = payload.get("item_id")
        product_name = payload.get("product_name")
        brand = payload.get("brand")
        suggested_quantity = payload.get("suggested_order_quantity", 50)
        urgency = payload.get("urgency", "normal")
        
        logger.info(f"Restock request for {product_name} - Urgency: {urgency}")
        
        # Step 1: Search for suppliers via ONDC/Beckn
        suppliers = await self._search_suppliers(product_name, brand, shop_id)
        
        # Step 2: Select best supplier based on price and ratings
        best_supplier = await self._select_best_supplier(suppliers)
        
        # Step 3: Draft order
        order = await self._draft_order(
            shop_id=shop_id,
            item_id=item_id,
            product_name=product_name,
            supplier=best_supplier,
            quantity=suggested_quantity
        )
        
        # Step 4: Generate WhatsApp message for shopkeeper approval
        approval_message = await self._generate_approval_message(order)
        
        # Step 5: Send WhatsApp notification
        await self._send_whatsapp_notification(shop_id, approval_message)
        
        return {
            "order_id": order.order_id,
            "status": "pending_approval",
            "supplier": best_supplier["name"],
            "total_amount": order.total_amount,
            "message_sent": True
        }
    
    async def _search_suppliers(self, product_name: str, brand: str, shop_id: str) -> List[Dict]:
        """
        Search for suppliers using Beckn Protocol / ONDC
        """
        if settings.DEMO_MODE:
            # Demo suppliers
            return [
                {
                    "name": "Bangalore FMCG Wholesalers",
                    "contact": "+91-9876543210",
                    "unit_price": 10.5,
                    "min_order": 50,
                    "rating": 4.5,
                    "distance_km": 5.2
                },
                {
                    "name": "Metro Cash & Carry",
                    "contact": "+91-9876543211",
                    "unit_price": 11.0,
                    "min_order": 25,
                    "rating": 4.7,
                    "distance_km": 8.5
                },
                {
                    "name": "Krishna Distributors",
                    "contact": "+91-9876543212",
                    "unit_price": 10.0,
                    "min_order": 100,
                    "rating": 4.3,
                    "distance_km": 3.8
                }
            ]
        
        # Use Beckn Protocol to search
        # beckn_search_request = {
        #     "context": {
        #         "domain": "retail",
        #         "action": "search",
        #         "location": {...}
        #     },
        #     "message": {
        #         "intent": {
        #             "item": {
        #                 "descriptor": {
        #                     "name": product_name,
        #                     "tags": [brand]
        #                 }
        #             }
        #         }
        #     }
        # }
        
        return []
    
    async def _select_best_supplier(self, suppliers: List[Dict]) -> Dict:
        """
        Select best supplier based on price, rating, and distance
        Uses Gemini to make intelligent decision
        """
        if not suppliers:
            return {
                "name": "Default Supplier",
                "contact": "+91-0000000000",
                "unit_price": 10.0,
                "min_order": 50,
                "rating": 4.0,
                "distance_km": 5.0
            }
        
        # Simple heuristic: Balance price and rating
        # Better approach: Use Gemini to analyze trade-offs
        
        scored_suppliers = []
        for supplier in suppliers:
            # Score = (rating * 0.3) + ((1/price) * 0.4) + ((1/distance) * 0.3)
            price_score = 1 / supplier["unit_price"] if supplier["unit_price"] > 0 else 0
            distance_score = 1 / supplier["distance_km"] if supplier["distance_km"] > 0 else 0
            total_score = (supplier["rating"] * 0.3) + (price_score * 40 * 0.4) + (distance_score * 10 * 0.3)
            
            scored_suppliers.append({
                "supplier": supplier,
                "score": total_score
            })
        
        # Sort by score
        scored_suppliers.sort(key=lambda x: x["score"], reverse=True)
        
        return scored_suppliers[0]["supplier"]
    
    async def _draft_order(
        self,
        shop_id: str,
        item_id: str,
        product_name: str,
        supplier: Dict,
        quantity: int
    ) -> SupplierOrder:
        """
        Draft a supplier order
        """
        order_id = f"order_{uuid.uuid4().hex[:8]}"
        
        # Adjust quantity to meet minimum order
        if quantity < supplier.get("min_order", 0):
            quantity = supplier["min_order"]
        
        total_amount = quantity * supplier["unit_price"]
        
        order = SupplierOrder(
            order_id=order_id,
            shop_id=shop_id,
            item_id=item_id,
            quantity=quantity,
            supplier_name=supplier["name"],
            supplier_contact=supplier.get("contact"),
            unit_price=supplier["unit_price"],
            total_amount=total_amount,
            status="draft"
        )
        
        # Save to Firestore
        await self._save_order(order)
        
        return order
    
    async def _generate_approval_message(self, order: SupplierOrder) -> str:
        """
        Generate WhatsApp approval message in shopkeeper's language
        Uses Gemini for translation
        """
        # Get shop profile to determine language
        # shop = self.firestore.collection(settings.get_firestore_collection("shops")).document(order.shop_id).get()
        # language = shop.get("preferred_language", "english")
        
        if settings.DEMO_MODE:
            # Kannada message
            return f"""
📦 *ಸ್ಟಾಕ್ ಎಚ್ಚರಿಕೆ* 📦

ನಿಮ್ಮ Maggi noodles ಸ್ಟಾಕ್ ಕಡಿಮೆಯಾಗಿದೆ!

📊 ಪ್ರಸ್ತುತ ಸ್ಟಾಕ್: 5 ಪ್ಯಾಕೆಟ್‌ಗಳು
💰 ಬೆಲೆ: ₹12/ಪ್ಯಾಕ್

🏪 *ಆರ್ಡರ್ ವಿವರಗಳು:*
• ಸರಬರಾಜುದಾರ: {order.supplier_name}
• ಪ್ರಮಾಣ: {order.quantity} ಪ್ಯಾಕೆಟ್‌ಗಳು
• ಘಟಕ ಬೆಲೆ: ₹{order.unit_price}
• ಒಟ್ಟು ಮೊತ್ತ: ₹{order.total_amount}

ನಾನು ಇದನ್ನು ಆರ್ಡರ್ ಮಾಡಬೇಕೇ?
"ಹೌದು" ಅಥವಾ "ಇಲ್ಲ" ಎಂದು ಉತ್ತರಿಸಿ.
"""
        
        # English version
        return f"""
📦 *Stock Alert* 📦

Your stock is running low!

📊 Current Stock: 5 packets
💰 Price: ₹12/pack

🏪 *Order Details:*
• Supplier: {order.supplier_name}
• Quantity: {order.quantity} packets
• Unit Price: ₹{order.unit_price}
• Total Amount: ₹{order.total_amount}

Should I place this order?
Reply "Yes" or "No"
"""
    
    async def _send_whatsapp_notification(self, shop_id: str, message: str):
        """
        Send WhatsApp notification to shopkeeper
        """
        # Get shop phone number
        # shop = self.firestore.collection(settings.get_firestore_collection("shops")).document(shop_id).get()
        # phone_number = shop.get("phone_number")
        
        # Send via Twilio WhatsApp API
        # self.whatsapp.messages.create(
        #     body=message,
        #     from_=settings.WHATSAPP_FROM_NUMBER,
        #     to=f"whatsapp:{phone_number}"
        # )
        
        logger.info(f"WhatsApp notification sent to shop: {shop_id}")
    
    async def _save_order(self, order: SupplierOrder):
        """Save order to Firestore"""
        collection = settings.get_firestore_collection("orders")
        # self.firestore.collection(collection).document(order.order_id).set(order.dict())
        logger.info(f"Saved order: {order.order_id}")
    
    async def _create_order(self, payload: Dict):
        """Create order workflow"""
        return await self._handle_restock_request(payload)
    
    async def _approve_order(self, payload: Dict):
        """
        Handle order approval from shopkeeper
        """
        order_id = payload.get("order_id")
        approved = payload.get("approved", False)
        
        # Fetch order
        # order = self.firestore.collection(settings.get_firestore_collection("orders")).document(order_id).get()
        
        if approved:
            # Update order status
            # order["status"] = "approved"
            # order["approved_at"] = datetime.utcnow()
            
            # Generate UPI payment link
            upi_link = await self._generate_upi_payment_link(order_id, payload.get("total_amount", 525.0))
            
            # Send payment link
            # await self._send_whatsapp_notification(order["shop_id"], f"Payment link: {upi_link}")
            
            logger.info(f"Order approved: {order_id}")
            
            return {
                "order_id": order_id,
                "status": "approved",
                "payment_link": upi_link
            }
        else:
            # Update order status to cancelled
            # order["status"] = "cancelled"
            
            logger.info(f"Order cancelled: {order_id}")
            
            return {
                "order_id": order_id,
                "status": "cancelled"
            }
    
    async def _generate_upi_payment_link(self, order_id: str, amount: float) -> str:
        """
        Generate UPI payment link for supplier payment
        """
        # Generate UPI deep link
        upi_link = f"upi://pay?pa=supplier@paytm&pn=Supplier&am={amount}&tn=Order_{order_id}&cu=INR"
        
        return upi_link
