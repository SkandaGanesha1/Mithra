"""
WhatsApp Business API integration using Twilio
Handles sending and receiving messages via WhatsApp
"""
import logging
from typing import Optional, Dict

try:
    from twilio.rest import Client
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
    logging.warning("Twilio library not installed")

from backend.config.settings import settings

logger = logging.getLogger(__name__)


class WhatsAppService:
    """
    WhatsApp Business API service wrapper
    Uses Twilio for WhatsApp messaging
    """
    
    def __init__(self):
        if TWILIO_AVAILABLE and settings.WHATSAPP_ACCOUNT_SID and settings.WHATSAPP_AUTH_TOKEN:
            self.client = Client(
                settings.WHATSAPP_ACCOUNT_SID,
                settings.WHATSAPP_AUTH_TOKEN
            )
            self.from_number = settings.WHATSAPP_FROM_NUMBER
        else:
            self.client = None
            logger.warning("WhatsApp credentials not configured or Twilio not available")
    
    def send_message(self, to_number: str, message: str, media_url: Optional[str] = None) -> Dict:
        """
        Send WhatsApp message to user
        
        Args:
            to_number: Recipient phone number (format: +91XXXXXXXXXX)
            message: Text message to send
            media_url: Optional media URL (image, audio, etc.)
        
        Returns:
            Dict with message SID and status
        """
        if not self.client:
            logger.warning("WhatsApp client not initialized (demo mode)")
            return {"sid": "demo_message_id", "status": "queued"}
        
        try:
            # Format number for WhatsApp
            if not to_number.startswith("whatsapp:"):
                to_number = f"whatsapp:{to_number}"
            
            message_params = {
                "body": message,
                "from_": self.from_number,
                "to": to_number
            }
            
            if media_url:
                message_params["media_url"] = [media_url]
            
            msg = self.client.messages.create(**message_params)
            
            logger.info(f"WhatsApp message sent: {msg.sid}")
            
            return {
                "sid": msg.sid,
                "status": msg.status
            }
        except Exception as e:
            logger.error(f"Error sending WhatsApp message: {e}")
            return {"error": str(e)}
    
    def send_template_message(self, to_number: str, template_name: str, parameters: Dict) -> Dict:
        """
        Send WhatsApp template message (for business notifications)
        
        Args:
            to_number: Recipient phone number
            template_name: Name of approved WhatsApp template
            parameters: Template parameters
        
        Returns:
            Dict with message SID and status
        """
        # Template messages require pre-approval from WhatsApp
        # This is a simplified implementation
        
        logger.info(f"Sending template message: {template_name}")
        
        return self.send_message(to_number, f"Template: {template_name}")


# Global instance
whatsapp_service = WhatsAppService()
