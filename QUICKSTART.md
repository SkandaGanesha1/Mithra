# Quick Start Guide - BharatAgent

Get BharatAgent running in 5 minutes!

## Prerequisites

- Python 3.9+ installed
- Git installed

## Quick Setup

### 1. Clone and Install (2 minutes)

```bash
# Clone repository
git clone https://github.com/SkandaGanesha1/Mithra.git
cd Mithra

# Install Python dependencies
pip install python-dotenv pydantic

# Optional: Install all dependencies (for production)
# pip install -r requirements.txt
```

### 2. Run Demo (1 minute)

```bash
# Run the complete demo simulation
python demo/demo_script.py
```

You should see:
```
🎬 Starting End-to-End Demo Simulation
============================================================

📱 STEP 1: Onboarding - Voice Registration
------------------------------------------------------------
👤 User: Sends voice note in Kannada
   🎤 Audio: 'ನಾನು ಜಯನಗರದಲ್ಲಿ ನನ್ನ ಕಿರಾಣಿ ಅಂಗಡಿಯನ್ನು ನೋಂದಾಯಿಸಲು ಬಯಸುತ್ತೇನೆ'
   
🤖 Agent Response:
   ✓ Language detected: Kannada
   ✓ Business: Sri Lakshmi Stores
   ✓ Owner: Ravi Kumar
   ✓ Location verified: Jayanagar, Bangalore
   ✓ UPI QR Code generated!

... (complete workflow) ...

✨ DEMO COMPLETED SUCCESSFULLY!
```

## What the Demo Does

The demo simulates a complete Kirana store workflow:

1. **Voice Registration** (Kannada)
   - Shop registered: "Sri Lakshmi Stores"
   - Location verified: Jayanagar, Bangalore
   - UPI QR code generated instantly

2. **Inventory Management** (Image)
   - Detects: Maggi noodles (5 packets left)
   - Alert: Below reorder threshold (10 packets)
   - Action: Triggers supplier order

3. **Pricing Intelligence** (Location)
   - Finds 3 competitors within 500m
   - Analysis: High-income neighborhood
   - Strategy: Premium pricing at ₹12/pack
   - Bonus: Deepavali festival alert

4. **Supplier Integration** (ONDC)
   - Searches 3 wholesalers
   - Best match: Krishna Distributors (₹10/unit)
   - Order: 50 packets for ₹500
   - WhatsApp message sent (Kannada)

5. **Order Approval** (Human-in-Loop)
   - User replies: "ಹೌದು" (Yes)
   - UPI payment link generated
   - Order placed successfully

## Understanding the Output

### Key Indicators

- ✓ = Success
- ⚠️ = Warning/Alert
- 🤖 = AI Agent Response
- 📱 = WhatsApp Message
- 💰 = Money/Payment
- 📦 = Order/Inventory

### Languages Demonstrated

- **Kannada**: ನಮಸ್ಕಾರ (Hello)
- **English**: Translations provided
- **System**: Fully bilingual responses

## Next Steps

### For Hackathon Demo

1. **Keep demo mode**: Just run the script
2. **Show the output**: It's impressive as-is
3. **Highlight features**: 
   - Voice-first (zero digital literacy)
   - Vision-based inventory
   - Location intelligence
   - WhatsApp integration
   - UPI payments

### For Production Setup

1. **Get API Keys** (see DEPLOYMENT.md):
   - Google Cloud Project
   - Firebase credentials
   - WhatsApp Business API (Twilio)
   - Google Maps API

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Install All Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Deploy to Cloud** (see DEPLOYMENT.md):
   ```bash
   gcloud functions deploy bharat-agent-api ...
   ```

## Architecture Overview

```
WhatsApp (Voice/Image)
         ↓
   Orchestrator
    ↙  ↓  ↘  ↓  ↘
   O   I   P   S   C    ← Agents
   ↓   ↓   ↓   ↓   ↓
      Firebase
```

**O** = Onboarding | **I** = Inventory | **P** = Pricing | **S** = Supplier | **C** = Compliance

## Troubleshooting

### "ModuleNotFoundError: No module named 'backend'"
```bash
# Make sure you're in the right directory
cd /path/to/Mithra
python demo/demo_script.py
```

### "No module named 'dotenv'"
```bash
pip install python-dotenv pydantic
```

### Demo runs but shows warnings
**This is normal!** Warnings like "Firebase not installed" or "Twilio not installed" are expected in demo mode. The demo simulates everything.

## Files to Explore

1. **demo/demo_script.py** - See how it all works
2. **backend/agents/** - Individual agent implementations
3. **backend/orchestrator/orchestrator.py** - Message routing
4. **docs/ARCHITECTURE.md** - System design details
5. **docs/SUMMARY.md** - Complete implementation overview

## Features Highlight

### Zero Digital Literacy
- ✅ Voice-only input (no typing)
- ✅ Image-only inventory (no data entry)
- ✅ Yes/No approvals (simple decisions)
- ✅ Native languages (Kannada, Hindi, Tamil)

### AI-Powered
- ✅ Gemini Vision (shelf → inventory)
- ✅ Language understanding (voice → data)
- ✅ Location intelligence (maps → strategy)
- ✅ Smart recommendations (festivals, pricing)

### India-Specific
- ✅ ONDC marketplace
- ✅ UPI payments
- ✅ GST compliance
- ✅ Kirana store focused

## Demo Duration

- **Setup**: 2 minutes (install dependencies)
- **Run Demo**: 30 seconds (end-to-end simulation)
- **Total**: Under 3 minutes to see it working!

## Questions?

Check the documentation:
- **README.md** - Overview
- **ARCHITECTURE.md** - Technical details
- **DEPLOYMENT.md** - Production setup
- **SUMMARY.md** - Complete feature list

## Success Criteria

✅ Demo runs without errors
✅ All 5 steps complete
✅ Kannada text displays correctly
✅ Order placed successfully
✅ UPI link generated

---

**Ready to demo?** Just run: `python demo/demo_script.py` 🚀
