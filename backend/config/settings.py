"""
Configuration settings for BharatAgent system
"""
import os
from typing import Dict, List
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Central configuration for BharatAgent"""
    
    # Project metadata
    PROJECT_NAME = "BharatAgent"
    VERSION = "1.0.0"
    
    # AI Model configuration
    MODEL_NAME = "gemini-3-pro"
    CONTEXT_WINDOW = 1_000_000  # 1M tokens
    VISION_MODEL = "gemini-3-pro-vision"
    
    # Supported languages
    SUPPORTED_LANGUAGES: List[str] = ["kannada", "hindi", "tamil", "english"]
    DEFAULT_LANGUAGE = "english"
    
    # Google Cloud
    GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "bharat-agent")
    GCP_REGION = os.getenv("GCP_REGION", "asia-south1")
    
    # Firebase
    FIREBASE_CREDS_PATH = os.getenv("FIREBASE_CREDS_PATH", "config/firebase-creds.json")
    FIRESTORE_COLLECTION_PREFIX = "bharat_agent"
    
    # WhatsApp Business API
    WHATSAPP_API_URL = os.getenv("WHATSAPP_API_URL", "https://api.twilio.com/2010-04-01")
    WHATSAPP_ACCOUNT_SID = os.getenv("WHATSAPP_ACCOUNT_SID")
    WHATSAPP_AUTH_TOKEN = os.getenv("WHATSAPP_AUTH_TOKEN")
    WHATSAPP_FROM_NUMBER = os.getenv("WHATSAPP_FROM_NUMBER")
    
    # Google Maps API
    GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
    MAPS_SEARCH_RADIUS = 500  # meters
    
    # ONDC/Beckn Protocol
    ONDC_GATEWAY_URL = os.getenv("ONDC_GATEWAY_URL", "https://pilot-gateway-1.beckn.nsdl.co.in")
    BECKN_NETWORK_ID = os.getenv("BECKN_NETWORK_ID")
    
    # Agent thresholds
    INVENTORY_REORDER_THRESHOLD = 10  # minimum stock units
    PRICE_CHECK_INTERVAL_HOURS = 24
    COMPLIANCE_CHECK_DAYS = 7
    
    # Indian festivals calendar
    FESTIVALS: Dict[str, List[str]] = {
        "deepavali": ["oil", "lamps", "sweets", "firecrackers", "rangoli"],
        "holi": ["colors", "sweets", "water_guns"],
        "dussehra": ["sweets", "fruits", "flowers"],
        "pongal": ["rice", "jaggery", "sugarcane"],
        "onam": ["flowers", "vegetables", "banana_leaves"]
    }
    
    # Demo mode
    DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"
    
    @classmethod
    def get_firestore_collection(cls, collection_name: str) -> str:
        """Get full Firestore collection name with prefix"""
        return f"{cls.FIRESTORE_COLLECTION_PREFIX}_{collection_name}"


settings = Settings()
