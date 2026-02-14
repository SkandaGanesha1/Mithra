"""
Main Flask application for BharatAgent
Handles WhatsApp webhooks and provides REST API
"""
import asyncio
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

from backend.config.settings import settings
from backend.orchestrator.orchestrator import orchestrator
from backend.agents.onboarding_agent import OnboardingAgent
from backend.agents.inventory_agent import InventoryAgent
from backend.agents.pricing_agent import PricingAgent
from backend.agents.supplier_agent import SupplierAgent
from backend.agents.compliance_agent import ComplianceAgent
from backend.services.gemini_service import gemini_service
from backend.services.firestore_service import firestore_service
from backend.services.whatsapp_service import whatsapp_service
from backend.utils.models import VoiceInput, ImageInput, AgentType

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize agents
def initialize_agents():
    """Initialize and register all agents"""
    logger.info("Initializing BharatAgent system...")
    
    onboarding_agent = OnboardingAgent(
        gemini_client=gemini_service,
        maps_client=None,
        firestore_client=firestore_service
    )
    
    inventory_agent = InventoryAgent(
        gemini_vision_client=gemini_service,
        firestore_client=firestore_service,
        orchestrator=orchestrator
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
        orchestrator=orchestrator
    )
    
    compliance_agent = ComplianceAgent(
        firestore_client=firestore_service,
        whatsapp_client=whatsapp_service
    )
    
    # Register with orchestrator
    orchestrator.register_agent(AgentType.ONBOARDING, onboarding_agent)
    orchestrator.register_agent(AgentType.INVENTORY, inventory_agent)
    orchestrator.register_agent(AgentType.PRICING, pricing_agent)
    orchestrator.register_agent(AgentType.SUPPLIER, supplier_agent)
    orchestrator.register_agent(AgentType.COMPLIANCE, compliance_agent)
    
    logger.info("All agents initialized successfully")


# Routes
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "BharatAgent",
        "version": settings.VERSION
    })


@app.route('/webhook/whatsapp', methods=['POST'])
def whatsapp_webhook():
    """
    WhatsApp webhook endpoint
    Receives messages from WhatsApp Business API
    """
    try:
        data = request.get_json()
        logger.info(f"WhatsApp webhook received: {data}")
        
        # Parse WhatsApp message
        # Handle different message types (text, voice, image)
        
        message_type = data.get('type')
        
        if message_type == 'voice':
            # Handle voice message
            audio_url = data.get('audio_url')
            voice_input = VoiceInput(audio_url=audio_url)
            
            # Process asynchronously
            loop = asyncio.new_event_loop()
            result = loop.run_until_complete(orchestrator.handle_voice_input(voice_input))
            loop.close()
            
            return jsonify(result)
        
        elif message_type == 'image':
            # Handle image message
            image_url = data.get('image_url')
            shop_id = data.get('shop_id')
            image_input = ImageInput(image_url=image_url, shop_id=shop_id)
            
            # Process asynchronously
            loop = asyncio.new_event_loop()
            result = loop.run_until_complete(orchestrator.handle_image_input(image_input))
            loop.close()
            
            return jsonify(result)
        
        elif message_type == 'text':
            # Handle text message (e.g., "Yes"/"No" for order approval)
            text = data.get('text')
            shop_id = data.get('shop_id')
            
            # Process approval logic
            return jsonify({"status": "processed", "text": text})
        
        return jsonify({"status": "ok"})
    
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/shops', methods=['POST'])
def create_shop():
    """Create new shop profile"""
    try:
        data = request.get_json()
        # Validate and create shop
        return jsonify({"status": "created", "shop_id": "shop_123"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/shops/<shop_id>', methods=['GET'])
def get_shop(shop_id):
    """Get shop profile"""
    try:
        # Fetch from Firestore
        shop_data = firestore_service.read(
            settings.get_firestore_collection("shops"),
            shop_id
        )
        
        if shop_data:
            return jsonify(shop_data)
        return jsonify({"error": "Shop not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/inventory/<shop_id>', methods=['GET'])
def get_inventory(shop_id):
    """Get inventory for a shop"""
    try:
        # Query Firestore
        items = firestore_service.query(
            settings.get_firestore_collection("inventory"),
            [("shop_id", "==", shop_id)]
        )
        return jsonify({"items": items})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/orders/<shop_id>', methods=['GET'])
def get_orders(shop_id):
    """Get orders for a shop"""
    try:
        orders = firestore_service.query(
            settings.get_firestore_collection("orders"),
            [("shop_id", "==", shop_id)]
        )
        return jsonify({"orders": orders})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/orders/<order_id>/approve', methods=['POST'])
def approve_order(order_id):
    """Approve an order"""
    try:
        data = request.get_json()
        approved = data.get('approved', False)
        
        # Process approval
        return jsonify({"status": "approved", "order_id": order_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Initialize on startup
with app.app_context():
    initialize_agents()


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=8080,
        debug=settings.DEMO_MODE
    )
