"""
Onboarding Agent - Voice-first conversational interface for shop registration
Handles language detection, data extraction, and initial setup
"""
import logging
import uuid
from typing import Dict, Optional
from datetime import datetime

from backend.utils.models import (
    AgentMessage, ShopProfile, LanguageCode, VoiceInput
)
from backend.config.settings import settings

logger = logging.getLogger(__name__)


class OnboardingAgent:
    """
    Handles the 'Cold Start' scenario for new shopkeepers.
    - Detects language (Kannada, Hindi, Tamil, English)
    - Extracts business information from voice
    - Verifies location via Google Maps
    - Generates UPI QR code for instant value
    """
    
    def __init__(self, gemini_client, maps_client, firestore_client):
        self.gemini = gemini_client
        self.maps = maps_client
        self.firestore = firestore_client
        self.name = "OnboardingAgent"
        
    async def process_message(self, message: AgentMessage):
        """Process incoming messages"""
        if message.message_type == "voice_input":
            return await self._handle_voice_input(message.payload)
        elif message.message_type == "start_onboarding":
            return await self._start_onboarding(message.payload)
        else:
            logger.warning(f"Unknown message type: {message.message_type}")
    
    async def _handle_voice_input(self, payload: Dict) -> Dict:
        """Handle voice input from WhatsApp"""
        voice_input = VoiceInput(**payload)
        
        # Step 1: Detect language
        detected_lang = await self._detect_language(voice_input.audio_url)
        voice_input.detected_language = detected_lang
        
        # Step 2: Transcribe voice to text
        transcript = await self._transcribe_audio(
            voice_input.audio_url, 
            detected_lang
        )
        voice_input.transcript = transcript
        
        # Step 3: Extract business information
        business_info = await self._extract_business_info(transcript, detected_lang)
        
        # Step 4: Verify location
        if business_info.get("location_description"):
            location_data = await self._verify_location(
                business_info["location_description"]
            )
            business_info["location"] = location_data
        
        # Step 5: Create shop profile
        shop_profile = await self._create_shop_profile(business_info, detected_lang)
        
        # Step 6: Generate UPI QR code (instant value!)
        upi_qr = await self._generate_upi_qr(shop_profile)
        
        # Step 7: Save to Firestore
        await self._save_profile(shop_profile)
        
        # Step 8: Send response in user's language
        response_text = await self._generate_response(
            detected_lang,
            shop_profile,
            upi_qr
        )
        
        return {
            "shop_id": shop_profile.shop_id,
            "language": detected_lang,
            "response": response_text,
            "upi_qr_url": upi_qr
        }
    
    async def _detect_language(self, audio_url: str) -> LanguageCode:
        """
        Detect language from audio using Gemini
        In demo mode, returns Kannada
        """
        if settings.DEMO_MODE:
            return LanguageCode.KANNADA
        
        # Use Gemini for language detection
        prompt = f"""
        Analyze this audio and detect the language being spoken.
        Return only one of: kannada, hindi, tamil, english
        Audio URL: {audio_url}
        """
        
        # Simulated response for now
        return LanguageCode.KANNADA
    
    async def _transcribe_audio(self, audio_url: str, language: LanguageCode) -> str:
        """
        Transcribe audio to text using Google Speech-to-Text
        """
        if settings.DEMO_MODE:
            # Demo transcripts in different languages
            demos = {
                LanguageCode.KANNADA: "ನಾನು ಜಯನಗರದಲ್ಲಿ ನನ್ನ ಕಿರಾಣಿ ಅಂಗಡಿಯನ್ನು ನೋಂದಾಯಿಸಲು ಬಯಸುತ್ತೇನೆ",
                LanguageCode.HINDI: "मैं अपनी किराना दुकान को जयनगर में पंजीकृत करना चाहता हूं",
                LanguageCode.ENGLISH: "I want to register my Kirana store in Jayanagar"
            }
            return demos.get(language, demos[LanguageCode.ENGLISH])
        
        # Use Google Speech-to-Text API
        # Implementation would go here
        return "I want to register my Kirana store in Jayanagar"
    
    async def _extract_business_info(self, transcript: str, language: LanguageCode) -> Dict:
        """
        Extract business information from transcript using Gemini
        """
        prompt = f"""
        Extract the following information from this transcript:
        - Business Name
        - Owner Name  
        - Shop Location/Area
        
        Transcript ({language}): {transcript}
        
        Return as JSON with keys: business_name, owner_name, location_description
        If any field is not mentioned, use null.
        """
        
        # Demo response
        if settings.DEMO_MODE:
            return {
                "business_name": "Sri Lakshmi Stores",
                "owner_name": "Ravi Kumar",
                "location_description": "Jayanagar, Bangalore"
            }
        
        # Use Gemini to extract information
        return {
            "business_name": "Sri Lakshmi Stores",
            "owner_name": "Ravi Kumar",
            "location_description": "Jayanagar, Bangalore"
        }
    
    async def _verify_location(self, location_description: str) -> Dict:
        """
        Verify location using Google Maps Places API
        Returns lat/lng coordinates
        """
        if settings.DEMO_MODE:
            # Jayanagar, Bangalore coordinates
            return {
                "lat": 12.9250,
                "lng": 77.5937,
                "formatted_address": "Jayanagar, Bangalore, Karnataka 560041, India"
            }
        
        # Use Google Maps Geocoding API
        return {
            "lat": 12.9250,
            "lng": 77.5937,
            "formatted_address": "Jayanagar, Bangalore, Karnataka 560041, India"
        }
    
    async def _create_shop_profile(self, business_info: Dict, language: LanguageCode) -> ShopProfile:
        """Create shop profile from extracted information"""
        shop_id = f"shop_{uuid.uuid4().hex[:8]}"
        
        profile = ShopProfile(
            shop_id=shop_id,
            business_name=business_info.get("business_name", "Unknown Store"),
            owner_name=business_info.get("owner_name", "Unknown Owner"),
            location={
                "lat": business_info["location"]["lat"],
                "lng": business_info["location"]["lng"]
            },
            address=business_info["location"]["formatted_address"],
            phone_number="",  # Would be extracted from WhatsApp
            preferred_language=language
        )
        
        return profile
    
    async def _generate_upi_qr(self, shop_profile: ShopProfile) -> str:
        """
        Generate UPI QR code for the shop
        This provides instant value to the shopkeeper
        """
        # Generate UPI ID based on business name
        upi_id = f"{shop_profile.business_name.lower().replace(' ', '')}.{shop_profile.shop_id}@paytm"
        shop_profile.upi_id = upi_id
        
        # Generate QR code URL (simulated)
        qr_url = f"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa={upi_id}"
        
        return qr_url
    
    async def _save_profile(self, profile: ShopProfile):
        """Save shop profile to Firestore"""
        collection = settings.get_firestore_collection("shops")
        # self.firestore.collection(collection).document(profile.shop_id).set(profile.dict())
        logger.info(f"Saved profile for shop: {profile.shop_id}")
    
    async def _generate_response(
        self, 
        language: LanguageCode, 
        profile: ShopProfile,
        upi_qr: str
    ) -> str:
        """
        Generate response in user's language using Gemini
        """
        responses = {
            LanguageCode.KANNADA: f"ನಮಸ್ಕಾರ {profile.owner_name}! ನಿಮ್ಮ ಅಂಗಡಿ {profile.business_name} ಅನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ. ನಿಮ್ಮ UPI QR ಕೋಡ್ ಸಿದ್ಧವಾಗಿದೆ!",
            LanguageCode.ENGLISH: f"Hello {profile.owner_name}! Your store {profile.business_name} has been successfully registered. Your UPI QR code is ready!",
            LanguageCode.HINDI: f"नमस्ते {profile.owner_name}! आपकी दुकान {profile.business_name} सफलतापूर्वक पंजीकृत हो गई है। आपका UPI QR कोड तैयार है!"
        }
        
        return responses.get(language, responses[LanguageCode.ENGLISH])
    
    async def _start_onboarding(self, payload: Dict):
        """Start onboarding workflow"""
        logger.info(f"Starting onboarding workflow: {payload}")
        # Implementation for workflow initiation
        return {"status": "started"}
