# BharatAgent - System Architecture

## Overview
BharatAgent is a multi-agent AI system designed specifically for Indian Kirana stores. The system requires zero digital literacy and operates through voice-first (WhatsApp) and vision-based (image) interfaces.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        WhatsApp Business API                      │
│                    (Primary User Interface)                       │
└───────────────┬─────────────────────────────────┬───────────────┘
                │                                 │
        Voice Input                        Image Input
                │                                 │
                ▼                                 ▼
┌───────────────────────────────────────────────────────────────────┐
│                     Central Orchestrator                          │
│              (Message Routing & Coordination)                     │
│            Gemini 3 Pro - 1M Token Context                        │
└─────┬──────┬──────┬──────┬──────┬─────────────────────────────┘
      │      │      │      │      │
      ▼      ▼      ▼      ▼      ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│Onboarding│ │Inventory │ │ Pricing  │ │ Supplier │ │Compliance│
│  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
     │            │             │             │            │
     ▼            ▼             ▼             ▼            ▼
┌────────────────────────────────────────────────────────────────┐
│                    Firebase Firestore                           │
│        (Real-time Database for Shops, Inventory, Orders)        │
└────────────────────────────────────────────────────────────────┘
```

## Agent Responsibilities

### 1. Onboarding Agent
- **Input**: Voice messages via WhatsApp
- **Tasks**:
  - Language detection (Kannada, Hindi, Tamil, English)
  - Speech-to-text transcription
  - Extract business information (name, owner, location)
  - Verify location via Google Maps
  - Generate UPI QR code
- **Output**: Shop profile created, instant UPI payment solution

### 2. Inventory Agent
- **Input**: Shelf images via WhatsApp
- **Tasks**:
  - Gemini Vision analysis for product detection
  - Identify brand, variant, size, quantity
  - Compare against reorder thresholds
  - Calculate burn rate from sales history
  - Trigger supplier orders when urgent
- **Output**: Updated inventory, restock recommendations

### 3. Pricing Agent
- **Input**: Shop location, product IDs
- **Tasks**:
  - Query Google Maps for nearby competitors
  - Analyze neighborhood type (high-income, wholesale, etc.)
  - Compare competitor prices
  - Generate pricing strategy (premium vs volume)
  - Check festival calendar for seasonal stocking
- **Output**: Pricing recommendations, festival alerts

### 4. Supplier Agent
- **Input**: Restock requests from Inventory Agent
- **Tasks**:
  - Search wholesalers via ONDC/Beckn protocol
  - Compare suppliers (price, rating, distance)
  - Draft order in shopkeeper's language
  - Send WhatsApp approval request
  - Generate UPI payment link on approval
- **Output**: Purchase orders, payment links

### 5. Compliance Agent
- **Input**: Shop tax/regulatory information
- **Tasks**:
  - Track GST filing deadlines
  - Send reminders for tax returns
  - Monitor license renewals
  - Basic accounting support
- **Output**: Compliance reminders, filing status

## Data Flow

### Onboarding Flow
```
Voice (Kannada) → Language Detection → Transcription → 
Information Extraction → Location Verification → 
Profile Creation → UPI QR Generation → WhatsApp Response
```

### Inventory Flow
```
Shelf Image → Gemini Vision Analysis → Product Detection → 
Quantity Count → Threshold Check → Burn Rate Calculation → 
Reorder Decision → Supplier Agent Trigger
```

### Order Flow
```
Low Stock Alert → Supplier Search (ONDC) → 
Best Supplier Selection → Draft Order → 
WhatsApp Approval Request → User Confirms → 
UPI Payment Link → Order Execution
```

## Technology Stack

### Backend
- **Language**: Python 3.9+
- **Framework**: Flask (REST API)
- **AI Model**: Google Gemini 3 Pro (1M context)
- **Deployment**: Google Cloud Functions / Vertex AI
- **Region**: Asia-South1 (India)

### Database
- **Primary**: Firebase Firestore (real-time sync)
- **Collections**:
  - `bharat_agent_shops`: Shop profiles
  - `bharat_agent_inventory`: Inventory items
  - `bharat_agent_orders`: Supplier orders
  - `bharat_agent_pricing_recommendations`: Price suggestions
  - `bharat_agent_filings`: Compliance records

### External APIs
- **WhatsApp**: Twilio WhatsApp Business API
- **Maps**: Google Maps Places & Geocoding API
- **Commerce**: ONDC/Beckn Protocol
- **Payments**: UPI Deep Links

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **Purpose**: Secondary admin dashboard

## Key Features

### 1. Zero Digital Literacy
- Voice-first interface (no typing required)
- Image-based inventory (just take a photo)
- Simple Yes/No approvals
- Native language support

### 2. Instant Value Proposition
- UPI QR code on registration
- Payment links for orders
- Immediate pricing insights
- Real-time inventory tracking

### 3. Location Intelligence
- Neighborhood-aware pricing
- Competitor analysis
- Festival-based recommendations
- Local supplier discovery

### 4. Multi-language Support
- Kannada (ಕನ್ನಡ)
- Hindi (हिंदी)
- Tamil (தமிழ்)
- English

### 5. ONDC Integration
- Open Network for Digital Commerce
- Beckn Protocol support
- Wholesale supplier discovery
- Transparent pricing

## Security Considerations

1. **Data Privacy**
   - Shop data encrypted at rest (Firestore)
   - Secure API endpoints (HTTPS)
   - No storage of sensitive payment info

2. **Authentication**
   - WhatsApp number verification
   - OTP-based shop authentication
   - Firebase Authentication

3. **Compliance**
   - GST record keeping
   - Invoice generation
   - Tax calculation support

## Scalability

- **Horizontal scaling**: Cloud Functions auto-scale
- **Database**: Firestore handles millions of concurrent connections
- **Context window**: Gemini 3's 1M tokens handles extensive business history
- **Regional deployment**: Asia-South1 for low latency in India

## Future Enhancements

1. **Credit System**: Digital lending based on transaction history
2. **Loyalty Programs**: Customer engagement via WhatsApp
3. **Analytics Dashboard**: Business insights and trends
4. **Supply Chain**: Direct manufacturer connections
5. **Insurance**: Inventory and business insurance integration
