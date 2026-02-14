# 🚀 Genkit Quick Start Guide

## The "Big Bang" Setup (One Command)

### Step 1: Install Dependencies

```bash
# Backend dependencies
npm install

# Frontend dependencies
cd client && npm install && cd ..
```

### Step 2: Configure API Keys

Create `.env` file in root directory:

```bash
GEMINI_API_KEY=your_api_key_here
FIREBASE_PROJECT_ID=your_project_id
PORT=3001
LOG_LEVEL=info
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

### Step 3: Start Backend Server

```bash
npm run start:genkit
```

You'll see:
```
🚀 Genkit server running on port 3001
🌉 Bhasha Bridge AI - Genkit Server
📍 http://localhost:3001
💚 Health: http://localhost:3001/health
🌉 MasterBridge: POST http://localhost:3001/api/master-bridge
```

### Step 4: Start Frontend (New Terminal)

```bash
cd client
npm start
```

Browser opens at: http://localhost:3000

## The "Wila" Execution - Demo Flow

### 🎬 Hackathon Demo Scenario

1. **Open browser** at http://localhost:3000

2. **Step 1: Capture Video (5 seconds)**
   - Click "📹 Record 5-Second Video"
   - Hold up medicine packet to camera
   - Watch countdown: 5...4...3...2...1
   - ✅ Video captured!

3. **Step 2: Record Audio**
   - Click "🎤 Start Recording"
   - Say in Hindi: **"दादी को ये दवाई कब देनी है?"**
     - (Translation: "When should I give this medicine to grandma?")
   - Click "⏹️ Stop Recording"
   - ✅ Audio recorded!

4. **Step 3: Click "🚀 Generate Answer"**

5. **Watch the Magic! ✨**
   
   Backend logs show:
   ```
   🌉 MasterBridge flow started
   ⚡ Phase 1: Running Vision and Voice agents in PARALLEL
   ✅ Phase 1 Complete - Parallel agents finished
   📍 Phase 2: Running LocationAgent
   ✅ Phase 2 Complete - LocationAgent finished
   🎨 Phase 3: Running UIGenerator
   ✅ Phase 3 Complete - UIGenerator finished
   🎉 MasterBridge flow completed successfully
   ```

6. **Generated UI Appears!**
   
   You see:
   - **Medicine name** in Hindi
   - **☀️ सुबह (Morning)** and **🌙 रात (Night)** dosage icons
   - **�� दादी की देखभाल** (Caring for Grandma)
   - **📞 डॉक्टर को फोन करें** (Call Doctor) button
   - Nearby pharmacies with contact numbers

## Verify Parallel Execution

### Check Backend Logs

Look for these key indicators:

```
⚡ Phase 1: Running Vision and Voice agents in PARALLEL
```

This confirms Vision and Voice are running simultaneously!

### Timing Verification

Check processing time:
```
⏱️ Processed in 1234ms
```

Parallel execution makes it fast!

## Test Individual Agents

### Test VisionAgent

```bash
curl -X POST http://localhost:3001/api/test-vision \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "your_base64_here", "mimeType": "image/jpeg"}'
```

### Test VoiceAgent

```bash
curl -X POST http://localhost:3001/api/test-voice \
  -H "Content-Type: application/json" \
  -d '{"audioBase64": "your_base64_here", "mimeType": "audio/mp3"}'
```

### Test LocationAgent

```bash
curl -X POST http://localhost:3001/api/test-location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 19.0760, "longitude": 72.8777, "intent": "healthcare"}'
```

## Visual Flow Graph

```
┌─────────────────────────────────────────────┐
│                                             │
│         USER CAPTURES VIDEO + AUDIO        │
│                                             │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│                                             │
│           MASTER BRIDGE FLOW                │
│                                             │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │   PHASE 1: PARALLEL │
        │        ⚡            │
        └─────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│  VisionAgent     │  │  VoiceAgent      │
│  (Gemini 1.5 Pro)│  │  (Gemini 1.5     │
│                  │  │   Flash)         │
│  Identifies:     │  │  Transcribes:    │
│  • Medicine      │  │  • Hindi text    │
│  • Crop disease  │  │  • Language      │
│  • Documents     │  │  • Sentiment     │
└──────────────────┘  └──────────────────┘
         │                 │
         └────────┬────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  PHASE 2: LOCATION  │
        │        📍           │
        └─────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────┐
│       LocationAgent                  │
│                                      │
│  Finds nearby:                       │
│  • Hospitals (सरकारी अस्पताल)       │
│  • Doctors (डॉक्टर क्लिनिक)         │
│  • Pharmacies (मेडिकल स्टोर)        │
│  • Emergency services                │
└──────────────────────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │   PHASE 3: UI GEN   │
        │        🎨           │
        └─────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────┐
│         UIGenerator                  │
│         (Gemini 1.5 Pro)            │
│                                      │
│  Generates:                          │
│  • React Component                   │
│  • In detected language (Hindi)      │
│  • Sentiment-based styling           │
│  • Emergency mode if urgent          │
│  • Dosage icons ☀️🌙                │
│  • Call buttons 📞                   │
└──────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│                                             │
│      GENERATED UI DISPLAYED                 │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  💊 Medicine Information           │   │
│  │                                     │   │
│  │  Paracetamol 500mg                 │   │
│  │  (पैरासिटामोल)                     │   │
│  │                                     │   │
│  │  ☀️ सुबह (Morning)  🌙 रात (Night) │   │
│  │                                     │   │
│  │  👵 दादी की देखभाल                │   │
│  │                                     │   │
│  │  📞 डॉक्टर को फोन करें             │   │
│  │  🚑 आपातकालीन सेवाएं               │   │
│  │                                     │   │
│  │  📍 Nearby Pharmacies:             │   │
│  │  • मेडिकल स्टोर (0.5 km)           │   │
│  │  • डॉक्टर क्लिनिक (0.8 km)         │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Troubleshooting

### Camera/Microphone Not Working

✅ **Solution**: Grant browser permissions
- Chrome: Click 🔒 icon in address bar → Camera/Microphone → Allow

### API Key Error

✅ **Solution**: Check `.env` file has valid GEMINI_API_KEY

### Port Already in Use

✅ **Solution**: Change PORT in `.env` file
```env
PORT=3002
```

### Module Not Found

✅ **Solution**: Install dependencies
```bash
npm install
cd client && npm install
```

## Demo Tips

### Best Results

1. **Good Lighting**: Ensure medicine/object is well-lit
2. **Clear Speech**: Speak clearly in Hindi
3. **Hold Still**: Keep camera steady for 5 seconds
4. **Close to Camera**: Hold object 30-50cm from camera

### Example Queries (Hindi)

- "यह दवाई कब लेनी है?" (When to take this medicine?)
- "दादी को ये दवाई कितनी बार देनी है?" (How many times to give grandma this medicine?)
- "यह दवाई किस लिए है?" (What is this medicine for?)
- "डॉक्टर को कब दिखाना है?" (When to show to doctor?)

### Expected Sentiments

- **Urgent**: Fast speech, emergency keywords → Red buttons
- **Confused**: Questions → Step-by-step guidance
- **Calm**: Normal → Clean, simple UI

## Success Indicators

✅ Video recorded (5 seconds with countdown)  
✅ Audio recorded (duration shown)  
✅ Location detected automatically  
✅ Backend logs show "PARALLEL" execution  
✅ Processing time < 5 seconds  
✅ UI generated in Hindi  
✅ Medicine dosage icons displayed  
✅ Nearby services shown  
✅ Call buttons active

## Next Steps

1. ✅ Test with different medicines
2. ✅ Try other languages (Tamil, Bengali, etc.)
3. ✅ Test emergency scenarios
4. ✅ Verify parallel execution timing
5. ✅ Customize UI prompts for specific use cases

---

**🎉 You're Ready for the Hackathon Demo!**

Built with ❤️ for Google Gemini Hackathon 2026
