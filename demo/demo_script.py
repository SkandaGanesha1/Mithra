"""
Demo Mode Simulation Script
Simulates the complete end-to-end workflow for BharatAgent
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import asyncio
import logging
from datetime import datetime
from typing import Dict

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import components
from backend.config.settings import settings
from backend.utils.models import (
    VoiceInput, ImageInput, LanguageCode, AgentType
)
from backend.orchestrator.orchestrator import orchestrator
from backend.agents.onboarding_agent import OnboardingAgent
from backend.agents.inventory_agent import InventoryAgent
from backend.agents.pricing_agent import PricingAgent
from backend.agents.supplier_agent import SupplierAgent
from backend.agents.compliance_agent import ComplianceAgent
from backend.services.gemini_service import gemini_service
from backend.services.firestore_service import firestore_service
from backend.services.whatsapp_service import whatsapp_service


class BharatAgentDemo:
    """
    Demo simulation for BharatAgent system
    
    Scenario:
    1. User sends voice note in Kannada: "I want to register my Kirana store in Jayanagar"
    2. Agent replies in Kannada, verifies location via Maps
    3. User uploads photo of shelf with Maggi noodles
    4. Agent detects low stock, checks Maps for distributors
    5. Agent sends WhatsApp notification with order details
    6. User replies "Yes"
    7. System generates UPI payment link
    """
    
    def __init__(self):
        self.orchestrator = orchestrator
        self.setup_complete = False
        
    async def setup(self):
        """Initialize all agents and services"""
        logger.info("=" * 60)
        logger.info("🚀 BharatAgent Demo - Initializing System")
        logger.info("=" * 60)
        
        # Initialize agents (using None for clients in demo mode)
        onboarding_agent = OnboardingAgent(
            gemini_client=gemini_service,
            maps_client=None,
            firestore_client=firestore_service
        )
        
        inventory_agent = InventoryAgent(
            gemini_vision_client=gemini_service,
            firestore_client=firestore_service,
            orchestrator=self.orchestrator
        )
        
        pricing_agent = PricingAgent(
            maps_client=None,
            gemini_client=gemini_service,
            firestore_client=firestore_service
        )
        
        supplier_agent = SupplierAgent(
            beckn_client=None,
            whatsapp_client=whatsapp_service,
            gemini_client=gemini_service,
            firestore_client=firestore_service,
            orchestrator=self.orchestrator
        )
        
        compliance_agent = ComplianceAgent(
            firestore_client=firestore_service,
            whatsapp_client=whatsapp_service
        )
        
        # Register agents with orchestrator
        self.orchestrator.register_agent(AgentType.ONBOARDING, onboarding_agent)
        self.orchestrator.register_agent(AgentType.INVENTORY, inventory_agent)
        self.orchestrator.register_agent(AgentType.PRICING, pricing_agent)
        self.orchestrator.register_agent(AgentType.SUPPLIER, supplier_agent)
        self.orchestrator.register_agent(AgentType.COMPLIANCE, compliance_agent)
        
        await self.orchestrator.start()
        
        self.setup_complete = True
        logger.info("✅ All agents registered and ready")
        logger.info("")
    
    async def step1_onboarding(self) -> Dict:
        """Step 1: User sends voice note in Kannada"""
        logger.info("📱 STEP 1: Onboarding - Voice Registration")
        logger.info("-" * 60)
        logger.info("👤 User: Sends voice note in Kannada")
        logger.info("   🎤 Audio: 'ನಾನು ಜಯನಗರದಲ್ಲಿ ನನ್ನ ಕಿರಾಣಿ ಅಂಗಡಿಯನ್ನು ನೋಂದಾಯಿಸಲು ಬಯಸುತ್ತೇನೆ'")
        logger.info("   📝 Translation: 'I want to register my Kirana store in Jayanagar'")
        logger.info("")
        
        voice_input = VoiceInput(
            audio_url="https://demo.audio/kannada_registration.mp3",
            shop_id=None
        )
        
        result = await self.orchestrator.handle_voice_input(voice_input)
        
        logger.info("🤖 Agent Response:")
        logger.info(f"   ✓ Language detected: Kannada")
        logger.info(f"   ✓ Business: Sri Lakshmi Stores")
        logger.info(f"   ✓ Owner: Ravi Kumar")
        logger.info(f"   ✓ Location verified: Jayanagar, Bangalore")
        logger.info(f"   ✓ UPI QR Code generated!")
        logger.info("")
        logger.info("   💬 Response (Kannada): ನಮಸ್ಕಾರ Ravi Kumar!")
        logger.info("      ನಿಮ್ಮ ಅಂಗಡಿ ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ.")
        logger.info("      ನಿಮ್ಮ UPI QR ಕೋಡ್ ಸಿದ್ಧವಾಗಿದೆ!")
        logger.info("")
        
        # Simulate getting shop_id from result
        return {"shop_id": "shop_demo123", "status": "registered"}
    
    async def step2_inventory_scan(self, shop_id: str) -> Dict:
        """Step 2: User uploads shelf photo"""
        logger.info("📸 STEP 2: Inventory Management - Image Upload")
        logger.info("-" * 60)
        logger.info("👤 User: Uploads photo of Maggi noodles shelf")
        logger.info("   🖼️  Image: Shelf with various Maggi products")
        logger.info("")
        
        image_input = ImageInput(
            image_url="https://demo.images/shelf_maggi.jpg",
            shop_id=shop_id
        )
        
        result = await self.orchestrator.handle_image_input(image_input)
        
        logger.info("🤖 Agent Analysis:")
        logger.info("   ✓ Products detected using Gemini Vision:")
        logger.info("     • Maggi 2-Minute Noodles (Masala) - 70g: 5 packets")
        logger.info("     • Maggi Atta Noodles - 75g: 8 packets")
        logger.info("")
        logger.info("   ⚠️  LOW STOCK ALERT!")
        logger.info("     • Maggi Masala: Only 5 packets left")
        logger.info("     • Reorder threshold: 10 packets")
        logger.info("     • Burn rate: 2 packets/day")
        logger.info("     • Days until stockout: 2.5 days (URGENT)")
        logger.info("")
        
        return {
            "shop_id": shop_id,
            "item_id": f"{shop_id}_maggi_masala",
            "low_stock": True
        }
    
    async def step3_pricing_analysis(self, shop_id: str) -> Dict:
        """Step 3: Analyze pricing based on location"""
        logger.info("💰 STEP 3: Pricing Intelligence - Location Analysis")
        logger.info("-" * 60)
        logger.info("🗺️  Agent: Analyzing local market via Google Maps")
        logger.info("")
        
        pricing_result = await self.orchestrator.trigger_agent_workflow(
            "update_pricing",
            {
                "shop_id": shop_id,
                "location": {"lat": 12.9250, "lng": 77.5937},
                "item_id": f"{shop_id}_maggi_masala"
            }
        )
        
        logger.info("🤖 Pricing Analysis:")
        logger.info("   ✓ Nearby stores found: 3 within 500m")
        logger.info("     • MK Retail Store (150m) - ₹10.00")
        logger.info("     • Fresh Foods Kirana (300m) - ₹11.50")
        logger.info("     • Daily Needs Store (450m) - ₹13.00")
        logger.info("")
        logger.info("   ✓ Neighborhood: High-income (Jayanagar)")
        logger.info("   ✓ Strategy: Premium pricing")
        logger.info("   ✓ Recommended price: ₹12.00/packet")
        logger.info("   📊 Reasoning: High-income area supports premium pricing")
        logger.info("")
        logger.info("   🎉 Festival Alert: Deepavali in 15 days!")
        logger.info("      Recommended stock: oil, lamps, sweets, firecrackers")
        logger.info("")
        
        return {"recommended_price": 12.0}
    
    async def step4_supplier_order(self, shop_id: str, item_id: str) -> Dict:
        """Step 4: Create supplier order"""
        logger.info("📦 STEP 4: Supplier Integration - Order Creation")
        logger.info("-" * 60)
        logger.info("🔍 Agent: Searching suppliers via ONDC/Beckn Protocol")
        logger.info("")
        
        # Simulate supplier search
        await asyncio.sleep(1)
        
        logger.info("🤖 Supplier Search Results:")
        logger.info("   ✓ Found 3 wholesalers:")
        logger.info("     1. Bangalore FMCG Wholesalers (5.2km) - ₹10.50/unit")
        logger.info("     2. Metro Cash & Carry (8.5km) - ₹11.00/unit")
        logger.info("     3. Krishna Distributors (3.8km) - ₹10.00/unit ⭐")
        logger.info("")
        logger.info("   ✓ Best supplier selected: Krishna Distributors")
        logger.info("     • Price: ₹10.00/unit")
        logger.info("     • Rating: 4.3/5")
        logger.info("     • Distance: 3.8km")
        logger.info("")
        logger.info("   📱 WhatsApp notification sent (Kannada):")
        logger.info("=" * 60)
        print("""
📦 *ಸ್ಟಾಕ್ ಎಚ್ಚರಿಕೆ* 📦

ನಿಮ್ಮ Maggi noodles ಸ್ಟಾಕ್ ಕಡಿಮೆಯಾಗಿದೆ!

📊 ಪ್ರಸ್ತುತ ಸ್ಟಾಕ್: 5 ಪ್ಯಾಕೆಟ್‌ಗಳು
💰 ಬೆಲೆ: ₹12/ಪ್ಯಾಕ್

🏪 *ಆರ್ಡರ್ ವಿವರಗಳು:*
• ಸರಬರಾಜುದಾರ: Krishna Distributors
• ಪ್ರಮಾಣ: 50 ಪ್ಯಾಕೆಟ್‌ಗಳು
• ಘಟಕ ಬೆಲೆ: ₹10.00
• ಒಟ್ಟು ಮೊತ್ತ: ₹500.00

ನಾನು ಇದನ್ನು ಆರ್ಡರ್ ಮಾಡಬೇಕೇ?
"ಹೌದು" ಅಥವಾ "ಇಲ್ಲ" ಎಂದು ಉತ್ತರಿಸಿ.
        """)
        logger.info("=" * 60)
        logger.info("")
        
        return {
            "order_id": "order_abc123",
            "total_amount": 500.0,
            "status": "pending_approval"
        }
    
    async def step5_user_approval(self, order_id: str, total_amount: float):
        """Step 5: User approves order"""
        logger.info("✅ STEP 5: Human-in-the-Loop - Order Approval")
        logger.info("-" * 60)
        logger.info("👤 User: Replies 'ಹೌದು' (Yes)")
        logger.info("")
        
        await asyncio.sleep(1)
        
        logger.info("🤖 Agent: Order approved!")
        logger.info("   ✓ Order ID: order_abc123")
        logger.info("   ✓ Status: Approved")
        logger.info("")
        logger.info("   💳 Generating UPI payment link...")
        
        upi_link = f"upi://pay?pa=supplier@paytm&pn=Krishna Distributors&am={total_amount}&tn={order_id}&cu=INR"
        
        logger.info("")
        logger.info("   📱 Payment link sent via WhatsApp:")
        logger.info(f"   {upi_link}")
        logger.info("")
        logger.info("   🎉 Order placed successfully!")
        logger.info("")
    
    async def run_demo(self):
        """Run complete demo simulation"""
        if not self.setup_complete:
            await self.setup()
        
        logger.info("🎬 Starting End-to-End Demo Simulation")
        logger.info("=" * 60)
        logger.info("")
        
        # Step 1: Onboarding
        onboarding_result = await self.step1_onboarding()
        shop_id = onboarding_result["shop_id"]
        
        await asyncio.sleep(2)
        
        # Step 2: Inventory scan
        inventory_result = await self.step2_inventory_scan(shop_id)
        item_id = inventory_result["item_id"]
        
        await asyncio.sleep(2)
        
        # Step 3: Pricing analysis
        pricing_result = await self.step3_pricing_analysis(shop_id)
        
        await asyncio.sleep(2)
        
        # Step 4: Supplier order
        order_result = await self.step4_supplier_order(shop_id, item_id)
        
        await asyncio.sleep(2)
        
        # Step 5: User approval and payment
        await self.step5_user_approval(order_result["order_id"], order_result["total_amount"])
        
        # Summary
        logger.info("=" * 60)
        logger.info("✨ DEMO COMPLETED SUCCESSFULLY!")
        logger.info("=" * 60)
        logger.info("")
        logger.info("📊 Summary:")
        logger.info("   ✓ Shop registered with voice (Kannada)")
        logger.info("   ✓ Inventory analyzed via image (Gemini Vision)")
        logger.info("   ✓ Pricing optimized based on location (Google Maps)")
        logger.info("   ✓ Supplier found via ONDC/Beckn Protocol")
        logger.info("   ✓ Order approved with WhatsApp interaction")
        logger.info("   ✓ UPI payment link generated")
        logger.info("")
        logger.info("🎯 Key Features Demonstrated:")
        logger.info("   • Multi-language support (Kannada)")
        logger.info("   • Voice-first interface (Zero digital literacy)")
        logger.info("   • Vision-based inventory management")
        logger.info("   • Location-based pricing intelligence")
        logger.info("   • ONDC marketplace integration")
        logger.info("   • Human-in-the-loop approval")
        logger.info("   • Instant value (UPI QR, payment links)")
        logger.info("")
        logger.info("⏱️  Total demo duration: ~10 minutes")
        logger.info("=" * 60)
        
        await self.orchestrator.stop()


async def main():
    """Main entry point for demo"""
    demo = BharatAgentDemo()
    await demo.run_demo()


if __name__ == "__main__":
    # Enable demo mode
    import os
    os.environ["DEMO_MODE"] = "true"
    
    # Run demo
    asyncio.run(main())
