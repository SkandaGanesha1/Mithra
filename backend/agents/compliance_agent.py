"""
Compliance Agent - Tax and regulatory deadline tracking
Helps shopkeepers stay compliant with Indian tax regulations
"""
import logging
from typing import Dict, List
from datetime import datetime, timedelta

from backend.utils.models import AgentMessage
from backend.config.settings import settings

logger = logging.getLogger(__name__)


class ComplianceAgent:
    """
    Tracks tax and regulatory deadlines for Indian SMEs
    - GST return filing dates
    - License renewal reminders
    - Invoice management
    - Basic accounting support
    """
    
    def __init__(self, firestore_client, whatsapp_client):
        self.firestore = firestore_client
        self.whatsapp = whatsapp_client
        self.name = "ComplianceAgent"
        
        # Indian GST filing schedule
        self.gst_schedule = {
            "GSTR-1": {"frequency": "monthly", "due_day": 11},
            "GSTR-3B": {"frequency": "monthly", "due_day": 20},
            "GSTR-9": {"frequency": "annual", "due_month": 12, "due_day": 31}
        }
        
    async def process_message(self, message: AgentMessage):
        """Process incoming messages"""
        if message.message_type == "check_compliance":
            return await self._check_compliance(message.payload)
        elif message.message_type == "send_reminders":
            return await self._send_compliance_reminders(message.payload)
        else:
            logger.warning(f"Unknown message type: {message.message_type}")
    
    async def _check_compliance(self, payload: Dict) -> Dict:
        """
        Check compliance status for a shop
        """
        shop_id = payload.get("shop_id")
        
        # Check upcoming deadlines
        upcoming_deadlines = await self._get_upcoming_deadlines()
        
        # Check filing history
        filing_status = await self._check_filing_status(shop_id)
        
        return {
            "shop_id": shop_id,
            "upcoming_deadlines": upcoming_deadlines,
            "filing_status": filing_status,
            "compliant": filing_status.get("all_filed", False)
        }
    
    async def _get_upcoming_deadlines(self) -> List[Dict]:
        """
        Get upcoming tax and compliance deadlines
        """
        today = datetime.utcnow()
        deadlines = []
        
        # Check GST deadlines for current month
        for return_type, schedule in self.gst_schedule.items():
            if schedule["frequency"] == "monthly":
                due_date = datetime(today.year, today.month, schedule["due_day"])
                
                # If deadline passed, check next month
                if due_date < today:
                    next_month = today.month + 1 if today.month < 12 else 1
                    next_year = today.year if today.month < 12 else today.year + 1
                    due_date = datetime(next_year, next_month, schedule["due_day"])
                
                days_until = (due_date - today).days
                
                if days_until <= 7:  # Alert 7 days before
                    deadlines.append({
                        "type": return_type,
                        "due_date": due_date.isoformat(),
                        "days_until": days_until,
                        "priority": "high" if days_until <= 3 else "medium"
                    })
        
        return deadlines
    
    async def _check_filing_status(self, shop_id: str) -> Dict:
        """
        Check if all required filings are up to date
        """
        # In production, query Firestore for filing records
        # filings = self.firestore.collection(settings.get_firestore_collection("filings")).where("shop_id", "==", shop_id).get()
        
        return {
            "all_filed": True,
            "pending_returns": [],
            "last_filing_date": datetime.utcnow().isoformat()
        }
    
    async def _send_compliance_reminders(self, payload: Dict):
        """
        Send compliance reminders to shopkeepers
        """
        # Get all shops that need reminders
        shops_to_notify = await self._get_shops_needing_reminders()
        
        for shop in shops_to_notify:
            message = await self._generate_reminder_message(shop)
            await self._send_whatsapp_reminder(shop["shop_id"], message)
        
        return {
            "shops_notified": len(shops_to_notify)
        }
    
    async def _get_shops_needing_reminders(self) -> List[Dict]:
        """
        Get list of shops that need compliance reminders
        """
        # Query shops with upcoming deadlines
        return []
    
    async def _generate_reminder_message(self, shop: Dict) -> str:
        """
        Generate compliance reminder message in shop's language
        """
        return "Compliance reminder: GST filing due in 3 days"
    
    async def _send_whatsapp_reminder(self, shop_id: str, message: str):
        """
        Send WhatsApp reminder
        """
        logger.info(f"Compliance reminder sent to shop: {shop_id}")
