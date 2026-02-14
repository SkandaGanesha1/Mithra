"""
Central Orchestrator for BharatAgent multi-agent system
Manages communication and coordination between specialized agents
"""
import asyncio
import logging
from typing import Dict, Optional, List
from datetime import datetime
import json

from backend.utils.models import (
    AgentMessage, AgentType, ShopProfile, VoiceInput, ImageInput
)
from backend.config.settings import settings

logger = logging.getLogger(__name__)


class AgentOrchestrator:
    """
    Central orchestrator that manages the swarm of specialized agents.
    Routes messages between agents and maintains system state.
    """
    
    def __init__(self):
        self.agents: Dict[AgentType, object] = {}
        self.message_queue: asyncio.Queue = asyncio.Queue()
        self.active = False
        self.context_history: List[Dict] = []  # Long-term context for Gemini
        
    def register_agent(self, agent_type: AgentType, agent_instance):
        """Register a specialized agent with the orchestrator"""
        self.agents[agent_type] = agent_instance
        logger.info(f"Registered agent: {agent_type.value}")
        
    async def route_message(self, message: AgentMessage):
        """Route message to appropriate agent"""
        if message.to_agent not in self.agents:
            logger.error(f"Agent {message.to_agent} not registered")
            return
        
        # Add to context history for Gemini
        self.context_history.append({
            "timestamp": message.timestamp.isoformat(),
            "from": message.from_agent.value,
            "to": message.to_agent.value,
            "type": message.message_type,
            "payload": message.payload
        })
        
        # Limit context to last 1000 messages (within 1M token window)
        if len(self.context_history) > 1000:
            self.context_history = self.context_history[-1000:]
        
        target_agent = self.agents[message.to_agent]
        await target_agent.process_message(message)
        
    async def handle_voice_input(self, voice_input: VoiceInput) -> Dict:
        """
        Handle incoming voice input from WhatsApp
        Routes to Onboarding Agent
        """
        logger.info(f"Handling voice input: {voice_input.audio_url}")
        
        message = AgentMessage(
            message_id=f"voice_{datetime.utcnow().timestamp()}",
            from_agent=AgentType.ONBOARDING,  # External input
            to_agent=AgentType.ONBOARDING,
            message_type="voice_input",
            payload=voice_input.dict()
        )
        
        await self.route_message(message)
        return {"status": "processing", "message_id": message.message_id}
    
    async def handle_image_input(self, image_input: ImageInput) -> Dict:
        """
        Handle incoming image input from WhatsApp
        Routes to Inventory Agent
        """
        logger.info(f"Handling image input for shop: {image_input.shop_id}")
        
        message = AgentMessage(
            message_id=f"image_{datetime.utcnow().timestamp()}",
            from_agent=AgentType.INVENTORY,  # External input
            to_agent=AgentType.INVENTORY,
            message_type="image_input",
            payload=image_input.dict()
        )
        
        await self.route_message(message)
        return {"status": "processing", "message_id": message.message_id}
    
    async def trigger_agent_workflow(self, workflow_type: str, data: Dict):
        """
        Trigger specific agent workflows
        """
        workflows = {
            "onboard_shop": self._workflow_onboard,
            "check_inventory": self._workflow_inventory,
            "update_pricing": self._workflow_pricing,
            "place_order": self._workflow_order
        }
        
        if workflow_type in workflows:
            await workflows[workflow_type](data)
        else:
            logger.warning(f"Unknown workflow: {workflow_type}")
    
    async def _workflow_onboard(self, data: Dict):
        """Onboarding workflow: Voice → Profile → UPI Generation"""
        message = AgentMessage(
            message_id=f"workflow_onboard_{datetime.utcnow().timestamp()}",
            from_agent=AgentType.ONBOARDING,
            to_agent=AgentType.ONBOARDING,
            message_type="start_onboarding",
            payload=data
        )
        await self.route_message(message)
    
    async def _workflow_inventory(self, data: Dict):
        """Inventory workflow: Image → Detection → Reorder Check"""
        # First: Inventory Agent processes image
        inv_message = AgentMessage(
            message_id=f"workflow_inv_{datetime.utcnow().timestamp()}",
            from_agent=AgentType.INVENTORY,
            to_agent=AgentType.INVENTORY,
            message_type="analyze_inventory",
            payload=data
        )
        await self.route_message(inv_message)
        
    async def _workflow_pricing(self, data: Dict):
        """Pricing workflow: Location → Competitor Analysis → Strategy"""
        message = AgentMessage(
            message_id=f"workflow_price_{datetime.utcnow().timestamp()}",
            from_agent=AgentType.PRICING,
            to_agent=AgentType.PRICING,
            message_type="analyze_pricing",
            payload=data
        )
        await self.route_message(message)
    
    async def _workflow_order(self, data: Dict):
        """Order workflow: Restock Request → Supplier Search → Approval"""
        message = AgentMessage(
            message_id=f"workflow_order_{datetime.utcnow().timestamp()}",
            from_agent=AgentType.SUPPLIER,
            to_agent=AgentType.SUPPLIER,
            message_type="create_order",
            payload=data
        )
        await self.route_message(message)
    
    def get_context_summary(self) -> str:
        """
        Get summary of context history for Gemini
        This leverages the 1M token context window
        """
        return json.dumps(self.context_history, indent=2)
    
    async def start(self):
        """Start the orchestrator"""
        self.active = True
        logger.info("Orchestrator started")
        
    async def stop(self):
        """Stop the orchestrator"""
        self.active = False
        logger.info("Orchestrator stopped")


# Global orchestrator instance
orchestrator = AgentOrchestrator()
