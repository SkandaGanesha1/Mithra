"""
Data models for BharatAgent system
"""
from enum import Enum
from typing import Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class LanguageCode(str, Enum):
    """Supported language codes"""
    KANNADA = "kannada"
    HINDI = "hindi"
    TAMIL = "tamil"
    ENGLISH = "english"


class AgentType(str, Enum):
    """Types of specialized agents"""
    ONBOARDING = "onboarding"
    INVENTORY = "inventory"
    PRICING = "pricing"
    SUPPLIER = "supplier"
    COMPLIANCE = "compliance"


class MessageType(str, Enum):
    """Types of messages in the system"""
    VOICE = "voice"
    IMAGE = "image"
    TEXT = "text"


class ShopProfile(BaseModel):
    """Shop profile data model"""
    shop_id: str = Field(..., description="Unique shop identifier")
    business_name: str = Field(..., description="Business name")
    owner_name: str = Field(..., description="Owner name")
    location: Dict[str, float] = Field(..., description="GPS coordinates")
    address: str = Field(..., description="Full address")
    phone_number: str = Field(..., description="WhatsApp number")
    preferred_language: LanguageCode = Field(default=LanguageCode.ENGLISH)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    upi_id: Optional[str] = None
    neighborhood_type: Optional[str] = None  # e.g., "high-income", "wholesale"


class InventoryItem(BaseModel):
    """Inventory item data model"""
    item_id: str = Field(..., description="Unique item identifier")
    shop_id: str = Field(..., description="Associated shop ID")
    product_name: str = Field(..., description="Product name")
    brand: str = Field(..., description="Brand name")
    variant: str = Field(..., description="Product variant/size")
    quantity: int = Field(..., description="Current quantity")
    reorder_threshold: int = Field(default=10, description="Minimum stock level")
    price: float = Field(..., description="Selling price")
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    burn_rate: Optional[float] = None  # Units per day
    

class PricingRecommendation(BaseModel):
    """Pricing recommendation from Pricing Agent"""
    item_id: str
    shop_id: str
    current_price: float
    recommended_price: float
    competitor_prices: List[float]
    strategy: str  # "premium" or "volume"
    reasoning: str
    nearby_stores: int
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SupplierOrder(BaseModel):
    """Supplier order data model"""
    order_id: str
    shop_id: str
    item_id: str
    quantity: int
    supplier_name: str
    supplier_contact: Optional[str] = None
    unit_price: float
    total_amount: float
    status: str  # "draft", "pending", "approved", "completed"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = None


class AgentMessage(BaseModel):
    """Message passed between agents"""
    message_id: str
    from_agent: AgentType
    to_agent: AgentType
    message_type: str
    payload: Dict
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    priority: int = Field(default=0, description="Message priority (higher = more urgent)")


class VoiceInput(BaseModel):
    """Voice input from user"""
    audio_url: str
    detected_language: Optional[LanguageCode] = None
    transcript: Optional[str] = None
    shop_id: Optional[str] = None


class ImageInput(BaseModel):
    """Image input from user"""
    image_url: str
    shop_id: str
    detected_items: Optional[List[Dict]] = None
    analysis_timestamp: Optional[datetime] = None


class FestivalAlert(BaseModel):
    """Festival-based stocking alert"""
    festival_name: str
    date: datetime
    days_until: int
    recommended_items: List[str]
    shop_id: str
