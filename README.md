# BharatAgent - Autonomous Business Operating System for Indian SMEs

## Overview
BharatAgent is a multi-agent AI system designed for Indian Kirana stores that requires zero digital literacy. It uses voice-first interactions (Kannada, Hindi, Tamil, English) and image-based inventory management.

## Architecture

### Core Components
- **Model**: Gemini 3 Pro with 1M token context window for long-term business history
- **Input**: Voice-first (multi-language) and Image-based (inventory photos, receipts)
- **Orchestration**: Central Orchestrator managing specialized agent swarm

### Specialized Agents
1. **Onboarding Agent**: WhatsApp-based voice bot for shopkeeper profiling
2. **Inventory Agent**: Vision-to-JSON for shelf image analysis and stockout detection
3. **Pricing Agent**: Search and Maps data for competitive local pricing
4. **Supplier Agent**: ONDC/Beckn protocol integration for supplier identification
5. **Compliance Agent**: Tax and regulatory deadline tracking

### Tech Stack
- **Backend**: Google Cloud Functions / Vertex AI
- **Database**: Firebase Firestore for real-time sync
- **Frontend**: WhatsApp Business API (primary), React dashboard (secondary)
- **AI Model**: Gemini 3 Pro (Vision + Language)

## Project Structure
```
├── backend/
│   ├── agents/          # Specialized agent implementations
│   ├── orchestrator/    # Central orchestrator
│   ├── services/        # External service integrations
│   ├── config/          # Configuration files
│   └── utils/           # Utility functions
├── frontend/
│   ├── dashboard/       # React admin dashboard
│   └── whatsapp/        # WhatsApp Business API integration
├── database/
│   └── schemas/         # Firestore schemas
├── demo/                # Demo simulation scripts
└── docs/                # Documentation

```

## Setup

### Prerequisites
- Python 3.9+
- Node.js 16+
- Firebase account
- Google Cloud account
- WhatsApp Business API access

### Installation
```bash
# Backend setup
pip install -r requirements.txt

# Frontend setup
cd frontend/dashboard
npm install
```

## Demo Mode
Run the end-to-end demo:
```bash
python demo/demo_script.py
```

## License
MIT License - see LICENSE file for details
